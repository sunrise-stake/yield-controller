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
import {
  createMint,
  getAccount,
  getOrCreateAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";

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
      const certificateVault = Keypair.generate();

      client = await FundSenderClient.register(
        sunriseState,
        authority.publicKey,
        destinationSeed,
        destinationAccount,
        certificateVault.publicKey,
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

  context("transfer functions", () => {
    let destinationAccount: PublicKey;
    let certificateVault: Keypair;
    let authority: Keypair;
    let mint: PublicKey;
    // let connection0: Connection;
    const spendThreshold = new BN(0.8);

    beforeEach(async () => {
      destinationAccount = Keypair.generate().publicKey;
      const provider = AnchorProvider.local();
      const connection0 = provider.connection;
      authority = Keypair.generate();
      const tx = await connection0.requestAirdrop(
        authority.publicKey,
        LAMPORTS_PER_SOL
      );
      const blockhash = await connection0.getLatestBlockhash();
      await connection0.confirmTransaction({ signature: tx, ...blockhash });
      mint = await createMint(
        connection0,
        authority,
        authority.publicKey,
        null,
        10
      );
      /* certificateVault = await getOrCreateAssociatedTokenAccount(
        connection0,
        authority,
        mint,
        authority.publicKey,
        true
      ); */
      certificateVault = Keypair.generate();
      client = await FundSenderClient.register(
        sunriseState,
        authority.publicKey,
        destinationSeed,
        destinationAccount,
        certificateVault.publicKey,
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

    it("should be transfer and store certificates (SPL tokens) to certificate vault", async () => {
      const connection = client.program.provider.connection;
      // const payer = Keypair.generate();
      const tx1 = await connection.requestAirdrop(
        authority.publicKey,
        LAMPORTS_PER_SOL
      );
      const blockhash1 = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: tx1, ...blockhash1 });
      const ata = await getOrCreateAssociatedTokenAccount(
        connection,
        authority,
        mint,
        client.getOutputYieldAccount(destinationSeed),
        true
      );

      const mintAmount = 100;
      const tx3 = await mintTo(
        connection,
        authority,
        mint,
        ata.address,
        authority.publicKey,
        mintAmount
      );

      const blockhash3 = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: tx3, ...blockhash3 });

      const certificateVaultAta = await getOrCreateAssociatedTokenAccount(
        connection,
        authority,
        mint,
        certificateVault.publicKey,
        true
      );

      await client.storeCertificates(
        ata.address,
        certificateVaultAta.address,
        mint
      );
      const certificateVaultInfo = await getAccount(
        connection,
        certificateVaultAta.address
      );

      expect(Number(certificateVaultInfo.amount)).to.equal(mintAmount);
    });

    it("should not be able to transfer from a token account not owned by output_yield_account", async () => {
      const connection = client.program.provider.connection;
      // const payer = Keypair.generate();
      const tx1 = await connection.requestAirdrop(
        authority.publicKey,
        LAMPORTS_PER_SOL
      );
      const blockhash1 = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: tx1, ...blockhash1 });
      const anotherUser = Keypair.generate();
      const ata = await getOrCreateAssociatedTokenAccount(
        connection,
        authority,
        mint,
        anotherUser.publicKey,
        true
      );

      const mintAmount = 100;
      const tx3 = await mintTo(
        connection,
        authority,
        mint,
        ata.address,
        authority.publicKey,
        mintAmount
      );

      const blockhash3 = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: tx3, ...blockhash3 });

      const certificateVaultAta = await getOrCreateAssociatedTokenAccount(
        connection,
        authority,
        mint,
        certificateVault.publicKey,
        true
      );

      const shouldFail = client.storeCertificates(
        ata.address,
        certificateVaultAta.address,
        mint
      );
      return expect(shouldFail).to.be.rejectedWith(
        "IncorrectTokenAccountOwner."
      );
    });

    it("should not be able to transfer to a token account not owned by certificate_vault", async () => {
      const connection = client.program.provider.connection;
      const tx1 = await connection.requestAirdrop(
        authority.publicKey,
        LAMPORTS_PER_SOL
      );
      const blockhash1 = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: tx1, ...blockhash1 });
      const ata = await getOrCreateAssociatedTokenAccount(
        connection,
        authority,
        mint,
        client.getOutputYieldAccount(destinationSeed),
        true
      );

      const mintAmount = 100;
      const tx3 = await mintTo(
        connection,
        authority,
        mint,
        ata.address,
        authority.publicKey,
        mintAmount
      );

      const blockhash3 = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: tx3, ...blockhash3 });

      const unauthorisedCertificateVault = Keypair.generate();
      const unauthorisedCertificateVaultAta =
        await getOrCreateAssociatedTokenAccount(
          connection,
          authority,
          mint,
          unauthorisedCertificateVault.publicKey,
          true
        );

      const shouldFail = client.storeCertificates(
        ata.address,
        unauthorisedCertificateVaultAta.address,
        mint
      );
      return expect(shouldFail).to.be.rejectedWith("ConstraintTokenOwner.");
    });

    it("should not be able to transfer to a token account of another mint", async () => {
      const connection = client.program.provider.connection;
      const tx1 = await connection.requestAirdrop(
        authority.publicKey,
        LAMPORTS_PER_SOL
      );
      const blockhash1 = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: tx1, ...blockhash1 });
      const ata = await getOrCreateAssociatedTokenAccount(
        connection,
        authority,
        mint,
        client.getOutputYieldAccount(destinationSeed),
        true
      );

      const mintAmount = 100;
      const tx3 = await mintTo(
        connection,
        authority,
        mint,
        ata.address,
        authority.publicKey,
        mintAmount
      );

      const blockhash3 = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: tx3, ...blockhash3 });

      const wrongMint = await createMint(
        connection,
        authority,
        authority.publicKey,
        null,
        10
      );
      const wrongCertificateVaultAta = await getOrCreateAssociatedTokenAccount(
        connection,
        authority,
        wrongMint,
        certificateVault.publicKey,
        true
      );

      const shouldFail = client.storeCertificates(
        ata.address,
        wrongCertificateVaultAta.address,
        mint
      );
      return expect(shouldFail).to.be.rejectedWith("ConstraintTokenMint.");
    });

    it("should be able to update certificate vault and store certificates in new vault", async () => {
      const connection = client.program.provider.connection;
      const tx1 = await connection.requestAirdrop(
        authority.publicKey,
        LAMPORTS_PER_SOL
      );
      const blockhash1 = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: tx1, ...blockhash1 });
      const ata = await getOrCreateAssociatedTokenAccount(
        connection,
        authority,
        mint,
        client.getOutputYieldAccount(destinationSeed),
        true
      );

      const mintAmount = 50;
      const tx3 = await mintTo(
        connection,
        authority,
        mint,
        ata.address,
        authority.publicKey,
        mintAmount
      );

      const blockhash3 = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: tx3, ...blockhash3 });

      const newCertificateVaultA = Keypair.generate();
      const newCertificateVaultAta = await getOrCreateAssociatedTokenAccount(
        connection,
        authority,
        mint,
        newCertificateVaultA.publicKey,
        true
      );
      const authorisedUserProvider = new AnchorProvider(
        connection,
        new Wallet(authority),
        {}
      );
      const authorisedClient = await FundSenderClient.fetch(
        client.stateAddress,
        authorisedUserProvider
      );
      await authorisedClient.updateCertificateVault(
        newCertificateVaultA.publicKey
      );

      const updatedClient = await FundSenderClient.fetch(client.stateAddress);

      await updatedClient.storeCertificates(
        ata.address,
        newCertificateVaultAta.address,
        mint
      );
      const certificateVaultInfo = await getAccount(
        connection,
        newCertificateVaultAta.address
      );

      expect(Number(certificateVaultInfo.amount)).to.equal(mintAmount);
    });
  });
});
