import chalk from "chalk";
import {fundSenderClients, fundSenderDestinations} from "../util";
import {FundSenderClient, FundSenderConfig} from "../../packages/fund-sender/client";
import readlineSync from "readline-sync";
import {TOKEN_PROGRAM_ID} from "@solana/spl-token";
import {PublicKey} from "@solana/web3.js";

const destinations = Object.keys(fundSenderDestinations);

type ConfiguredClient = (FundSenderClient & {
    config: FundSenderConfig;
})

const processSPLCertificates = async (client: ConfiguredClient) => {
    const allInputTokenAccountsResponse =
        await client.provider.connection.getParsedTokenAccountsByOwner(
            client.getInputAccount(),
            {
                programId: TOKEN_PROGRAM_ID,
            }
        );

    const allInputTokenAccounts = allInputTokenAccountsResponse.value;

    if (allInputTokenAccounts.length === 0) {
        console.log("No certificates to store.");
        return;
    }

    console.log(`Storing ${allInputTokenAccounts.length} certificates...`);
    for (const inputTokenAccount of allInputTokenAccounts) {
        const mint = new PublicKey(inputTokenAccount.account.data.parsed.info.mint);
        await client.storeCertificates(inputTokenAccount.pubkey, mint);
    }
}

const processCNFTCertificates = async (client: ConfiguredClient, destination: { lookupTable: PublicKey }) => {
    const assets = await client.getCNFTCertificates();
    console.log("number of CNFT certificates", assets.length);

    if (assets.length === 0) {
        console.log("No certificates to store.");
        return;
    }

    let cnftAddressLookupTable = destination.lookupTable;
    if (!cnftAddressLookupTable) {
        console.log("No CNFT address lookup table provided - creating...");
        cnftAddressLookupTable = await client.createALTForCNFTTransfer();
        console.log("Created CNFT address lookup table", cnftAddressLookupTable.toBase58());
    }

    console.log(`Storing ${assets.length} certificates...`);
    for (const asset of assets) {
        await client.storeCNFTCertificate(asset.id, cnftAddressLookupTable);
    }
}

export const submenuStoreCertificates = async () => {
    console.log(chalk.magentaBright('\nChoose a retirement certificate source:'));
    destinations.forEach((destinationName, index) => {
        console.log(chalk.cyanBright(`${index + 1}) ${destinationName}`));
    });
    console.log(chalk.cyanBright(`${destinations.length + 1}) Cancel`));

    const choice = readlineSync.keyIn(chalk.yellow('\nEnter your choice: '), { limit: `$<1-${destinations.length}>` });

    if (choice === `${destinations.length + 1}`) {
        return;
    }

    const destinationName = destinations[parseInt(choice) - 1] as keyof typeof fundSenderDestinations;
    const client = fundSenderClients.find(c => c.config.destinationName === destinationName);

    if (!client) throw new Error('Client not found - trigger a refresh');

    if (fundSenderDestinations[destinationName].type === "cnft") {
        await processCNFTCertificates(client, fundSenderDestinations[destinationName] as { lookupTable: PublicKey });
    } else {
        await processSPLCertificates(client);
    }


}