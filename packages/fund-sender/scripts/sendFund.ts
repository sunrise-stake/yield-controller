import { FundSenderClient } from "../client";
import { logBalance } from "./lib/util";
import { PublicKey } from "@solana/web3.js";

// mainnet Sunrise
const defaultSunriseStateAddress =
  "43m66crxGfXSJpmx5wXRoFuHubhHA1GCvtHgmHW6cM1P";
const sunriseStateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultSunriseStateAddress
);

const defaultDestinationSeed = "ecoToken";
const destinationSeed = Buffer.from(
  process.env.DESTINATION_SEED ?? defaultDestinationSeed
);

(async () => {
  const stateAddress = FundSenderClient.getStateAddressFromSunriseAddress(
    sunriseStateAddress,
    destinationSeed
  );
  const client = await FundSenderClient.fetch(stateAddress);

  const log = logBalance(client);

  console.log("state address", stateAddress.toBase58());
  console.log("state account data", client.config);
  console.log(
    "output yield token address",
    client.getOutputYieldAccount(destinationSeed).toBase58()
  );

  await log(
    "output yield token",
    client.getOutputYieldAccount(destinationSeed)
  );

  console.log("Sending fund...");
  await client.sendFunds();

  await log(
    "output yield token",
    client.getOutputYieldAccount(destinationSeed)
  );
})().catch(console.error);
