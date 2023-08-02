import { BuyBurnFixedClient } from "../client";
import { PublicKey } from "@solana/web3.js";

// used for devnet testing
const defaultStateAddress = "CaFanGeqN6ykNTGTE7U2StJ8n1RJY6on6FoDFeLxabia";
const stateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultStateAddress
);

(async () => {
  const state = await BuyBurnFixedClient.fetch(stateAddress);
  console.log("state account data", state);
})().catch(console.error);
