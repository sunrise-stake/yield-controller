import chalk from "chalk";
import {
    getFundSenderData,
    yieldRouterClient
} from "../util";
import readlineSync from "readline-sync";

export const submenuUpdateProportions = async () => {
    // ask for confirmation:
    const confirm = readlineSync.question(chalk.yellow('Update allocation proportions? (y/n): '));
    if (confirm !== 'y') return;

    const fundSenderData = await getFundSenderData();

    const newAllocations = fundSenderData.map((data, index) => {
        const destinationName = data.fundSenderName
        const currentAllocation = data.allocation

        console.log(chalk.cyanBright(`${index + 1}: ${destinationName} Current allocation: ${currentAllocation}%. `));

        // a regex that matches a number between 0 and 100
        return readlineSync.question('New allocation:', { limit: /^([0-9]|[1-9][0-9]|100)$/ });
    });

    // ensure the new allocations sum to 100
    const sum = newAllocations.reduce((acc, curr) => acc + Number(curr), 0);
    if (sum !== 100) {
        console.log(chalk.red('New allocations do not sum to 100%'));
        return;
    }

    // ask for confirmation:
    console.log(chalk.magentaBright('\nNew allocations:'));
    newAllocations.forEach((allocation, index) => {
        console.log(chalk.cyanBright(`${fundSenderData[index].fundSenderName}: ${allocation}%`));
    });
    const confirmUpdate = readlineSync.question(chalk.yellow('Confirm update (y/n): '));
    if (confirmUpdate !== 'y') return;

    const outputYieldAccounts = yieldRouterClient.config.outputYieldAccounts;
    const spendProportions = newAllocations.map(a => Number(a));
    await yieldRouterClient.updateOutputYieldAccounts(outputYieldAccounts, spendProportions);

    console.log(chalk.green(`Done`));
}