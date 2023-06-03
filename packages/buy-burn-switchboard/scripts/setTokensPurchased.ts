import { setUpAnchor, YieldControllerClient } from "../client/src";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

const defaultStateAddress = "DzyP73X4TWnh5jarfjapaNBxtjeEVsfknWVfToRYARDL";
const stateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultStateAddress
);

const newTokensPurchased = new BN(process.argv[2], 10);

(async () => {
  const provider = setUpAnchor();
  const client = await YieldControllerClient.get(provider, stateAddress);

  console.log(
    "current tokens purchased",
    (await client.getState()).totalTokensPurchased.toString()
  );
  console.log("changing to tokens purchased", newTokensPurchased.toNumber());
  const txSig = await client.setTotalTokensPurchased(newTokensPurchased);

  console.log("updated tokens purchased - txSig", txSig);
})().catch(console.error);
