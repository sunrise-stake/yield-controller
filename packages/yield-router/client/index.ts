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

/**
 * Transfroms a PublicKey to account metadata used to define instructions.
 *
 *
 * @param pubkey - Public Key
 * @param isSigner - Bool that defines if account is a signer
 * @param isWritable - Bool that defines if account is writable
 * @returns Account metadata used to define instructions
 *
 */
const toAccountMeta = (
  pubkey: PublicKey,
  isSigner = false,
  isWritable = false
): AccountMeta => ({
  pubkey,
  isSigner,
  isWritable,
});

/**
 * Creates account metadata with account that is writable and not a signer.
 *
 *
 * @param pubkey - Public key
 * @returns Account metadata
 *
 */
const toWriteableAccountMeta = (pubkey: PublicKey): AccountMeta =>
  toAccountMeta(pubkey, false, true);

/**
 * Sets up an anchor provider read from the environment variable.
 *
 *
 * @returns Anchor provider
 *
 */
export const setUpAnchor = (): anchor.AnchorProvider => {
  // Configure the client to use the local cluster.
  const provider = AnchorProvider.env();
  anchor.setProvider(provider);

  return provider;
};

/**
 * Confirms transaction.
 *
 *
 * @param connection - Connection to a full node JSON RPC endpoint
 * @returns Async function
 *
 */
export const confirm = (connection: Connection) => async (txSig: string) => {
  console.log("Confirming transaction", txSig);
  return connection.confirmTransaction({
    signature: txSig,
    ...(await connection.getLatestBlockhash()),
  });
};

/**
 * Returns input yield account address for given state address.
 *
 *
 * @param stateAddress - Public key of state
 * @returns Public Key of input yield account
 *
 */
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
};

export class YieldRouterClient {
  config: YieldRouterConfig | undefined;
  readonly program: Program<YieldRouter>;

  constructor(
    readonly provider: AnchorProvider,
    readonly stateAddress: PublicKey
  ) {
    this.program = new Program<YieldRouter>(IDL, PROGRAM_ID, provider);
  }

  /**
   * Initializes yield router client by setting its config.
   *
   */
  private async init(): Promise<void> {
    const state = await this.program.account.state.fetch(this.stateAddress);

    this.config = {
      updateAuthority: state.updateAuthority,
      outputYieldAccounts: state.outputYieldAccounts,
      spendProportions: [...state.spendProportions],
      spendThreshold: state.spendThreshold,
    };
  }

  /**
   * Returns state pda derived from sunrise state address.
   *
   *
   * @param sunriseState - Public key
   * @returns Public key of state
   *
   */
  public static getStateAddressFromSunriseAddress(
    sunriseState: PublicKey
  ): PublicKey {
    const [state] = PublicKey.findProgramAddressSync(
      [Buffer.from("state"), sunriseState.toBuffer()],
      PROGRAM_ID
    );

    return state;
  }

  /**
   * Returns input yield account address.
   *
   *
   * @returns Public Key of input yield account
   *
   */
  public getInputYieldAccount(): PublicKey {
    return getInputYieldAccountForState(this.stateAddress);
  }

  /**
   * Returns initialised yield router client.
   *
   *
   * @param stateAddress - Public key of state
   * @param provider - Optional anchor provider, defaults to anchor provider read from the environment variable
   * @returns Initialised yield router client
   *
   */
  public static async fetch(
    stateAddress: PublicKey,
    provider?: AnchorProvider
  ): Promise<InitialisedClient> {
    const client = new YieldRouterClient(
      provider ?? setUpAnchor(),
      stateAddress
    );
    await client.init();

    if (!client.config) {
      throw new Error("Could not fetch client");
    }
    return client as InitialisedClient;
  }

  /**
   * Register a new yield router state on chain.
   * This will typically happen only once.
   *
   *
   * @param sunriseState - Public key
   * @param updateAuthorit - Public key
   * @param outputYieldAccount - List of public keys
   * @param spendProportions - List of numbers that add up to 100
   * @param spendThreshol - Big number
   * @returns Initialised yield router client
   */
  public static async register(
    sunriseState: PublicKey,
    updateAuthority: PublicKey,
    outputYieldAccounts: PublicKey[],
    spendProportions: number[],
    spendThreshold: BN
  ): Promise<InitialisedClient> {
    // find state address
    const stateAddress =
      YieldRouterClient.getStateAddressFromSunriseAddress(sunriseState);
    const inputYieldAccount = getInputYieldAccountForState(stateAddress);

    const client = new YieldRouterClient(setUpAnchor(), stateAddress);

    // accounts needed to register state
    const accounts = {
      payer: client.provider.wallet.publicKey,
      state: stateAddress,
      inputYieldAccount,
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
      })
      // Temporary - use this to get insight into failed transactions
      // Can be removed after everything works, and re-added to debug as needed.
      .catch((e) => {
        console.log(e.logs);
        throw e;
      });

    // now that the state is registered on chain, we can hydrate the client instance with its data
    await client.init();

    return client as InitialisedClient;
  }

  /**
   * Updates output yield accounts.
   *
   *
   * @param outputYieldAccounts - List of public keys of output yield accounts
   * @param spendProportions - List of numbers that add up to 100
   * @returns Yield router client
   *
   */
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
   * Update the updateAuthority such that the new updateAuthority can update the state account.
   *
   *
   * @param updateAuthority - Public key of new update authority
   * @returns Yield router client
   *
   */
  public async updateUpdateAuthority(
    updateAuthority: PublicKey // the public key of the new update authority
  ): Promise<YieldRouterClient> {
    // Check if the client is initialized, config should be avaliable in such case
    if (!this.config) {
      throw new Error("Client not initialized");
    }
    const accounts = {
      payer: this.provider.wallet.publicKey, // only the original authority has the authority to update the update authority
      state: this.stateAddress,
    };

    const args = {
      updateAuthority, // only this argument is new, everything else is inferred from the original state account
      outputYieldAccounts: this.config.outputYieldAccounts,
      spendProportions: Buffer.from(this.config.spendProportions),
      spendThreshold: this.config.spendThreshold,
    };
    // call the updateState method from the program with the new update authority address
    await this.program.methods
      .updateState(args)
      .accounts(accounts)
      .rpc()
      .then(() => {
        confirm(this.provider.connection);
      });

    // repopulating the config with new data
    await this.init();

    return this;
  }

  /**
   * Allocates yield from input yield account to output yield accounts according to their proportions.
   *
   *
   * @param amount - Big number, total amount of allocated yield
   * @returns Yield router client
   *
   */
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
