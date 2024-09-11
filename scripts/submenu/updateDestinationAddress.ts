import chalk from "chalk";
import {fundSenderClients, fundSenderDestinations, getFundSenderAvailableAmount, selectAmount} from "../util";
import readlineSync from "readline-sync";
import BN from "bn.js";
import {PublicKey} from "@solana/web3.js";

export const submenuUpdateDestinationAddress = async () => {
    console.log(chalk.magentaBright('\nChoose a recipient:'));
    fundSenderDestinations.forEach((destinationName, index) => {
        console.log(chalk.cyanBright(`${index + 1}) ${destinationName}`));
    });
    console.log(chalk.cyanBright(`${fundSenderDestinations.length + 1}) Cancel`));

    const choice = readlineSync.keyIn(chalk.yellow('\nEnter your choice: '), { limit: `$<1-${fundSenderDestinations.length}>` });

    if (choice === `${fundSenderDestinations.length + 1}`) {
        return;
    }

    const destinationName = fundSenderDestinations[parseInt(choice) - 1];
    const client = fundSenderClients.find(c => c.config.destinationName === destinationName);

    if (!client) throw new Error('Client not found - trigger a refresh');

    // ask for address
    const newDestinationAddress = readlineSync.question(chalk.yellow('Enter the new destination address: '));

    // verify it is a valid Solana address
    let newDestinationAddressKey: PublicKey;
    try {
        newDestinationAddressKey = new PublicKey(newDestinationAddress);
    } catch (e) {
        console.log(chalk.red('Invalid address'));
        return;
    }

    // ask for confirmation:
    console.log(chalk.yellow(`New destination address: ${newDestinationAddressKey.toBase58()}`));
    const confirm = readlineSync.question(chalk.yellow('Confirm (y/n): '));

    if (confirm === 'y') {
        await client.updateDestinationAccount(newDestinationAddressKey, client.config.spendThreshold);
        console.log(chalk.green(`Done`));
    } else {
        console.log(chalk.red('Update cancelled'));
    }
}