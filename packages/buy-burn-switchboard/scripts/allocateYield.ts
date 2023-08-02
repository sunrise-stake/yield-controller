import { PublicKey } from "@solana/web3.js";
import { YieldControllerClient, setUpAnchor } from "../client/src";
import { getAccount } from "@solana/spl-token";

const defaultStateAddress = "DzyP73X4TWnh5jarfjapaNBxtjeEVsfknWVfToRYARDL";
const stateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultStateAddress
);

(async () => {
  const provider = setUpAnchor();
  const client = await YieldControllerClient.get(provider, stateAddress);
  const stateAccount = await client.getState();
  // get sol holding accounts balance
  const solAccountBalance = await provider.connection.getBalance(stateAddress);
  // get token holding accounts balance
  const tokenAccountBalance = await provider.connection.getTokenAccountBalance(
    stateAccount.holdingTokenAccount
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
    Number(tokenAccountBalance.value.amount) <
    stateAccount.purchaseThreshold.toNumber()
  ) {
    console.log("not enough tokens to allocate");
    return null;
  }

  // get token account info
  const tokenAccountInfo = await getAccount(
    provider.connection,
    stateAccount.holdingTokenAccount
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
  await client.allocateYield(provider.publicKey);
})().catch(console.error);
