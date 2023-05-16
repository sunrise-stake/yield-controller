import { AnchorProvider, Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Connection } from "@solana/web3.js";
import BN from "bn.js";
import { BuyBurnFixed, IDL } from "../types/buy_burn_fixed";

export const PROGRAM_ID = new PublicKey(
  "stcGmoLCBsr2KSu2vvcSuqMiEZx36F32ySUtCXjab5B"
);

export const setUpAnchor = (): anchor.AnchorProvider => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  anchor.setProvider(provider);

  return provider;
};

export const confirm = (connection: Connection) => async (txSig: string) =>
  connection.confirmTransaction({
    signature: txSig,
    ...(await connection.getLatestBlockhash()),
  });

export interface BuyBurnFixedConfig {
  updateAuthority: PublicKey;
  treasury: PublicKey;
  mint: PublicKey;
  purchaseThreshold: BN;
  purchaseProportion: number;
  bump: number;
}

export class BuyBurnFixedClient {
  config: BuyBurnFixedConfig | undefined;
  readonly program: Program<BuyBurnFixed>;
  yieldAccountAddress: PublicKey | undefined;

  constructor(readonly provider: AnchorProvider) {
    this.program = new Program<BuyBurnFixed>(IDL, PROGRAM_ID, provider);
  }

  private async init(yieldAccountAddress: PublicKey): Promise<void> {
    const yieldAccount = await this.program.account.state.fetch(
      yieldAccountAddress
    );

    this.config = {
      updateAuthority: yieldAccount.updateAuthority,
      treasury: yieldAccount.treasury,
      mint: yieldAccount.mint,
      purchaseThreshold: yieldAccount.purchaseThreshold,
      purchaseProportion: yieldAccount.purchaseProportion,
      bump: yieldAccount.bump,
    };

    this.yieldAccountAddress = yieldAccountAddress;
  }

  public static async getYieldAccount(
    mint: PublicKey
  ): Promise<anchor.web3.PublicKey> {
    const [yieldAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("state"), mint.toBuffer()],
      PROGRAM_ID
    );

    return yieldAccount;
  }

  public static async fetch(yieldAccountAddress: PublicKey): Promise<any> {
    const client = new BuyBurnFixedClient(setUpAnchor());
    return client.program.account.yieldAccount.fetch(yieldAccountAddress);
  }

  public static async register(
    updateAuthority: PublicKey,
    treasury: PublicKey,
    mint: PublicKey,
    holdingAccount: PublicKey,
    holdingTokenAccount: PublicKey,
    price: BN,
    purchaseProportion: number,
    purchaseThreshold: BN
  ): Promise<BuyBurnFixedClient> {
    // find state address
    const yieldAccount = await this.getYieldAccount(mint);

    const client = new BuyBurnFixedClient(setUpAnchor());

    const accounts = {
      payer: client.provider.wallet.publicKey,
      yieldAccount,
      mint,
      systemProgram: SystemProgram.programId,
    };

    await client.program.methods
      .registerState({
        mint,
        updateAuthority,
        treasury,
        holdingAccount,
        holdingTokenAccount,
        price,
        purchaseProportion,
        purchaseThreshold,
      })
      .accounts(accounts)
      .rpc()
      .then(() => {
        confirm(client.provider.connection);
      });

    await client.init(yieldAccount);

    return client;
  }

  public static async updateController(
    yieldAccount: PublicKey,
    updateAuthority: PublicKey,
    treasury: PublicKey,
    mint: PublicKey,
    holdingAccount: PublicKey,
    holdingTokenAccount: PublicKey,
    price: BN,
    purchaseProportion: number,
    purchaseThreshold: BN
  ): Promise<BuyBurnFixedClient> {
    const client = new BuyBurnFixedClient(setUpAnchor());

    const accounts = {
      payer: client.provider.publicKey,
      yieldAccount,
    };

    await client.program.methods
      .updateState({
        mint,
        updateAuthority,
        treasury,
        holdingAccount,
        holdingTokenAccount,
        price,
        purchaseProportion,
        purchaseThreshold,
      })
      .accounts(accounts)
      .rpc()
      .then(confirm(client.provider.connection));

    await client.init(yieldAccount);

    return client;
  }

  public static async allocateYield(
    payer: PublicKey,
    yieldAccount: PublicKey,
    treasury: PublicKey,
    mint: PublicKey,
    holdingAccount: PublicKey,
    holdingTokenAccount: PublicKey,
    solAmount: BN,
    tokenAmount: BN
  ): Promise<BuyBurnFixedClient> {
    const client = new BuyBurnFixedClient(setUpAnchor());

    await client.program.methods
      .allocateYield({ solAmount, tokenAmount })
      .accounts({
        payer,
        yieldAccount,
        treasury,
        mint,
        holdingAccount,
        holdingTokenAccount,
      })
      .rpc()
      .then(confirm(client.provider.connection));

    return client;
  }

  public static async updatePrice(
    yieldAccount: PublicKey,
    payer: PublicKey,
    price: BN
  ): Promise<BuyBurnFixedClient> {
    const client = new BuyBurnFixedClient(setUpAnchor());

    await client.program.methods
      .updatePrice(price)
      .accounts({
        payer,
        yieldAccount,
      })
      .rpc()
      .then(confirm(client.provider.connection));

    return client;
  }
}
