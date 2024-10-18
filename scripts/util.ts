import {LAMPORTS_PER_SOL, PublicKey} from "@solana/web3.js";
import {getAccount} from "@solana/spl-token";
import chalk from "chalk";
import {InitialisedClient, YieldRouterClient} from "../packages/yield-router/client";
import {FundSenderClient, FundSenderConfig} from "../packages/fund-sender/client";
import Table from "cli-table3";
import readlineSync from "readline-sync";

type FundSenderType = {
    type: 'spl'
} | {
    type: 'cnft', lookupTable: PublicKey
};

export const fundSenderDestinations: Record<string, FundSenderType> = {
    ecotoken: { type: 'cnft', lookupTable: new PublicKey('FmV5V5C3kd9X7bXgFCeFbfBGyt46eUMy6s2kb3rZPudm')},
    toucan: { type: 'spl' },
    loompact: { type: 'spl' }
}

export const defaultSunriseStateAddress =
    "43m66crxGfXSJpmx5wXRoFuHubhHA1GCvtHgmHW6cM1P";

export const sunriseStateAddress = new PublicKey(
    process.env.STATE_ADDRESS ?? defaultSunriseStateAddress
);

export const stateAddress =
    YieldRouterClient.getStateAddressFromSunriseAddress(sunriseStateAddress);

export let yieldRouterClient: InitialisedClient;

export const getBalance =
    async (account: PublicKey): Promise<number | undefined> => {
        const accountInfo = await yieldRouterClient.provider.connection.getAccountInfo(
            account
        );
        return accountInfo?.lamports
    };

export const getSplBalance =
    async (account: PublicKey): Promise<bigint | undefined> => {
        const accountInfo = await getAccount(yieldRouterClient.provider.connection, account);
        return accountInfo?.amount;
    };

export const printBalance = (balance: number | undefined, defaultVal = 0): string => {
    const solVal = balance ? balance / 10 ** 9 : 0;

    let roundedSolVal: string;

    if (solVal >= 1000) {
        // Show no decimals for values >= 1000
        roundedSolVal = Math.floor(solVal).toLocaleString();
    } else if (solVal < 1) {
        // Show two most significant decimal places for values < 1
        roundedSolVal = solVal.toPrecision(2);
    } else {
        // Show two decimal places for values between 1 and 999.99
        roundedSolVal = solVal.toFixed(2);
    }

    return `${chalk.green(roundedSolVal)} SOL`;
};

export let fundSenderClients: (FundSenderClient & {
    config: FundSenderConfig;
})[];

const getFundSenderClients = () => Promise.all(
    Object.keys(fundSenderDestinations).map(async (destinationName) => {
        const stateAddress = FundSenderClient.getStateAddressFromSunriseAddress(
            sunriseStateAddress,
            destinationName
        );
        return await FundSenderClient.fetch(stateAddress);
    })
);

export const getFundSenderAvailableAmount = async (client: FundSenderClient): Promise<number> => {
    const inputAccount = client.getInputAccount();
    const balance =  await getBalance(inputAccount);
    const minimumRentExemption = await client.provider.connection.getMinimumBalanceForRentExemption(0);
    return Math.max((balance ?? 0)  - minimumRentExemption, 0);
}

export const getFundSenderData = () => {
    return Promise.all(yieldRouterClient.config.outputYieldAccounts.map(async (a, index) => {
        const fundSenderClient = fundSenderClients.find(c => c.getInputAccount().equals(a));
        const balance = await getBalance(a);
        const destinationAddress = fundSenderClient?.config.destinationAccount;
        const destinationBalance = destinationAddress ? await getBalance(destinationAddress) : undefined;
        const fundSenderThreshold = fundSenderClient?.config.spendThreshold?.toNumber() ?? 0;
        const allocation = yieldRouterClient.config.spendProportions[index];
        return {
            address: a.toBase58(),
            allocation,
            balance,
            fundSender: fundSenderClient,
            fundSenderName: fundSenderClient?.config.destinationName ?? "Not Fund Sender Destination",
            destinationAddress: destinationAddress?.toBase58(),
            destinationBalance,
            fundSenderThreshold
        }
    }));
}

export const showData = async () => {
    yieldRouterClient = await YieldRouterClient.fetch(stateAddress);
    console.clear();

    fundSenderClients = await getFundSenderClients();

    const fundSenderData = await getFundSenderData();

// Table for state account data
    const stateTable = new Table({
        head: [chalk.blueBright('Property'), chalk.blueBright('Value')],
        colWidths: [30, 80]
    });

    const inputBalance = await getBalance(yieldRouterClient.getInputYieldAccount());

// Populate state account table
    stateTable.push(
        { 'State Address': yieldRouterClient.stateAddress.toBase58() },
        { 'Update Authority': yieldRouterClient.config.updateAuthority.toBase58() },
        { 'Spend Proportions': yieldRouterClient.config.spendProportions.join(', ') },
        { 'Spend Threshold': yieldRouterClient.config.spendThreshold.toString() },
        { 'Input Address': yieldRouterClient.getInputYieldAccount().toBase58() },
        { 'Balance': printBalance(inputBalance) }
    );

// Display state account data
    console.log(chalk.magentaBright('Yield Router:\n'));
    console.log(stateTable.toString());

// Table for output yield accounts
    const outputTable = new Table({
        head: [
            chalk.blueBright('Fund Sender Name'),
            chalk.blueBright('Allocation'),
            chalk.blueBright('Address'),
            chalk.blueBright('Balance'),
            chalk.blueBright('Destination'),
            chalk.blueBright('Dest. Balance'),
            chalk.blueBright('Min. Spend')
        ],
        colWidths: [25, 15, 50, 20, 50, 20, 20]
    });

// Populate the output yield accounts table
    fundSenderData.forEach((account) => {
        outputTable.push([
            chalk.yellow(account.fundSenderName),
            `${account.allocation}%`,
            account.address,
            printBalance(account.balance),
            account.destinationAddress,
            printBalance(account.destinationBalance),
            printBalance(account.fundSenderThreshold)
        ]);
    });

// Display the output yield accounts table
    console.log(chalk.magentaBright('Output Yield Accounts:'));
    console.log(outputTable.toString());
}

export const selectAmount = (maxLamports: number): number => {
    const maxSol = maxLamports / LAMPORTS_PER_SOL;
    const formattedMaxSol = printBalance(maxLamports);  // Display SOL according to your rules

    const inputSol = readlineSync.question(
        chalk.yellow(`\nEnter amount in SOL (default: ${formattedMaxSol}): `),
        { defaultInput: maxSol.toString() }  // Set default as max SOL amount
    );

    const selectedSol = Number(inputSol);

    if (isNaN(selectedSol) || selectedSol <= 0 || selectedSol > maxSol) {
        console.log(chalk.red(`Invalid amount. Please enter a number between 0 and ${formattedMaxSol}.`));
        return selectAmount(maxLamports);  // Re-prompt the user if input is invalid
    }

      // Convert SOL back to lamports
    return Math.floor(selectedSol * LAMPORTS_PER_SOL);
};
