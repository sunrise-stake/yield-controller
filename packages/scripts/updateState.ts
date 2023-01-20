import { setUpAnchor, TreasuryControllerClient } from "../client";
import * as anchor from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

/** Adjust these values to whatever you want them to be */
const PRICE = 0.08;
const PURCHASE_THRESHOLD = LAMPORTS_PER_SOL; // purchase if the account has at least 1 SOL
const PURCHASE_PROPORTION = 1; // 100% of yield goes to purchasing tokens

const defaultTreasuryKey = "stdeYBs3MUtQN7zqgAQaxvsYemxncJKNDMJhciHct9M";
const treasuryKey = new PublicKey(
  process.env.TREASURY_KEY ?? defaultTreasuryKey
);

// used in devnet
const defaultMint = "tnct1RC5jg94CJLpiTZc2A2d98MP1Civjh7o6ShmTP6";
const mint = new PublicKey(process.env.MINT ?? defaultMint);

const defaultHoldingAccount = "48V9nmW9awiR9BmihdGhUL3ZpYJ8MCgGeUoSWbtqjicv";
const holdingAccount = new PublicKey(
  process.env.HOLDING_ACCOUNT ?? defaultHoldingAccount
);

// used for devnet testing
const defaultStateAddress = "9QxfwoxkgxE94uoHd3ZPFLmfNhewoFe3Xg5gwgtShYnn";
const stateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultStateAddress
);

(async () => {
  const provider = setUpAnchor();

  // get token account for holding account
  const holdingAccountTokenAddress = getAssociatedTokenAddressSync(
    mint,
    holdingAccount,
    true
  );

  const client = await TreasuryControllerClient.updateController(
    stateAddress,
    provider.publicKey,
    treasuryKey,
    mint,
    holdingAccount,
    holdingAccountTokenAddress,
    PRICE,
    PURCHASE_PROPORTION,
    new anchor.BN(PURCHASE_THRESHOLD),
    1
  );

  console.log("updated state:", client.stateAddress);
})().catch(console.error);
