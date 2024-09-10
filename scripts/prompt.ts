import chalk from 'chalk';
import readlineSync from 'readline-sync';
import {showData} from "./util";
import {submenuRouteToRecipient} from "./submenu/routeToRecipient";
import {submenuAllocateYield} from "./submenu/allocateYield";

export const showMenu = async () => {
    console.log(chalk.magentaBright('\nChoose an option:'));
    console.log(chalk.cyanBright('1) Refresh'));
    console.log(chalk.cyanBright('2) Allocate Yield'));
    console.log(chalk.cyanBright('3) Route Funds to Recipient'));
    console.log(chalk.cyanBright('4) Update Proportions'));
    console.log(chalk.cyanBright('5) Add Recipient'));
    console.log(chalk.cyanBright('6) Remove Recipient'));
    console.log(chalk.cyanBright('7) Quit'));

    const choice = readlineSync.keyIn(chalk.yellow('\nEnter your choice: '), { limit: '$<1-7>' });

    switch (choice) {
        case '1':
            console.log(chalk.green('Refreshing...'));
            await showData();
            break;
        case '2':
            await submenuAllocateYield();
            break;
        case '3':
            await submenuRouteToRecipient();
            break;
        case '4':
            console.log(chalk.green('Updating proportions...'));
            // Call your update proportions function here
            break;
        case '5':
            console.log(chalk.green('Adding recipient...'));
            // Call your add recipient function here
            break;
        case '6':
            console.log(chalk.green('Removing recipient...'));
            // Call your remove recipient function here
            break;
        case '7':
            console.log(chalk.green('Exiting...'));
            process.exit(0);
            break;
        default:
            console.log(chalk.red('Invalid choice, please try again.'));
            showMenu(); // Re-display menu for invalid input
            break;
    }
    showMenu();
};