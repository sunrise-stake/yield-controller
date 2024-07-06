import { FundSenderClient } from "../client";
import { logBalance } from "./lib/util";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

// mainnet Sunrise
const defaultSunriseStateAddress =
  "43m66crxGfXSJpmx5wXRoFuHubhHA1GCvtHgmHW6cM1P";
const sunriseStateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultSunriseStateAddress
);

// USAGE: yarn ts-node packages/fund-sender/sendFund.ts destinationName amount
const destinationName = process.argv[2];
const amount = parseInt(process.argv[3] ?? "0", 10);

(async () => {
  const stateAddress = FundSenderClient.getStateAddressFromSunriseAddress(
    sunriseStateAddress,
    destinationName
  );
  const client = await FundSenderClient.fetch(stateAddress);

  const log = logBalance(client);

  console.log("state address", stateAddress.toBase58());
  console.log("input address", client.getInputAccount().toBase58());

  await log("input", client.getInputAccount());

  console.log("Sending fund...");
  await client.sendFunds(new BN(amount));

  await log("output", client.getInputAccount());
})().catch(console.error);
