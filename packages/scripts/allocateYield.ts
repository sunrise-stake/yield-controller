import { PublicKey } from "@solana/web3.js";
import { TreasuryControllerClient, setUpAnchor } from "../client";
import { getAssociatedTokenAddressSync, getAccount } from "@solana/spl-token";
import BN from "bn.js";

const defaultAuthority = "A4c5nctuNSN7jTsjDahv6bAWthmUzmXi3yBocvLYM4Bz";
const authorityKey = new PublicKey(
  process.env.AUTHORITY_KEY ?? defaultAuthority
);

const defaultStateAddress = "9QxfwoxkgxE94uoHd3ZPFLmfNhewoFe3Xg5gwgtShYnn";
const stateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultStateAddress
);

const defaultTreasuryKey = "ALhQPLkXvbLKsH5Bm9TC3CTabKFSmnXFmzjqpTXYBPpu";
const treasuryKey = new PublicKey(
  process.env.TREASURY_KEY ?? defaultTreasuryKey
);

const defaultMint = "tnct1RC5jg94CJLpiTZc2A2d98MP1Civjh7o6ShmTP6";
const mint = new PublicKey(process.env.MINT ?? defaultMint);

const defaultHoldingAccount = "A4c5nctuNSN7jTsjDahv6bAWthmUzmXi3yBocvLYM4Bz";
const holdingAccount = new PublicKey(
  process.env.HOLDING_ACCOUNT ?? defaultHoldingAccount
);

(async () => {
  const provider = setUpAnchor();
  const stateAccount = await TreasuryControllerClient.fetch(stateAddress);
  const holdingAccountTokenAddress = getAssociatedTokenAddressSync(
    mint,
    holdingAccount,
    true
  );
  // get sol holding accounts balance
  const solAccountBalance = await provider.connection.getBalance(stateAddress);
  // get token holding accounts balance
  const tokenAccountBalance = await provider.connection.getTokenAccountBalance(
    holdingAccountTokenAddress
  );
  console.log(
    "holding account token balance:",
    tokenAccountBalance.value.uiAmount
  );
  console.log("state account sol balance:", solAccountBalance);

  if (solAccountBalance === 0) {
    console.log("no tokens to allocate");
    return null;
  }

  if (
    tokenAccountBalance.value.amount < stateAccount.minimumPurchaseThreshold
  ) {
    console.log("not enough tokens to allocate");
    return null;
  }

  // get token account info
  const tokenAccountInfo = await getAccount(
    provider.connection,
    holdingAccountTokenAddress
  );

  if (!tokenAccountInfo.delegate) {
    console.log("token account delegate not set to state address");
    return null;
  }

  console.log("token account delegate:", tokenAccountInfo.delegate.toString());
  console.log("state address:", stateAddress.toString());

  if (tokenAccountInfo.delegate.toString() !== stateAddress.toString()) {
    console.log("token account delegate not set to state address");
    return null;
  }

  await TreasuryControllerClient.allocateYield(
    authorityKey,
    stateAddress,
    treasuryKey,
    mint,
    holdingAccount,
    holdingAccountTokenAddress,
    new BN(solAccountBalance / 10), // send 10% of sol balance to holding account / treasury;
    new BN(Number(100 * 10 ** 9)) // note that i set the delegate amount to 1000 tokens
  );
})().catch(console.error);
