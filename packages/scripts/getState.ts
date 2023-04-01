import { YieldControllerClient } from "../client/src";
import { PublicKey } from "@solana/web3.js";

const defaultStateAddress = "DzyP73X4TWnh5jarfjapaNBxtjeEVsfknWVfToRYARDL"; // mainnet
const stateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultStateAddress
);

(async () => {
  const state = await YieldControllerClient.getYieldAccount(stateAddress);
  console.log("state account data", state);
  console.log("total tokens purchased", state.totalTokensPurchased.toNumber());

  const yieldAccount =
    YieldControllerClient.calculateYieldAccount(stateAddress);
  console.log("yield account", yieldAccount);
})().catch(console.error);
