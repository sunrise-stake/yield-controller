import { AnchorProvider, Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Connection } from "@solana/web3.js";
import BN from "bn.js";
import { BuyBurnSwitchboard } from "../../../types/buy_burn_switchboard";
// import IDL from "../../../idl/buy_burn_switchboard.json";

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { BuyBurnSwitchboardState } from "./types";

export { BuyBurnSwitchboardState } from "./types";

export const PROGRAM_ID = new PublicKey(
  "sbnbpcN3HVfcj9jTwzncwLeNvCzSwbfMwNmdAgX36VW"
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
  readonly program: Program<BuyBurnSwitchboard>;
  stateAddress: PublicKey | undefined;
  state: BuyBurnSwitchboardState | undefined;

  constructor(readonly provider: AnchorProvider) {
    this.program = new Program<BuyBurnSwitchboard>(IDL, provider);
  }

  private async init(stateAddress: PublicKey): Promise<void> {
    this.stateAddress = stateAddress;
    this.state = (await this.program.account.state.fetch(
      stateAddress
    )) as BuyBurnSwitchboardState;

    this.config = {
      updateAuthority: this.state.updateAuthority,
      treasury: this.state.treasury,
      mint: this.state.mint,
      purchaseThreshold: this.state.purchaseThreshold,
      purchaseProportion: this.state.purchaseProportion,
      bump: this.state.bump,
    };
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

  public static async get(
    provider: AnchorProvider,
    stateAddress: PublicKey
  ): Promise<YieldControllerClient> {
    const client = new YieldControllerClient(provider);
    await client.init(stateAddress);
    return client;
  }

  public getState(): BuyBurnSwitchboardState {
    if (!this.state) throw new Error("Client not initialised");
    return this.state;
  }

  public static async getYieldAccount(
    stateAddress: PublicKey
  ): Promise<BuyBurnSwitchboardState> {
    return YieldControllerClient.get(setUpAnchor(), stateAddress).then(
      (client) => client.getState()
    );
  }

  public static async register(
    updateAuthority: PublicKey,
    treasury: PublicKey,
    mint: PublicKey,
    holdingAccount: PublicKey,
    holdingTokenAccount: PublicKey,
    solUsdPriceFeed: PublicKey,
    nctUsdPriceFeed: PublicKey,
    feedStalenessThreshold: BN,
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

    const stateInput = {
      mint,
      updateAuthority,
      treasury,
      holdingAccount,
      holdingTokenAccount,
      solUsdPriceFeed,
      nctUsdPriceFeed,
      feedStalenessThreshold,
      purchaseProportion,
      purchaseThreshold,
      index,
      yieldAccountBump,
    };

    console.log({ accounts, stateInput });

    await client.program.methods
      .registerState(stateInput)
      .accounts(accounts)
      .rpc()
      .then(() => {
        confirm(client.provider.connection);
      });

    await client.init(state);

    return client;
  }

  public async updateController(
    updateAuthority: PublicKey,
    treasury: PublicKey,
    mint: PublicKey,
    holdingAccount: PublicKey,
    holdingTokenAccount: PublicKey,
    solUsdPriceFeed: PublicKey,
    nctUsdPriceFeed: PublicKey,
    feedStalenessThreshold: BN,
    purchaseProportion: number,
    purchaseThreshold: BN,
    index: number
  ): Promise<YieldControllerClient> {
    if (!this.stateAddress || !this.state)
      throw new Error("Client not initialised");
    const accounts = {
      payer: this.provider.publicKey,
      state: this.stateAddress,
    };

    const [, yieldAccountBump] = YieldControllerClient.calculateYieldAccount(
      this.stateAddress
    );

    await this.program.methods
      .updateState({
        mint,
        updateAuthority,
        treasury,
        holdingAccount,
        holdingTokenAccount,
        solUsdPriceFeed,
        nctUsdPriceFeed,
        feedStalenessThreshold,
        purchaseProportion,
        purchaseThreshold,
        index,
        yieldAccountBump,
      })
      .accounts(accounts)
      .rpc()
      .then(confirm(this.provider.connection));

    await this.init(this.stateAddress);

    return this;
  }

  public async setTotalTokensPurchased(value: BN): Promise<string> {
    if (!this.stateAddress || !this.state)
      throw new Error("Client not initialised");
    const accounts = {
      payer: this.provider.publicKey,
      state: this.stateAddress,
    };
    const txSig = await this.program.methods
      .setTotalTokensPurchased(value)
      .accounts(accounts)
      .rpc();
    await confirm(this.provider.connection)(txSig);

    await this.init(this.stateAddress);

    return txSig;
  }

  public async allocateYield(payer: PublicKey): Promise<string> {
    if (!this.stateAddress || !this.state)
      throw new Error("Client not initialised");

    const [yieldAccount] = YieldControllerClient.calculateYieldAccount(
      this.stateAddress
    );

    const accounts = {
      payer,
      state: this.stateAddress,
      mint: this.state.mint,
      treasury: this.state.treasury,
      holdingAccount: this.state.holdingAccount,
      holdingTokenAccount: this.state.holdingTokenAccount,
      yieldAccount,
      solUsdPriceFeed: this.state.solUsdPriceFeed,
      nctUsdPriceFeed: this.state.nctUsdPriceFeed,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    };
    console.log(accounts);
    const transactionSignature = await this.program.methods
      .allocateYield()
      .accounts(accounts)
      .rpc();

    await confirm(this.provider.connection)(transactionSignature);

    return transactionSignature;
  }
}
