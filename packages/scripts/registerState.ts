import { TreasuryControllerClient } from "../client";
import * as anchor from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

/** Adjust these values to whatever you want them to be */
const PRICE = 1;
const PURCHASE_THRESHOLD = 100;
const PURCHASE_PROPORTION = 0;

const defaultTreasuryKey = "ALhQPLkXvbLKsH5Bm9TC3CTabKFSmnXFmzjqpTXYBPpu";
const treasuryKey = new PublicKey(
  process.env.TREASURY_KEY ?? defaultTreasuryKey
);

const defaultAuthority = "5HnwQGT79JypiAdjdjsXEn1EMD2AsRVVubqDyWfyWXRv";
const authorityKey = new PublicKey(
  process.env.AUTHORITY_KEY ?? defaultAuthority
);

// used in devnet
const defaultMint = "tnct1RC5jg94CJLpiTZc2A2d98MP1Civjh7o6ShmTP6";
const mint = new PublicKey(process.env.MINT ?? defaultMint);

const defaultHoldingAccount = "48V9nmW9awiR9BmihdGhUL3ZpYJ8MCgGeUoSWbtqjicv";
const holdingAccount = new PublicKey(
  process.env.HOLDING_ACCOUNT ?? defaultHoldingAccount
);

(async () => {
  // get token account account for holding account
  const holdingAccountTokenAddress = getAssociatedTokenAddressSync(
    mint,
    authorityKey,
    true
  );

  const client = await TreasuryControllerClient.register(
    authorityKey,
    treasuryKey,
    mint,
    holdingAccount,
    holdingAccountTokenAddress,
    new anchor.BN(PRICE),
    PURCHASE_PROPORTION,
    new anchor.BN(PURCHASE_THRESHOLD)
  );

  console.log("newly registerd state:", client.stateAddress);
})().catch(console.error);
