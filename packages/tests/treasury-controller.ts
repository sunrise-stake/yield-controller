import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TreasuryController } from "../types/treasury_controller";
import BN from "bn.js";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { PROGRAM_ID, TreasuryControllerClient } from "../client";
import {
  Account,
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintToChecked,
  approveChecked,
  getAccount,
} from "@solana/spl-token";
import { expect } from "chai";
import testAuthority from "./fixtures/id.json";
const program = anchor.workspace
  .TreasuryController as Program<TreasuryController>;

describe("treasury-controller", () => {
  let client: TreasuryControllerClient;
  const authority = Keypair.fromSecretKey(Uint8Array.from(testAuthority));
  const treasury = Keypair.generate();
  const holdingAccount = Keypair.generate();
  let holdingTokenAccount: Account;
  let mint: anchor.web3.PublicKey;
  let stateAddress: anchor.web3.PublicKey;
  let bump: number;

  before(async () => {
    mint = await createMint(
      program.provider.connection,
      authority,
      authority.publicKey,
      null,
      9
    );
  });

  beforeEach(async () => {
    await program.provider.connection
      .requestAirdrop(authority.publicKey, 100 * LAMPORTS_PER_SOL)
      .then(async (sig) => program.provider.connection.confirmTransaction(sig));

    holdingTokenAccount = await getOrCreateAssociatedTokenAccount(
      program.provider.connection,
      authority,
      mint,
      holdingAccount.publicKey,
      true
    );

    [stateAddress, bump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("state"), mint.toBuffer()],
      PROGRAM_ID
    );
  });

  it("It can register a new controller state", async () => {
    client = await TreasuryControllerClient.register(
      authority.publicKey,
      treasury.publicKey,
      mint,
      holdingAccount.publicKey,
      holdingTokenAccount.address,
      new BN(1),
      0.5,
      new BN(1)
    );

    expect(client.stateAddress).not.to.be.null;

    const stateAddress = client.stateAddress as PublicKey;

    const state = await program.account.state.fetch(stateAddress);

    expect(state.updateAuthority.toBase58()).equal(
      client.provider.publicKey.toBase58()
    );
    expect(state.treasury.toBase58()).equal(treasury.publicKey.toBase58());
    expect(state.mint.toBase58()).equal(mint.toBase58());
    expect(state.purchaseThreshold.toNumber()).equal(1);
    expect(state.purchaseProportion).equal(0.5);
    expect(state.bump).equal(bump);
  });
  it("Can allocate yield", async () => {
    // state account is PDA target for sunrise
    await program.provider.connection
      .requestAirdrop(stateAddress, 100 * LAMPORTS_PER_SOL)
      .then(async (sig) => program.provider.connection.confirmTransaction(sig));

    await program.provider.connection
      .requestAirdrop(treasury.publicKey, 100 * LAMPORTS_PER_SOL)
      .then(async (sig) => program.provider.connection.confirmTransaction(sig));

    // check that stateAddress now has 10 SOL
    const stateBalanceBefore = await program.provider.connection.getBalance(
      stateAddress
    );
    // treasury token account is created and delegate is set to the state account
    const holdingTokenAccount = await getOrCreateAssociatedTokenAccount(
      program.provider.connection,
      authority,
      mint,
      holdingAccount.publicKey,
      true
    );

    // mint some tokens to the treasury token account and delegate to the state account
    await mintToChecked(
      program.provider.connection,
      authority,
      mint,
      holdingTokenAccount.address,
      authority.publicKey,
      1000 * 10 ** 9,
      9
    );

    // set holding account delegate to state account
    await approveChecked(
      program.provider.connection,
      authority,
      mint,
      holdingTokenAccount.address,
      stateAddress,
      holdingAccount,
      1000 * 10 ** 9,
      9
    );

    const holdingAccountBalanceBefore =
      await program.provider.connection.getBalance(holdingAccount.publicKey);

    // get token account info
    const holdingTokenAccountInfo = await getAccount(
      program.provider.connection,
      holdingTokenAccount.address
    );

    expect(holdingTokenAccountInfo?.delegate?.toBase58()).equal(
      stateAddress.toBase58()
    );

    // check DAO token account balance
    const holdingTokenAccountBalanceBefore =
      await program.provider.connection.getTokenAccountBalance(
        holdingTokenAccount.address
      );
    const balanceBeforeNumber: number = holdingTokenAccountBalanceBefore.value
      .uiAmount as number;

    // turn the crank
    client = await TreasuryControllerClient.allocateYield(
      authority.publicKey,
      stateAddress,
      treasury.publicKey,
      mint,
      holdingAccount.publicKey,
      holdingTokenAccount.address,
      new BN(10 * 10 ** 9),
      new BN(10 * 10 ** 9)
    );

    const treasuryBalanceAfter = await program.provider.connection.getBalance(
      stateAddress
    );

    const holdingTokenAccountBalanceAfter =
      await program.provider.connection.getTokenAccountBalance(
        holdingTokenAccount.address
      );

    const holdingAccountBalanceAfter =
      await program.provider.connection.getBalance(holdingAccount.publicKey);

    expect(treasuryBalanceAfter).equal(stateBalanceBefore - 10 * 10 ** 9);
    expect(holdingAccountBalanceAfter).equal(
      holdingAccountBalanceBefore + 5 * 10 ** 9
    );
    expect(holdingTokenAccountBalanceAfter.value.uiAmount).equal(
      balanceBeforeNumber - 10
    );

    const state = await program.account.state.fetch(stateAddress);
    expect(state.totalSpent.toNumber()).equal(5 * 10 ** 9);
  });
  it("Can update controller price", async () => {
    const price = new BN(1_000);

    client = await TreasuryControllerClient.updatePrice(
      stateAddress,
      authority.publicKey,
      price
    );

    const state = await program.account.state.fetch(stateAddress);
    expect(state.price.toNumber()).equal(price.toNumber());
  });
  it("Can update controller state", async () => {
    const newAuthority = Keypair.generate();
    const newTreasury = Keypair.generate();
    const newHoldingAccount = Keypair.generate();
    const newHoldingTokenAccount = await getOrCreateAssociatedTokenAccount(
      program.provider.connection,
      authority,
      mint,
      newHoldingAccount.publicKey,
      true
    );

    try {
      client = await TreasuryControllerClient.updateController(
        stateAddress,
        newAuthority.publicKey,
        newTreasury.publicKey,
        mint,
        newHoldingAccount.publicKey,
        newHoldingTokenAccount.address,
        new BN(10),
        1,
        new BN(100)
      );
    } catch (e) {
      console.log(e);
    }

    const state = await program.account.state.fetch(stateAddress);

    expect(state.updateAuthority.toBase58()).equal(
      newAuthority.publicKey.toBase58()
    );
    expect(state.treasury.toBase58()).equal(newTreasury.publicKey.toBase58());
    expect(state.mint.toBase58()).equal(mint.toBase58());
    expect(state.purchaseThreshold.toNumber()).equal(100);
    expect(state.purchaseProportion).equal(1);
    expect(state.bump).equal(bump);
  });
});
