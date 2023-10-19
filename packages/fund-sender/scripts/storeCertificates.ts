import { FundSenderClient } from "../client";
import { logSplBalance } from "./lib/util";
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

// account from which to transfer certificate
const defaultOutputTokenAddress = "";
const outputTokenAddress = new PublicKey(
  process.env.OUTPUT_TOKEN_ADDRESS ?? defaultOutputTokenAddress
);

(async () => {
  const stateAddress = FundSenderClient.getStateAddressFromSunriseAddress(
    sunriseStateAddress,
    destinationSeed
  );
  const client = await FundSenderClient.fetch(stateAddress);

  const log = logSplBalance(client);

  console.log("state address", stateAddress.toBase58());
  console.log("state account data", client.config);
  console.log(
    "output certificate token address",
    client.getOutputYieldAccount(destinationSeed).toBase58()
  );

  await log(
    "output certificate token",
    client.getOutputYieldAccount(destinationSeed)
  );

  console.log("Storing certificates...");
  await client.storeCertificates(outputTokenAddress);

  await log(
    "output certificate token",
    client.getOutputYieldAccount(destinationSeed)
  );
})().catch(console.error);
