/* eslint-disable @typescript-eslint/no-var-requires */
import { YieldRouterClient } from "../client";
import { PublicKey } from "@solana/web3.js";
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

  // Get new output yield addresses and proportions
  const newOutputYieldAddresses: PublicKey[] = [];
  const newSpendProportions: number[] = [];

  let sumProportions = newSpendProportions.reduce(
    (sum, current) => sum + current,
    0
  );

  const answer = await rl.question(
    "Do you want to update output yield accounts? [y/n] "
  );
  let i = 1;
  switch (answer.toLowerCase()) {
    case "y":
      while (sumProportions < 100) {
        try {
          const yieldAddress = await rl.question(`Output yield address ${i}: `);
          newOutputYieldAddresses.push(new PublicKey(yieldAddress));

          const proportionStr = await rl.question(
            `Proportion (1-100) for ${yieldAddress}: `
          );
          const proportion = Number.parseFloat(proportionStr);

          newSpendProportions.push(proportion);
          sumProportions += proportion;
          if (sumProportions > 100) {
            console.log(
              "The proportions don't add up! Sum of proportions:",
              sumProportions
            );
            break;
          }
        } catch (e) {
          console.log(e);
          break;
        }

        i++;
      }
      break;
    case "n":
      console.log("Don't update output yield accounts");
      break;
    default:
      console.log("Invalid answer!");
  }

  rl.close();

  const stateAddress =
    YieldRouterClient.getStateAddressFromSunriseAddress(sunriseStateAddress);
  const client = await YieldRouterClient.fetch(stateAddress);

  // Update output yield accounts and proportions
  if (sumProportions === 100 && answer.toLocaleLowerCase() === "y") {
    const state = await client.updateOutputYieldAccounts(
      newOutputYieldAddresses,
      newSpendProportions
    );
    console.log(
      "state account data after updating output yield accounts",
      state.config
    );
  }

  // Update authority
  if (newUpdateAuthority !== undefined) {
    const state = await client.updateUpdateAuthority(newUpdateAuthority);
    console.log("state account data after updating authority", state.config);
  }
})().catch(console.error);
