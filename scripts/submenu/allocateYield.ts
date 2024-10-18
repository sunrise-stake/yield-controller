import chalk from "chalk";
import {
    getBalance,
    getFundSenderData, printBalance,
    selectAmount,
    yieldRouterClient
} from "../util";
import readlineSync from "readline-sync";
import BN from "bn.js";

export const submenuAllocateYield = async () => {
    const availableAmount = await getBalance(yieldRouterClient.getInputYieldAccount())

    // if there is no balance, cancel
    if (!availableAmount) {
        console.log(chalk.red('No balance available to allocate'));
        return;
    }

    console.log(chalk.magentaBright('\nChoose an amount to allocate:'));
    const chosenAmountLamports = selectAmount(availableAmount);

    const fundSenderData = await getFundSenderData();

    // Calculate the allocations for each recipient based on the chosen amount
    const allocations = fundSenderData.map(({ fundSenderName, allocation }) => ({
        name: fundSenderName,
        allocation: chosenAmountLamports * (allocation / 100)
        })
    );

    // present the allocations to the user and ask for confirmation:
    console.log(chalk.magentaBright('\nAllocations:'));
    allocations.forEach(({ name, allocation }) => {
        console.log(chalk.cyanBright(`${name}: ${printBalance(allocation)}`));
    });

    const confirm = readlineSync.question(chalk.yellow('Confirm (y/n): '));
    if (confirm === 'y') {
        await yieldRouterClient.allocateYield(new BN(chosenAmountLamports));
        console.log(chalk.green(`Done`));
    } else {
        console.log(chalk.red('Routing cancelled'));
    }
}