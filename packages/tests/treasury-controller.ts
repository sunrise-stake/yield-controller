import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { TreasuryController } from "../types/treasury_controller";
import BN from "bn.js";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PROGRAM_ID, TreasuryControllerClient } from "../client";
import {
  Account,
  createMint,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { expect } from "chai";
import testAuthority from "./fixtures/id.json";
const program = anchor.workspace
  .TreasuryController as Program<TreasuryController>;

describe("yield-controller", () => {
  let client: TreasuryControllerClient;
  let authority = Keypair.fromSecretKey(Uint8Array.from(testAuthority));
  let treasury = Keypair.generate();
  let holdingAccount = Keypair.generate();
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
      .requestAirdrop(authority.publicKey, 10 * LAMPORTS_PER_SOL)
      .then((sig) => program.provider.connection.confirmTransaction(sig));

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
    try {
      client = await TreasuryControllerClient.register(
        authority.publicKey,
        treasury.publicKey,
        mint,
        holdingAccount.publicKey,
        holdingTokenAccount.address,
        new BN(1),
        0.5,
        new BN(10)
      );
    } catch (e) {
      console.log(e);
    }
    const state = await program.account.state.fetch(client.stateAddress);

    expect(state.updateAuthority.toBase58()).equal(
      client.provider.publicKey.toBase58()
    );
    expect(state.treasury.toBase58()).equal(treasury.publicKey.toBase58());
    expect(state.mint.toBase58()).equal(mint.toBase58());
    expect(state.purchaseThreshold.toNumber()).equal(10);
    expect(state.purchaseProportion).equal(0.5);
    expect(state.bump).equal(bump);
  });
  it("Can update controller price", async () => {
    const price = new BN(1_000);

    try {
      client = await TreasuryControllerClient.updatePrice(
        client.stateAddress,
        authority.publicKey,
        price
      );
    } catch (e) {
      console.log(e);
    }

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
