import chalk from 'chalk';
import readlineSync from 'readline-sync';
import {showData} from "./util";
import {submenuRouteToRecipient} from "./submenu/routeToRecipient";
import {submenuAllocateYield} from "./submenu/allocateYield";
import {submenuUpdateProportions} from "./submenu/updateProportions";
import {submenuUpdateDestinationAddress} from "./submenu/updateDestinationAddress";
import {submenuStoreCertificates} from "./submenu/storeCertificates";

export const showMenu = async () => {
    console.log(chalk.magentaBright('\nChoose an option:'));
    console.log(chalk.cyanBright('1) Refresh'));
    console.log(chalk.cyanBright('2) Allocate Yield'));
    console.log(chalk.cyanBright('3) Route Funds to Recipient'));
    console.log(chalk.cyanBright('4) Update Proportions'));
    console.log(chalk.cyanBright('5) Update Recipient Address'));
    console.log(chalk.cyanBright('6) Store Certificates'));
    console.log(chalk.cyanBright('7) Add Recipient'));
    console.log(chalk.cyanBright('8) Remove Recipient'));
    console.log(chalk.cyanBright('9) Quit'));

    const choice = readlineSync.keyIn(chalk.yellow('\nEnter your choice: '), { limit: '$<1-8>' });

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
            await submenuUpdateProportions();
            break;
        case '5':
            await submenuUpdateDestinationAddress();
            break;
        case '6':
            await submenuStoreCertificates();
            break;
        case '7':
            console.log(chalk.green('Adding recipient...'));
            break;
        case '8':
            console.log(chalk.green('Removing recipient...'));
            break;
        case '9':
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