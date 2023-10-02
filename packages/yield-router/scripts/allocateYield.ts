import { YieldRouterClient } from "../client";
import { logBalance } from "./lib/util";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

// mainnet Sunrise
const defaultSunriseStateAddress =
  "43m66crxGfXSJpmx5wXRoFuHubhHA1GCvtHgmHW6cM1P";
const sunriseStateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultSunriseStateAddress
);

if (!(process.env.AMOUNT ?? "")) {
  throw new Error("AMOUNT env variable must be set");
}
const amount = parseInt(
  process.env.AMOUNT !== undefined ? process.env.AMOUNT : "0",
  10
);

(async () => {
  const stateAddress =
    YieldRouterClient.getStateAddressFromSunriseAddress(sunriseStateAddress);
  const client = await YieldRouterClient.fetch(stateAddress);

  const log = logBalance(client);

  console.log("state address", stateAddress.toBase58());
  console.log("state account data", client.config);
  console.log(
    "input yield token address",
    client.getInputYieldAccount().toBase58()
  );

  await log("input yield token", client.getInputYieldAccount());

  for (const outputYieldAccount of client.config.outputYieldAccounts) {
    await log("output yield token", outputYieldAccount);
  }

  console.log("Allocating yield...");
  await client.allocateYield(new BN(amount));

  await log("input yield token", client.getInputYieldAccount());

  for (const outputYieldAccount of client.config.outputYieldAccounts) {
    await log("output yield token", outputYieldAccount);
  }
})().catch(console.error);
