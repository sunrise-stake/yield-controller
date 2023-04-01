import { setUpAnchor, YieldControllerClient } from "../client/src";
import { PublicKey } from "@solana/web3.js";

/** Adjust these values to whatever you want them to be */
const SOL_PRICE_IN_USD_CENTS = 2095;
const CARBON_TOKEN_PRICE_IN_USD_CENTS = 196;
const CARBON_TOKEN_PRICE_IN_SOL =
  CARBON_TOKEN_PRICE_IN_USD_CENTS / SOL_PRICE_IN_USD_CENTS;

// used for devnet testing
const defaultStateAddress = "htGs6L3pCRxgfkJP2vLUdb9hVPtcE4mKsdWP4CnirQA";
const stateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultStateAddress
);

(async () => {
  const provider = setUpAnchor();
  const client = await YieldControllerClient.get(provider, stateAddress);

  console.log("current price", (await client.getState()).price);
  console.log("changing to price", CARBON_TOKEN_PRICE_IN_SOL);
  const txSig = await client.setPrice(CARBON_TOKEN_PRICE_IN_SOL);

  console.log("updated price - txSig", txSig);
})().catch(console.error);
