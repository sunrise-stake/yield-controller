import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import BN from "bn.js";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import {
  PROGRAM_ID,
  YieldControllerClient,
  BuyBurnSwitchboardState,
} from "../buy-burn-switchboard/client/src";
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
import { BuyBurnSwitchboard } from "../types/buy_burn_switchboard";
const program = anchor.workspace
  .BuyBurnSwitchboard as Program<BuyBurnSwitchboard>;

export const expectAmount = (
  actualAmount: number | BN,
  expectedAmount: number | BN,
  tolerance = 0
) => {
  const actualAmountBN = new BN(actualAmount);
  const minExpected = new BN(expectedAmount).subn(tolerance);
  const maxExpected = new BN(expectedAmount).addn(tolerance);

  console.log(
    "Expecting",
    actualAmountBN.toString(),
    "to be at least",
    new BN(minExpected).toString(),
    "and at most",
    new BN(maxExpected).toString()
  );

  expect(actualAmountBN.gte(minExpected)).to.be.true;
  expect(actualAmountBN.lte(maxExpected)).to.be.true;
};

const solUsdPriceFeed = new PublicKey(
  "GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR"
);
const nctUsdPriceFeed = new PublicKey(
  "4YL36VBtFkD2zfNGWdGFSc5suvskjrHnx3Asuksyek1J"
);
const FEED_STALENESS_THRESHOLD = 60 * 60 * 24 * 365 * 10; // the test fixtures will expire in 10 years

describe.only("buy-and-burn", () => {
  let client: YieldControllerClient;
  const authority = Keypair.fromSecretKey(Uint8Array.from(testAuthority));
  const treasury = Keypair.generate();
  const holdingAccount = Keypair.generate();
  let holdingTokenAccount: Account;
  let mint: PublicKey;
  let stateAddress: PublicKey;
  let bump: number;

  let yieldAccount: PublicKey;

  const tokenDecimals = 5; // choose something other than 9 to ensure the maths are correct
  const tokensToMint = 1_000_000;

  before(async () => {
    mint = await createMint(
      program.provider.connection,
      authority,
      authority.publicKey,
      null,
      tokenDecimals
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

    [stateAddress, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("state"), mint.toBuffer(), Buffer.from([0])],
      PROGRAM_ID
    );

    [yieldAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("yield_account"), stateAddress.toBuffer()],
      PROGRAM_ID
    );
  });

  it("It can register a new controller state", async () => {
    client = await YieldControllerClient.register(
      authority.publicKey,
      treasury.publicKey,
      mint,
      holdingAccount.publicKey,
      holdingTokenAccount.address,
      solUsdPriceFeed,
      nctUsdPriceFeed,
      new BN(FEED_STALENESS_THRESHOLD),
      0.9, // 90% goes to buying tokens
      new BN(LAMPORTS_PER_SOL), // Only purchase once we have accrued at least 1 sol,
      0
    );

    expect(client.stateAddress).not.to.be.null;

    const stateAddress = client.stateAddress as PublicKey;

    const state = (await program.account.state.fetch(
      stateAddress
    )) as BuyBurnSwitchboardState;

    expect(state.updateAuthority.toBase58()).equal(
      client.provider.publicKey.toBase58()
    );
    expect(state.treasury.toBase58()).equal(treasury.publicKey.toBase58());
    expect(state.mint.toBase58()).equal(mint.toBase58());
    expect(state.purchaseThreshold.toNumber()).equal(LAMPORTS_PER_SOL);
    // TODO move away from floating point maths
    expectAmount(state.purchaseProportion, 0.9, 0.00000001);
    expect(state.bump).equal(bump);
  });

  it("Can allocate yield", async () => {
    // yield account is PDA target for sunrise
    // give the yield account 100 SOL
    await program.provider.connection
      .requestAirdrop(yieldAccount, 100 * LAMPORTS_PER_SOL)
      .then(async (sig) => program.provider.connection.confirmTransaction(sig));

    // holding token account is created and delegate is set to the state account
    const holdingTokenAccount = await getOrCreateAssociatedTokenAccount(
      program.provider.connection,
      authority,
      mint,
      holdingAccount.publicKey,
      true
    );

    // mint some tokens to the treasury token account and delegate to the state account
    // mint 1000000 tokens
    await mintToChecked(
      program.provider.connection,
      authority,
      mint,
      holdingTokenAccount.address,
      authority.publicKey,
      tokensToMint * 10 ** tokenDecimals,
      tokenDecimals
    );

    // set holding account delegate to state account
    await approveChecked(
      program.provider.connection,
      authority,
      mint,
      holdingTokenAccount.address,
      stateAddress,
      holdingAccount,
      tokensToMint * 10 ** tokenDecimals,
      tokenDecimals
    );

    // get token account info
    const holdingTokenAccountInfo = await getAccount(
      program.provider.connection,
      holdingTokenAccount.address
    );

    expect(holdingTokenAccountInfo?.delegate?.toBase58()).equal(
      stateAddress.toBase58()
    );

    // turn the crank
    console.log("turning the crank");
    await client.allocateYield(authority.publicKey);

    const nctUsdPrice = 2.0475649887674585;
    const solUsdPrice = 21.7042154;
    const expectedNctSolPrice = nctUsdPrice / solUsdPrice; // 0.0945
    console.log("expectedNctSolPrice", expectedNctSolPrice);

    const yieldAccountBalanceAfter =
      await program.provider.connection.getBalance(yieldAccount);
    const treasuryBalanceAfter = await program.provider.connection.getBalance(
      treasury.publicKey
    );

    const holdingTokenAccountBalanceAfter =
      await program.provider.connection.getTokenAccountBalance(
        holdingTokenAccount.address
      );

    const holdingAccountBalanceAfter =
      await program.provider.connection.getBalance(holdingAccount.publicKey);

    const state = (await program.account.state.fetch(
      stateAddress
    )) as BuyBurnSwitchboardState;

    // We expect:
    // 1. The yield account to have 0 balance
    // 2. The treasury account to have received 100 SOL * 0.1 = 10 SOL
    // 3. The SOL holding account to have received 100 SOL * 0.9 = 90 SOL
    // 4. The token holding account to have (90 / 0.0945 = 952) fewer tokens
    // 5. The state account to have been updated with the amount of tokens that were burned

    const expectedBurnedTokens = 90 / expectedNctSolPrice;

    console.log("expectedBurnedTokens", expectedBurnedTokens);

    expectAmount(yieldAccountBalanceAfter, 0);
    expectAmount(treasuryBalanceAfter, 10 * LAMPORTS_PER_SOL, 3000); // TODO fix floating point maths
    expectAmount(holdingAccountBalanceAfter, 90 * LAMPORTS_PER_SOL, 3000); // TODO fix floating point maths
    expectAmount(
      holdingTokenAccountBalanceAfter.value.uiAmount!,
      tokensToMint - expectedBurnedTokens
    );
    expectAmount(
      state.totalTokensPurchased.toNumber(),
      expectedBurnedTokens * 10 ** tokenDecimals,
      10
    );
  });

  it("can set a new value for total tokens purchased", async () => {
    const newTotalTokens = new BN(5);
    await client.setTotalTokensPurchased(newTotalTokens);
    const state = await client.getState();

    expect(state.totalTokensPurchased.toNumber()).equal(
      newTotalTokens.toNumber()
    );
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

    client = await client.updateController(
      newAuthority.publicKey,
      newTreasury.publicKey,
      mint,
      newHoldingAccount.publicKey,
      newHoldingTokenAccount.address,
      solUsdPriceFeed,
      nctUsdPriceFeed,
      new BN(FEED_STALENESS_THRESHOLD),
      1,
      new BN(100),
      0
    );

    const state = await client.getState();

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
