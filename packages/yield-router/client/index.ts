import { AnchorProvider, Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import {
  PublicKey,
  SystemProgram,
  Connection,
  AccountMeta,
} from "@solana/web3.js";
import BN from "bn.js";
import { YieldRouter, IDL } from "../../types/yield_router";

export const PROGRAM_ID = new PublicKey(
  "syriqUnUPcFQjRSaxdFo2wPnXXPjbRsLmhiWUVoGdTo"
);

const toAccountMeta = (
  pubkey: PublicKey,
  isSigner = false,
  isWritable = false
): AccountMeta => ({
  pubkey,
  isSigner,
  isWritable,
});

const toWriteableAccountMeta = (pubkey: PublicKey): AccountMeta =>
  toAccountMeta(pubkey, false, true);

export const setUpAnchor = (): anchor.AnchorProvider => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  anchor.setProvider(provider);

  return provider;
};

export const confirm = (connection: Connection) => async (txSig: string) => {
  console.log("Confirming transaction", txSig);
  return connection.confirmTransaction({
    signature: txSig,
    ...(await connection.getLatestBlockhash()),
  });
};

const getInputYieldAccountForState = (stateAddress: PublicKey): PublicKey => {
  const [inputYieldAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("input_yield_account"), stateAddress.toBuffer()],
    PROGRAM_ID
  );

  return inputYieldAccount;
};

export interface YieldRouterConfig {
  updateAuthority: PublicKey;
  outputYieldAccounts: PublicKey[];
  spendProportions: number[];
  spendThreshold: BN;
}

type InitialisedClient = YieldRouterClient & {
    config: YieldRouterConfig;
}

export class YieldRouterClient {
  config: YieldRouterConfig | undefined;
  readonly program: Program<YieldRouter>;

  constructor(
    readonly provider: AnchorProvider,
    readonly stateAddress: PublicKey
  ) {
    this.program = new Program<YieldRouter>(IDL, PROGRAM_ID, provider);
  }

  private async init(): Promise<void> {
    // ask anchor to get the contents of the account at the stateAddress
    const state = await this.program.account.state.fetch(this.stateAddress);

    this.config = {
      updateAuthority: state.updateAuthority,
      outputYieldAccounts: state.outputYieldAccounts,
      spendProportions: [...state.spendProportions],
      spendThreshold: state.spendThreshold,
    };
  }

  public static getStateAddressFromSunriseAddress(sunriseState: PublicKey): PublicKey {
    const [state] = PublicKey.findProgramAddressSync(
      [Buffer.from("state"), sunriseState.toBuffer()],
      PROGRAM_ID
    );

    return state;
  }

  public getInputYieldAccount(): PublicKey {
    return getInputYieldAccountForState(this.stateAddress);
  }

  public static async fetch(
    stateAddress: PublicKey,
    provider?: AnchorProvider
  ): Promise<InitialisedClient> {
    // constructor is synchronous and does not retrieve information from the blockchain
    const client = new YieldRouterClient(
      provider ?? setUpAnchor(),
      stateAddress
    );
    // retrieve the state from the chain
    await client.init();

    if (!client.config) {
        throw new Error("Could not fetch client");
    }
    return client as InitialisedClient;
  }

  /**
   * Register a new yield router state on chain.
   * This will typically happen only once.
   * @param sunriseState
   * @param updateAuthority
   * @param outputYieldAccounts
   * @param spendProportions
   * @param spendThreshold
   */
  public static async register(
    sunriseState: PublicKey,  // (0)
    updateAuthority: PublicKey,
    outputYieldAccounts: PublicKey[],
    spendProportions: number[],
    spendThreshold: BN
  ): Promise<InitialisedClient> {
    // find state address PDA (1)
    const stateAddress = await YieldRouterClient.getStateAddressFromSunriseAddress(sunriseState);
    // get input yield account PDA (2)
    const inputYieldAccount = getInputYieldAccountForState(stateAddress);

    const client = new YieldRouterClient(setUpAnchor(), stateAddress);

    const accounts = {
      payer: client.provider.wallet.publicKey,
      state: stateAddress,
      inputYieldAccount,
      // system program is used because we are instantiating a new account
      systemProgram: SystemProgram.programId,
    };

    const args = {
      sunriseState,
      updateAuthority,
      outputYieldAccounts,
      spendProportions: Buffer.from(spendProportions),
      spendThreshold,
    };
    await client.program.methods
      .registerState(sunriseState, args)
      .accounts(accounts)
      .rpc()
      .then(() => {
        confirm(client.provider.connection);
      });

    // now that the state is registered on chain, we can hydrate the client instance with its data
    await client.init();

    return client as InitialisedClient;
  }

  public async updateOutputYieldAccounts(
    outputYieldAccounts: PublicKey[],
    spendProportions: number[]
  ): Promise<YieldRouterClient> {
    if (!this.config) {
        throw new Error("Client not initialized");
    }
    const accounts = {
      payer: this.provider.wallet.publicKey,
      state: this.stateAddress,
      // System program is needed because we may be resizing the state account
      systemProgram: SystemProgram.programId,
    };

    const args = {
      updateAuthority: this.config.updateAuthority,
      outputYieldAccounts,
      spendProportions: Buffer.from(spendProportions),
      spendThreshold: this.config.spendThreshold,
    };
    await this.program.methods
      .updateState(args)
      .accounts(accounts)
      .rpc()
      .then(() => {
        confirm(this.provider.connection);
      });

    await this.init();

    return this;
  }

  /**
   * Update the state account with a new updateAuthority
   * @param updateAuthority
   */
  public async updateUpdateAuthority(
    updateAuthority: PublicKey
  ): Promise<YieldRouterClient> {
    // TODO
  }

  public async allocateYield(amount: BN): Promise<YieldRouterClient> {
    if (!this.config) {
      throw new Error("Client not initialized");
    }
    const inputYieldAccount = this.getInputYieldAccount();

    await this.program.methods
      .allocateYield(amount)
      .accounts({
        payer: this.provider.publicKey,
        state: this.stateAddress,
        inputYieldAccount,
        systemProgram: SystemProgram.programId,
      })
      .remainingAccounts(
        this.config.outputYieldAccounts.map(toWriteableAccountMeta)
      )
      .rpc()
      .then(confirm(this.provider.connection));

    return this;
  }
}
