/* eslint-disable @typescript-eslint/no-var-requires */
import { FundSenderClient } from "../client";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import * as readline from "readline/promises";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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
  // Get new update authority
  let newUpdateAuthority: PublicKey | undefined;

  const updateAuthority = await rl.question(
    "New Update-Authority Address (Leave empty if you don't want to update it): "
  );
  if (updateAuthority === "") {
    console.log("Don't update Update-Authority");
  } else {
    try {
      newUpdateAuthority = new PublicKey(updateAuthority);
      console.log("New Update-Authority:", updateAuthority);
    } catch (e) {
      console.log(e);
    }
  }

  // Get new certificate vault
  let newCertificateVault: PublicKey | undefined;

  const certificateVault = await rl.question(
    "New certificate vault Address (Leave empty if you don't want to update it): "
  );
  if (certificateVault === "") {
    console.log("Don't update certificate vault");
  } else {
    try {
      newCertificateVault = new PublicKey(certificateVault);
      console.log("New certificate vault:", certificateVault);
    } catch (e) {
      console.log(e);
    }
  }

  // Get new destination account
  let newDestinationAccount: PublicKey | undefined;

  const destinationAccount = await rl.question(
    "New Destination Account (Leave empty if you don't want to update it): "
  );
  if (destinationAccount === "") {
    console.log("Don't update Destination Account");
  } else {
    try {
      newDestinationAccount = new PublicKey(destinationAccount);
      console.log("New Destination Account:", destinationAccount);
    } catch (e) {
      console.log(e);
    }
  }

  // Get new spend threshold
  let newSpendThreshold: BN | undefined;

  const spendThreshold = await rl.question(
    "New Spend Threshold (in lamports; leave empty if you don't want to update it): "
  );
  if (spendThreshold === "") {
    console.log("Don't update spending threshold");
  } else {
    try {
      newSpendThreshold = new BN(spendThreshold);
      console.log("New Spend Threshold:", spendThreshold);
    } catch (e) {
      console.log(e);
    }
  }

  rl.close();

  const stateAddress = FundSenderClient.getStateAddressFromSunriseAddress(
    sunriseStateAddress,
    destinationSeed
  );
  const client = await FundSenderClient.fetch(stateAddress);
  if (newDestinationAccount === undefined) {
    const oldDestinationAccount: PublicKey = client.config.destinationAccount;
    newDestinationAccount = oldDestinationAccount;
  }

  if (newSpendThreshold === undefined) {
    const oldSpendThreshold: BN = client.config.spendThreshold;
    newSpendThreshold = oldSpendThreshold;
  }

  // Update destination account and spend threshold
  if (destinationAccount !== "" || spendThreshold !== "") {
    const state = await client.updateDestinationAccount(
      newDestinationAccount,
      newSpendThreshold
    );
    console.log(
      "state account data after updating destination account and/or spending threshold",
      state.config
    );
  }

  // Update authority
  if (newUpdateAuthority !== undefined) {
    const state = await client.updateUpdateAuthority(newUpdateAuthority);
    console.log("state account data after updating authority", state.config);
  }

  // Update certificate vault
  if (newCertificateVault !== undefined) {
    const state = await client.updateCertificateVault(newCertificateVault);
    console.log(
      "state account data after updating certificate vault",
      state.config
    );
  }
})().catch(console.error);
