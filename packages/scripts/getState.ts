import { TreasuryControllerClient } from "../client";
import { PublicKey } from "@solana/web3.js";

// used for devnet testing
const defaultStateAddress = "9QxfwoxkgxE94uoHd3ZPFLmfNhewoFe3Xg5gwgtShYnn";
const stateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultStateAddress
);

(async () => {
  const state = await TreasuryControllerClient.fetch(stateAddress);
  console.log("state account data", state);
})().catch(console.error);
