import chalk from "chalk";
import { fundSenderClients, fundSenderDestinations } from "../util";
import readlineSync from "readline-sync";
import { PublicKey } from "@solana/web3.js";

const destinations = Object.keys(fundSenderDestinations);

export const submenuUpdateDestinationAddress = async () => {
  console.log(chalk.magentaBright("\nChoose a recipient:"));
  destinations.forEach((destinationName, index) => {
    console.log(chalk.cyanBright(`${index + 1}) ${destinationName}`));
  });
  console.log(chalk.cyanBright(`${destinations.length + 1}) Cancel`));

  const choice = readlineSync.keyIn(chalk.yellow("\nEnter your choice: "), {
    limit: `$<1-${destinations.length}>`,
  });

  if (choice === `${destinations.length + 1}`) {
    return;
  }

  const destinationName = destinations[parseInt(choice) - 1];
  const client = fundSenderClients.find(
    (c) => c.config.destinationName === destinationName
  );

  if (!client) throw new Error("Client not found - trigger a refresh");

  // ask for address
  const newDestinationAddress = readlineSync.question(
    chalk.yellow("Enter the new destination address: ")
  );

  // verify it is a valid Solana address
  let newDestinationAddressKey: PublicKey;
  try {
    newDestinationAddressKey = new PublicKey(newDestinationAddress);
  } catch (e) {
    console.log(chalk.red("Invalid address"));
    return;
  }

  // ask for confirmation:
  console.log(
    chalk.yellow(
      `New destination address: ${newDestinationAddressKey.toBase58()}`
    )
  );
  const confirm = readlineSync.question(chalk.yellow("Confirm (y/n): "));

  if (confirm === "y") {
    await client.updateDestinationAccount(
      newDestinationAddressKey,
      client.config.spendThreshold
    );
    console.log(chalk.green(`Done`));
  } else {
    console.log(chalk.red("Update cancelled"));
  }
};
