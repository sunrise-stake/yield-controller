import { AnchorProvider, Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Connection } from "@solana/web3.js";
import BN from "bn.js";
import { FundSender } from "../../types/fund_sender";
import IDL from "../../idl/fund_sender.json";

export const PROGRAM_ID = new PublicKey(
  "sfsH2CVS2SaXwnrGwgTVrG7ytZAxSCsTnW82BvjWTGz"
);

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
 * Returns input account address for given state address.
 *
 *
 * @param stateAddress - Public key of state
 * @returns Public Key of input account
 *
 */
const getInputAccountForState = (stateAddress: PublicKey): PublicKey => {
  const [inputAccount] = PublicKey.findProgramAddressSync(
    [Buffer.from("input_account"), stateAddress.toBuffer()],
    PROGRAM_ID
  );

  return inputAccount;
};

export interface FundSenderConfig {
  destinationName: string;
  updateAuthority: PublicKey;
  destinationAccount: PublicKey;
  certificateVault: PublicKey;
  spendThreshold: BN;
}

type InitialisedClient = FundSenderClient & {
  config: FundSenderConfig;
};

export class FundSenderClient {
  config: FundSenderConfig | undefined;
  readonly program: Program<FundSender>;

  constructor(
    readonly provider: AnchorProvider,
    readonly stateAddress: PublicKey
  ) {
    this.program = new Program<FundSender>(IDL as FundSender, provider);
  }

  /**
   * Initializes fund sender client by setting its config.
   *
   */
  private async init(): Promise<void> {
    const state = await this.program.account.state.fetch(this.stateAddress);

    this.config = {
      destinationName: state.destinationName,
      updateAuthority: state.updateAuthority,
      destinationAccount: state.destinationAccount,
      certificateVault: state.certificateVault,
      spendThreshold: state.spendThreshold,
    };
  }

  /**
   * Returns state pda derived from sunrise state address.
   *
   *
   * @param sunriseState - Public key
   * @param destinationName
   * @returns Public key of state
   *
   */
  public static getStateAddressFromSunriseAddress(
    sunriseState: PublicKey,
    destinationName: string
  ): PublicKey {
    const [state] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("state"),
        Buffer.from(destinationName),
        sunriseState.toBuffer(),
      ],
      PROGRAM_ID
    );

    return state;
  }

  /**
   * Returns input account address.
   *
   *
   * @returns Public Key of input account
   *
   */
  public getInputAccount(): PublicKey {
    return getInputAccountForState(this.stateAddress);
  }

  /**
   * Returns initialised fund sender client.
   *
   *
   * @param stateAddress - Public key of state
   * @param provider - Optional anchor provider, defaults to anchor provider read from the environment variable
   * @returns Initialised fund sender client
   *
   */
  public static async fetch(
    stateAddress: PublicKey,
    provider?: AnchorProvider
  ): Promise<InitialisedClient> {
    const client = new FundSenderClient(
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
   * Register a new fund sender state on chain.
   * This will typically happen only once.
   *
   *
   * @param sunriseState - Public key
   * @param updateAuthority - Public key
   * @param destinationName - Seed to specify destination account
   * @param destinationAccount - Public key of destination account
   * @param certificateVault - Public key of account holding the NFTs from climate projects
   * @param spendThreshold - Big number
   * @returns Initialised fund sender client
   */
  public static async register(
    sunriseState: PublicKey,
    updateAuthority: PublicKey,
    destinationName: string,
    destinationAccount: PublicKey,
    certificateVault: PublicKey,
    spendThreshold: BN
  ): Promise<InitialisedClient> {
    // find state address
    const stateAddress = FundSenderClient.getStateAddressFromSunriseAddress(
      sunriseState,
      destinationName
    );
    console.log("state address", stateAddress.toBase58());
    const inputAccount = getInputAccountForState(stateAddress);
    console.log("input account", inputAccount.toBase58());

    const client = new FundSenderClient(setUpAnchor(), stateAddress);
    console.log("Client created");

    // accounts needed to register state
    const accounts = {
      payer: client.provider.wallet.publicKey,
      state: stateAddress,
      inputAccount,
    };

    const args = {
      destinationName,
      updateAuthority,
      destinationAccount,
      certificateVault,
      spendThreshold,
    };
    console.log("Registering state");
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
   * Updates fund sender accounts.
   *
   *
   * @param destinationAccount - Public keys of destination account
   * @param spendThreshold - The minimum amount that can be sent from this fund sender
   * @returns Fund sender client
   *
   */
  public async updateDestinationAccount(
    destinationAccount: PublicKey,
    spendThreshold: BN
  ): Promise<FundSenderClient> {
    if (!this.config) {
      throw new Error("Client not initialized");
    }
    const accounts = {
      payer: this.provider.wallet.publicKey,
      state: this.stateAddress,
    };

    const args = {
      destinationName: this.config.destinationName,
      updateAuthority: this.config.updateAuthority,
      destinationAccount,
      certificateVault: this.config.certificateVault,
      spendThreshold,
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
   * Updates certification vault.
   *
   *
   * @param certificateVault - Public keys of destination account
   * @returns Fund sender client
   *
   */
  public async updateCertificateVault(
    certificateVault: PublicKey
  ): Promise<FundSenderClient> {
    if (!this.config) {
      throw new Error("Client not initialized");
    }
    const accounts = {
      payer: this.provider.wallet.publicKey,
      state: this.stateAddress,
      systemProgram: SystemProgram.programId,
    };

    const args = {
      destinationName: this.config.destinationName,
      updateAuthority: this.config.updateAuthority,
      destinationAccount: this.config.destinationAccount,
      certificateVault,
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
   * @returns Fund sender client
   *
   */
  public async updateUpdateAuthority(
    updateAuthority: PublicKey // the public key of the new update authority
  ): Promise<FundSenderClient> {
    // Check if the client is initialized, config should be avaliable in such case
    if (!this.config) {
      throw new Error("Client not initialized");
    }
    const accounts = {
      payer: this.provider.wallet.publicKey, // only the original authority has the authority to update the update authority
      state: this.stateAddress,
    };

    const args = {
      destinationName: this.config.destinationName,
      updateAuthority, // only this argument is new, everything else is inferred from the original state account
      destinationAccount: this.config.destinationAccount,
      certificateVault: this.config.certificateVault,
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
   * Sends all funds from input account to destination account.
   *
   *
   * @returns Fund sender client
   *
   */
  public async sendFunds(amount: BN): Promise<FundSenderClient> {
    if (!this.config) {
      throw new Error("Client not initialized");
    }

    await this.program.methods
      .sendFund(amount)
      .accounts({
        payer: this.provider.publicKey,
        state: this.stateAddress,
        destinationAccount: this.config.destinationAccount,
      })
      .rpc()
      .then(confirm(this.provider.connection));

    return this;
  }

  public async sendFromState(
  ): Promise<FundSenderClient> {
    if (!this.config) {
      throw new Error("Client not initialized");
    }

    await this.program.methods
      .sendFromState()
      .accounts({
        state: this.stateAddress,
      })
      .rpc()
      .then(confirm(this.provider.connection));

    return this
  }

  /**
   * Sends specified amount of NFTs from input account to hold account.
   *
   *
   * @returns Fund sender client
   *
   */
  public async storeCertificates(
    inputTokenAccount: PublicKey,
    certificateMint: PublicKey
  ): Promise<FundSenderClient> {
    if (!this.config) {
      throw new Error("Client not initialized");
    }

    await this.program.methods
      .storeCertificates()
      .accounts({
        payer: this.provider.publicKey,
        state: this.stateAddress,
        certificateMint,
        inputTokenAccount,
        certificateVault: this.config.certificateVault,
      })
      .rpc()
      .then(confirm(this.provider.connection));

    return this;
  }
}
