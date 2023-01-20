import { PublicKey } from "@solana/web3.js";
import { TreasuryControllerClient, setUpAnchor } from "../client";
import { getAssociatedTokenAddressSync, getAccount } from "@solana/spl-token";

const defaultStateAddress = "EDNq7UqUJQzU87n1k9kj1eWRKngJgYc4oVW8MHsA1Gs3";
const stateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultStateAddress
);

(async () => {
  const provider = setUpAnchor();
  const stateAccount = await TreasuryControllerClient.fetch(stateAddress);
  const holdingAccountTokenAddress = getAssociatedTokenAddressSync(
    stateAccount.mint,
    stateAccount.holdingAccount,
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
    provider.publicKey,
    stateAddress
  );
})().catch(console.error);
