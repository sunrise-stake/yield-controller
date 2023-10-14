import { AnchorProvider, Wallet } from "@coral-xyz/anchor";
import BN from "bn.js";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { FundSenderClient } from "../fund-sender/client";

import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import testAuthority from "./fixtures/id.json";

chai.use(chaiAsPromised);
const { expect } = chai;

describe("fund-sender", () => {
  let client: FundSenderClient;
  let sunriseState: PublicKey;
  const authority = Keypair.fromSecretKey(Buffer.from(testAuthority));
  const destinationSeed = Buffer.from("EcoToken");

  const spendThreshold = new BN(1);

  beforeEach(async () => {
    sunriseState = Keypair.generate().publicKey;
  });

  context("create and update", () => {
    it("can register a new fund sender state", async () => {
      const destinationAccount = Keypair.generate().publicKey;

      client = await FundSenderClient.register(
        sunriseState,
        authority.publicKey,
        destinationSeed,
        destinationAccount,
        spendThreshold
      );
    });

    it("should be updateable by the admin", async () => {
      const destinationAccount = PublicKey.unique();
      const spendThreshold = new BN(2);
      await client.updateDestinationAccount(destinationAccount, spendThreshold);

      const retrieved = await FundSenderClient.fetch(client.stateAddress);

      expect(retrieved.config?.destinationAccount).to.deep.equal(
        destinationAccount
      );
      expect(retrieved.config?.spendThreshold.toString()).to.deep.equal(
        spendThreshold.toString()
      );
    });

    it("should not be updateable by others", async () => {
      const anotherUser = Keypair.generate();
      const wallet = new Wallet(anotherUser);
      const connection = client.program.provider.connection;
      const tx = await connection.requestAirdrop(
        anotherUser.publicKey,
        LAMPORTS_PER_SOL
      );
      const blockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: tx, ...blockhash });

      const provider = new AnchorProvider(connection, wallet, {});
      const unauthorisedClient = await FundSenderClient.fetch(
        client.stateAddress,
        provider
      );

      const shouldFail = unauthorisedClient.updateDestinationAccount(
        unauthorisedClient.config.destinationAccount,
        new BN(0.2)
      );

      return expect(shouldFail).to.be.rejectedWith("Unauthorized.");
    });

    it("should be able to update with a new update authority", async () => {
      // Setup
      // Generate a new keypair that is going to be the new update authority
      const newAuthorisedUser = Keypair.generate();
      const newAuthorisedUserWallet = new Wallet(newAuthorisedUser);
      const connection = client.program.provider.connection;
      // put some funds into this new address
      const tx = await connection.requestAirdrop(
        newAuthorisedUser.publicKey,
        LAMPORTS_PER_SOL
      );
      const blockhash = await connection.getLatestBlockhash();
      // wait for the transaction of request airderop to be confirmed
      await connection.confirmTransaction({ signature: tx, ...blockhash });
      // now the user has funds

      // Act
      // call updateUpdateAuthority() to update the update authority to newAuthorisedUser
      await client.updateUpdateAuthority(newAuthorisedUser.publicKey);

      // create an anchor provide that can sign for newAuthorisedUser
      const newAuthorisedUserProvider = new AnchorProvider(
        connection,
        newAuthorisedUserWallet,
        {}
      );
      // fetch the state configs from current client and wrap it into a new client
      const newAuthorisedClient = await FundSenderClient.fetch(
        client.stateAddress,
        newAuthorisedUserProvider
      );

      // we will try to update the state account with the following updates using newAuthorisedUser
      const destinationAccount = PublicKey.unique();
      const spendTreshold = new BN(1.5);

      await newAuthorisedClient.updateDestinationAccount(
        destinationAccount,
        spendTreshold
      );

      // check that the configs are updated with a new client instance
      const fundSenderStateAddress = newAuthorisedClient.stateAddress;
      const retrieved = await FundSenderClient.fetch(fundSenderStateAddress);

      expect(retrieved.config?.destinationAccount).to.deep.equal(
        destinationAccount
      );
      expect(retrieved.config?.spendThreshold.toString()).to.deep.equal(
        spendTreshold.toString()
      );
    });
  });

  context("with one output yield account", () => {
    let destinationAccount: PublicKey;
    const spendThreshold = new BN(0.8);

    beforeEach(async () => {
      destinationAccount = Keypair.generate().publicKey;
      client = await FundSenderClient.register(
        sunriseState,
        authority.publicKey,
        destinationSeed,
        destinationAccount,
        spendThreshold
      );
    });

    it("should be able to send funds", async () => {
      await client.provider.sendAndConfirm(
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: client.provider.wallet.publicKey,
            toPubkey: client.getOutputYieldAccount(destinationSeed),
            lamports: LAMPORTS_PER_SOL,
          })
        )
      );

      await client.sendFunds();

      const destinationAccountInfo =
        await client.provider.connection.getAccountInfo(destinationAccount);
      expect(destinationAccountInfo?.lamports).to.equal(LAMPORTS_PER_SOL);
    });
  });
});
