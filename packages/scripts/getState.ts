import { YieldControllerClient } from "../client/src";
import { PublicKey } from "@solana/web3.js";

const defaultStateAddress = "htGs6L3pCRxgfkJP2vLUdb9hVPtcE4mKsdWP4CnirQA";  // mainnet
const stateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultStateAddress
);

(async () => {
  const state = await YieldControllerClient.getYieldAccount(stateAddress);
  console.log("state account data", state);

  const yieldAccount = YieldControllerClient.calculateYieldAccount(stateAddress);
  console.log("yield account", yieldAccount);
})().catch(console.error);
