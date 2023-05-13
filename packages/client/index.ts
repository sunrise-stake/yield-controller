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
  stateAddress: PublicKey | undefined;

  constructor(readonly provider: AnchorProvider) {
    this.program = new Program<BuyBurnFixed>(IDL, PROGRAM_ID, provider);
  }

  private async init(stateAddress: PublicKey): Promise<void> {
    const state = await this.program.account.state.fetch(stateAddress);

    this.config = {
      updateAuthority: state.updateAuthority,
      treasury: state.treasury,
      mint: state.mint,
      purchaseThreshold: state.purchaseThreshold,
      purchaseProportion: state.purchaseProportion,
      bump: state.bump,
    };

    this.stateAddress = stateAddress;
  }

  public static async getStateAddress(
    mint: PublicKey
  ): Promise<anchor.web3.PublicKey> {
    const [state] = PublicKey.findProgramAddressSync(
      [Buffer.from("state"), mint.toBuffer()],
      PROGRAM_ID
    );

    return state;
  }

  public static async fetch(stateAddress: PublicKey): Promise<any> {
    const client = new BuyBurnFixedClient(setUpAnchor());
    return client.program.account.state.fetch(stateAddress);
  }

  public static async register(
    updateAuthority: PublicKey,
    treasury: PublicKey,
    mint: PublicKey,
    yieldAccount: PublicKey,
    yieldTokenAccount: PublicKey,
    price: BN,
    purchaseProportion: number,
    purchaseThreshold: BN
  ): Promise<BuyBurnFixedClient> {
    // find state address
    const state = await this.getStateAddress(mint);

    const client = new BuyBurnFixedClient(setUpAnchor());

    const accounts = {
      payer: client.provider.wallet.publicKey,
      state,
      mint,
      systemProgram: SystemProgram.programId,
    };

    await client.program.methods
      .registerState({
        mint,
        updateAuthority,
        treasury,
        yieldAccount,
        yieldTokenAccount,
        price,
        purchaseProportion,
        purchaseThreshold,
      })
      .accounts(accounts)
      .rpc()
      .then(() => {
        confirm(client.provider.connection);
      });

    await client.init(state);

    return client;
  }

  public static async updateController(
    state: PublicKey,
    updateAuthority: PublicKey,
    treasury: PublicKey,
    mint: PublicKey,
    yieldAccount: PublicKey,
    yieldTokenAccount: PublicKey,
    price: BN,
    purchaseProportion: number,
    purchaseThreshold: BN
  ): Promise<BuyBurnFixedClient> {
    const client = new BuyBurnFixedClient(setUpAnchor());

    const accounts = {
      payer: client.provider.publicKey,
      state,
    };

    await client.program.methods
      .updateState({
        mint,
        updateAuthority,
        treasury,
        yieldAccount,
        yieldTokenAccount,
        price,
        purchaseProportion,
        purchaseThreshold,
      })
      .accounts(accounts)
      .rpc()
      .then(confirm(client.provider.connection));

    await client.init(state);

    return client;
  }

  public static async allocateYield(
    payer: PublicKey,
    state: PublicKey,
    treasury: PublicKey,
    mint: PublicKey,
    yieldAccount: PublicKey,
    yieldTokenAccount: PublicKey,
    solAmount: BN,
    tokenAmount: BN
  ): Promise<BuyBurnFixedClient> {
    const client = new BuyBurnFixedClient(setUpAnchor());

    await client.program.methods
      .allocateYield({ solAmount, tokenAmount })
      .accounts({
        payer,
        state,
        treasury,
        mint,
        yieldAccount,
        yieldTokenAccount,
      })
      .rpc()
      .then(confirm(client.provider.connection));

    return client;
  }

  public static async updatePrice(
    state: PublicKey,
    payer: PublicKey,
    price: BN
  ): Promise<BuyBurnFixedClient> {
    const client = new BuyBurnFixedClient(setUpAnchor());

    await client.program.methods
      .updatePrice(price)
      .accounts({
        payer,
        state,
      })
      .rpc()
      .then(confirm(client.provider.connection));

    return client;
  }
}
