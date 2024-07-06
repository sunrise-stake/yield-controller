import { logBalance } from "./lib/util";
import { YieldRouterClient } from "../client";
import { PublicKey } from "@solana/web3.js";

// mainnet Sunrise
const defaultSunriseStateAddress =
  "43m66crxGfXSJpmx5wXRoFuHubhHA1GCvtHgmHW6cM1P";
const sunriseStateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultSunriseStateAddress
);

(async () => {
  const stateAddress =
    YieldRouterClient.getStateAddressFromSunriseAddress(sunriseStateAddress);
  console.log("state address", stateAddress.toBase58());
  const client = await YieldRouterClient.fetch(stateAddress);
  const log = logBalance(client);

  console.log("state address", stateAddress.toBase58());
  console.log("state account data", {
    updateAuthority: client.config.updateAuthority.toBase58(),
    outputYieldAccounts: client.config.outputYieldAccounts
      .map((k) => k.toBase58())
      .join(", "),
    spendProportions: client.config.spendProportions,
    spendThreshold: client.config.spendThreshold.toString(),
  });
  console.log(
    "input yield token address",
    client.getInputYieldAccount().toBase58()
  );

  await log("input yield token", client.getInputYieldAccount());

  for (const outputYieldAccount of client.config.outputYieldAccounts) {
    await log(
      `output yield address ${outputYieldAccount.toBase58()}`,
      outputYieldAccount
    );
  }
})().catch(console.error);
