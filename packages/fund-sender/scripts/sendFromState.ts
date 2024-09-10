import { FundSenderClient } from "../client";
import { PublicKey } from "@solana/web3.js";

// mainnet Sunrise
const defaultSunriseStateAddress =
  "43m66crxGfXSJpmx5wXRoFuHubhHA1GCvtHgmHW6cM1P";
const sunriseStateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultSunriseStateAddress
);

// USAGE: yarn ts-node packages/fund-sender/sendFromState.ts destinationName
const destinationName = process.argv[2];

(async () => {
  const stateAddress = FundSenderClient.getStateAddressFromSunriseAddress(
      sunriseStateAddress,
      destinationName
  );
  const client = await FundSenderClient.fetch(stateAddress);

  console.log("state address", stateAddress.toBase58());
  console.log("input address", client.getInputAccount().toBase58());

  const stateBalance = await client.provider.connection.getBalance(stateAddress);
  console.log("state balance", stateBalance);

  console.log("Sending fund...");
  await client.sendFromState();
})().catch(console.error);
