import { FundSenderClient } from "../client";
import { logBalance } from "./lib/util";
import {PublicKey} from "@solana/web3.js";

// USAGE: yarn ts-node packages/fund-sender/getStateFromAddress.ts stateAddress
const stateAddress = process.argv[2];

(async () => {
  const client = await FundSenderClient.fetch(new PublicKey(stateAddress));
  const log = logBalance(client);

  console.log("state address", stateAddress);
  console.log("state account data", {
    destinationName: client.config.destinationName,
    updateAuthority: client.config.updateAuthority.toBase58(),
    destinationAccount: client.config.destinationAccount.toBase58(),
    certificateVault: client.config.certificateVault.toBase58(),
    spendThreshold: client.config.spendThreshold.toNumber(),
  });
  console.log("input address", client.getInputAccount().toBase58());

  await log("input token", client.getInputAccount());
})().catch(console.error);
