import chalk from "chalk";
import {fundSenderClients, fundSenderDestinations, getFundSenderAvailableAmount, selectAmount} from "../util";
import readlineSync from "readline-sync";
import BN from "bn.js";

export const submenuRouteToRecipient = async () => {
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

    const availableAmount = await getFundSenderAvailableAmount(client);

    console.log(chalk.magentaBright('\nChoose an amount to route:'));
    const chosenAmountLamports = selectAmount(availableAmount);

    // ask for confirmation:
    const destinationAddress = client.config.destinationAccount.toBase58();
    console.log(chalk.yellow(`Routing ${chosenAmountLamports} lamports to ${destinationAddress}`));
    const confirm = readlineSync.question(chalk.yellow('Confirm (y/n): '));

    if (confirm === 'y') {
        await client.sendFunds(new BN(chosenAmountLamports));
        console.log(chalk.green(`Done`));
    } else {
        console.log(chalk.red('Routing cancelled'));
    }
}