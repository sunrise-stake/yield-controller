import { AnchorProvider, Program } from "@project-serum/anchor";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Connection } from "@solana/web3.js";
import BN from "bn.js";
import { TreasuryController, IDL } from "./types/treasury_controller";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {YieldControllerState} from "./types";

export {YieldControllerState} from "./types";

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

export class YieldControllerClient {
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

  public static getStateAddress(mint: PublicKey, index: number): PublicKey {
    const [state] = PublicKey.findProgramAddressSync(
      [Buffer.from("state"), mint.toBuffer(), Buffer.from([index])],
      PROGRAM_ID
    );

    return state;
  }

  public static calculateYieldAccount(
    stateAddress: PublicKey
  ): [PublicKey, number] {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("yield_account"), stateAddress.toBuffer()],
      PROGRAM_ID
    );
  }

  public static async get(provider: AnchorProvider, stateAddress: PublicKey): Promise<YieldControllerClient> {
    const client = new YieldControllerClient(provider);
    await client.init(stateAddress);
    return client;
  }

  public getState(): Promise<YieldControllerState> {
    if (!this.stateAddress) throw new Error("Client not initialised");
    return this.program.account.state.fetch(this.stateAddress);
  }

  public static async getYieldAccount(stateAddress: PublicKey): Promise<YieldControllerState> {
    return YieldControllerClient.get(setUpAnchor(), stateAddress).then(client => client.getState());
  }

  public static async register(
    updateAuthority: PublicKey,
    treasury: PublicKey,
    mint: PublicKey,
    holdingAccount: PublicKey,
    holdingTokenAccount: PublicKey,
    price: number,
    purchaseProportion: number,
    purchaseThreshold: BN,
    index: number
  ): Promise<YieldControllerClient> {
    // find state address
    const state = this.getStateAddress(mint, index);

    const client = new YieldControllerClient(setUpAnchor());

    const [, yieldAccountBump] =
      YieldControllerClient.calculateYieldAccount(state);

    const accounts = {
      payer: client.provider.wallet.publicKey,
      state,
      mint,
      systemProgram: SystemProgram.programId,
    };

    const args = {
      mint,
      updateAuthority,
      treasury,
      holdingAccount,
      holdingTokenAccount,
      price,
      purchaseProportion,
      purchaseThreshold,
      index,
      yieldAccountBump,
    };

    console.log({ accounts, args });

    await client.program.methods
      .registerState(args)
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
    price: number,
    purchaseProportion: number,
    purchaseThreshold: BN,
    index: number
  ): Promise<YieldControllerClient> {
    const client = new YieldControllerClient(setUpAnchor());

    const accounts = {
      payer: client.provider.publicKey,
      state,
    };

    const [, yieldAccountBump] =
      YieldControllerClient.calculateYieldAccount(state);

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
        index,
        yieldAccountBump,
      })
      .accounts(accounts)
      .rpc()
      .then(confirm(client.provider.connection));

    await client.init(state);

    return client;
  }

  public static async allocateYield(
    payer: PublicKey,
    stateAddress: PublicKey
  ): Promise<YieldControllerClient> {
    const client = new YieldControllerClient(setUpAnchor());

    // TODO make non-static and fix return value
    const state = await YieldControllerClient.getYieldAccount(stateAddress);

    const [yieldAccount] =
      YieldControllerClient.calculateYieldAccount(stateAddress);

    const accounts = {
      payer,
      state: stateAddress,
      mint: state.mint,
      treasury: state.treasury,
      holdingAccount: state.holdingAccount,
      holdingTokenAccount: state.holdingTokenAccount,
      yieldAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    };
    console.log(accounts);
    await client.program.methods
      .allocateYield()
      .accounts(accounts)
      .rpc()
      .then(confirm(client.provider.connection));

    return client;
  }

  public async setPrice(
    price: number
  ): Promise<string> {
    return this.program.methods
      .updatePrice(price)
      .accounts({
        payer: this.provider.publicKey,
        state: this.stateAddress,
      })
      .rpc();
  }
}
