import {AnchorProvider, Wallet} from "@coral-xyz/anchor";
import BN from "bn.js";
import {Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
import { YieldRouterClient } from "../yield-router/client";


import * as chai from "chai";
import chaiAsPromised from "chai-as-promised";
import testAuthority from "./fixtures/id.json";

chai.use(chaiAsPromised);
const {expect} = chai;


describe("yield-router", () => {
  let client: YieldRouterClient;
  let sunriseState: PublicKey;
  const authority = Keypair.fromSecretKey(Buffer.from(testAuthority));

  const spendThreshold = new BN(1);

  beforeEach(async () => {
    sunriseState = Keypair.generate().publicKey;
  });

  context('create and update', () => {

    it('can register a new yield router state', async () => {
      const outputYieldAccounts = [Keypair.generate().publicKey];
      const spendProportions = [100];

      client = await YieldRouterClient.register(
          sunriseState,
          authority.publicKey,
          outputYieldAccounts,
          spendProportions,
          spendThreshold
      );
    });

    it('should be updateable by the admin', async () => {
      const outputYieldAccounts = [PublicKey.unique(), PublicKey.unique()];
      const proportions = [30, 70];
      await client.updateOutputYieldAccounts(outputYieldAccounts, proportions);

      const retrieved = await YieldRouterClient.fetch(client.stateAddress);

      expect(retrieved.config?.outputYieldAccounts).to.deep.equal(outputYieldAccounts);
      expect(retrieved.config?.spendProportions).to.deep.equal(proportions);
    });

    it('should not be updateable by others', async () => {
      const anotherUser = Keypair.generate();
      const wallet = new Wallet(anotherUser);
      const connection = client.program.provider.connection;
      const tx = await connection.requestAirdrop(anotherUser.publicKey, LAMPORTS_PER_SOL);
      const blockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({ signature: tx, ...blockhash});

      const provider = new AnchorProvider(connection, wallet, {});
      const unauthorisedClient = await YieldRouterClient.fetch(client.stateAddress, provider);

      const shouldFail = unauthorisedClient.updateOutputYieldAccounts(
          unauthorisedClient.config!.outputYieldAccounts, [50, 50]);

      return expect(shouldFail).to.be.rejectedWith('Unauthorized.');
    });
  });

  context('with one output yield account', () => {
    let outputYieldAccounts: PublicKey[];
    const spendProportions = [100];

    beforeEach(async () => {
      outputYieldAccounts = [Keypair.generate().publicKey];
      client = await YieldRouterClient.register(
          sunriseState,
          authority.publicKey,
          outputYieldAccounts,
          spendProportions,
          spendThreshold
      );
    });

    it('should be able to allocate yield', async () => {
      await client.provider.sendAndConfirm(new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: client.provider.wallet.publicKey,
            toPubkey: client.getInputYieldAccount(),
            lamports: LAMPORTS_PER_SOL,
          })
      ));

        await client.allocateYield(new BN(LAMPORTS_PER_SOL));

        const outputYieldAccount = await client.provider.connection.getAccountInfo(outputYieldAccounts[0]);
        expect(outputYieldAccount?.lamports).to.equal(LAMPORTS_PER_SOL);
    });
  });

  context('with two output yield accounts', () => {
    let outputYieldAccounts: PublicKey[];
    const spendProportions = [30, 70];

    beforeEach(async () => {
      outputYieldAccounts = [Keypair.generate().publicKey, Keypair.generate().publicKey];
      client = await YieldRouterClient.register(
          sunriseState,
          authority.publicKey,
          outputYieldAccounts,
          spendProportions,
          spendThreshold
      );
    });

    it('should allocate yield according to the proportions', async () => {
      await client.provider.sendAndConfirm(new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: client.provider.wallet.publicKey,
            toPubkey: client.getInputYieldAccount(),
            lamports: LAMPORTS_PER_SOL,
          })
      ));

      await client.allocateYield(new BN(LAMPORTS_PER_SOL));

      const outputYieldAccount0 = await client.provider.connection.getAccountInfo(outputYieldAccounts[0]);
      expect(outputYieldAccount0?.lamports).to.equal(LAMPORTS_PER_SOL * spendProportions[0] / 100);

      const outputYieldAccount1 = await client.provider.connection.getAccountInfo(outputYieldAccounts[1]);
      expect(outputYieldAccount1?.lamports).to.equal(LAMPORTS_PER_SOL * spendProportions[1] / 100);
    });
  });
});
