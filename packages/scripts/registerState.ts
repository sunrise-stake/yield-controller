import { setUpAnchor, YieldControllerClient } from "../client/src";
import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

/** Adjust these values to whatever you want them to be */
const PURCHASE_THRESHOLD = 1; // purchase if the account has at least 100 Lamports
const PURCHASE_PROPORTION = 1; // 100% of yield goes to purchasing tokens

const defaultTreasuryKey = "stdeYBs3MUtQN7zqgAQaxvsYemxncJKNDMJhciHct9M";
const treasuryKey = new PublicKey(
  process.env.TREASURY_KEY ?? defaultTreasuryKey
);

// used in devnet
const defaultMint = "tnct1RC5jg94CJLpiTZc2A2d98MP1Civjh7o6ShmTP6";
const mint = new PublicKey(process.env.MINT ?? defaultMint);

const defaultHoldingAccount = "dhcB568T3skiP2D9ujf4eAJEnW2gACaaA9BUCVbwbXD";
const holdingAccount = new PublicKey(
  process.env.HOLDING_ACCOUNT ?? defaultHoldingAccount
);

const solUsdPriceFeed = new PublicKey("GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR");
const nctUsdPriceFeed = new PublicKey("4YL36VBtFkD2zfNGWdGFSc5suvskjrHnx3Asuksyek1J");
const FEED_STALENESS_THRESHOLD = 60 * 60 * 24 * 2; // 2 days

(async () => {
  const provider = setUpAnchor();
  // get token account for holding account
  const holdingAccountTokenAddress = getAssociatedTokenAddressSync(
    mint,
    holdingAccount,
    true
  );

  const client = await YieldControllerClient.register(
    provider.publicKey,
    treasuryKey,
    mint,
    holdingAccount,
    holdingAccountTokenAddress,
    solUsdPriceFeed,
    nctUsdPriceFeed,
    new anchor.BN(FEED_STALENESS_THRESHOLD),
    PURCHASE_PROPORTION,
    new anchor.BN(PURCHASE_THRESHOLD),
    1
  );

  const [yieldAccount] = YieldControllerClient.calculateYieldAccount(
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    client.stateAddress!
  );

  console.log("newly registered state:", client.stateAddress);
  console.log("yield account:", yieldAccount);
})().catch(console.error);
