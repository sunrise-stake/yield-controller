import { AnchorProvider, Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Connection } from "@solana/web3.js";
import BN from "bn.js";
import { TreasuryController, IDL } from "../types/treasury_controller";

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

export interface TreasuryControllerConfig {
  updateAuthority: PublicKey;
  treasury: PublicKey;
  mint: PublicKey;
  purchaseThreshold: BN;
  purchaseProportion: number;
  bump: number;
}

export class TreasuryControllerClient {
  config: TreasuryControllerConfig | undefined;
  readonly program: Program<TreasuryController>;
  stateAddress: PublicKey | undefined;

  constructor(readonly provider: AnchorProvider) {
    this.program = new Program<TreasuryController>(IDL, PROGRAM_ID, provider);
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
    const client = new TreasuryControllerClient(setUpAnchor());
    return client.program.account.state.fetch(stateAddress);
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
  ): Promise<TreasuryControllerClient> {
    // find state address
    const state = await this.getStateAddress(mint);

    const client = new TreasuryControllerClient(setUpAnchor());

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

    await client.init(state);

    return client;
  }

  public static async updateController(
    state: PublicKey,
    updateAuthority: PublicKey,
    treasury: PublicKey,
    mint: PublicKey,
    holdingAccount: PublicKey,
    holdingTokenAccount: PublicKey,
    price: BN,
    purchaseProportion: number,
    purchaseThreshold: BN
  ): Promise<TreasuryControllerClient> {
    const client = new TreasuryControllerClient(setUpAnchor());

    const accounts = {
      payer: client.provider.publicKey,
      state,
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

    await client.init(state);

    return client;
  }

  public static async allocateYield(
    payer: PublicKey,
    state: PublicKey,
    treasury: PublicKey,
    mint: PublicKey,
    holdingAccount: PublicKey,
    holdingTokenAccount: PublicKey,
    solAmount: BN,
    tokenAmount: BN
  ): Promise<TreasuryControllerClient> {
    const client = new TreasuryControllerClient(setUpAnchor());

    await client.program.methods
      .allocateYield({ solAmount, tokenAmount })
      .accounts({
        payer,
        state,
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
    state: PublicKey,
    payer: PublicKey,
    price: BN
  ): Promise<TreasuryControllerClient> {
    const client = new TreasuryControllerClient(setUpAnchor());

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
