/* eslint-disable @typescript-eslint/no-var-requires */
import { YieldRouterClient } from "../client";
import { PublicKey } from "@solana/web3.js";

// mainnet Sunrise
const defaultSunriseStateAddress =
  "43m66crxGfXSJpmx5wXRoFuHubhHA1GCvtHgmHW6cM1P";
const sunriseStateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultSunriseStateAddress
);

// mainnet offset bridge wrapped SOL ATA
const outputYieldAddresses = [
  new PublicKey("4XTLzYF3kteTbb3a9NYYjeDAYwNoEGSkjoqJYkiLCnmm"),
];
const spendProportions = [100];

// new update authority
// very dangerous, isn't it?
// we can set the authority to some address where we don't have the private key
// so we can never change the authority ever again
const newUpdateAuthority = new PublicKey("");

(async () => {
  const stateAddress =
    YieldRouterClient.getStateAddressFromSunriseAddress(sunriseStateAddress);
  const client = await YieldRouterClient.fetch(stateAddress);

  // Update output yield accounts
  let state = await client.updateOutputYieldAccounts(
    outputYieldAddresses,
    spendProportions
  );
  console.log(
    "state account data after updating output yield accounts",
    state.config
  );

  state = await client.updateUpdateAuthority(newUpdateAuthority);
  console.log("state account data after updating authority", state.config);
})().catch(console.error);
