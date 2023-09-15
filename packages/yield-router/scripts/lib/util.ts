import os from "os";
import { PublicKey, Cluster, clusterApiUrl } from "@solana/web3.js";
import {YieldRouterClient} from "../../client";

export const idWallet = os.homedir() + "/.config/solana/id.json";

process.env.ANCHOR_PROVIDER_URL =
    process.env.ANCHOR_PROVIDER_URL ?? clusterApiUrl((process.env.REACT_APP_SOLANA_NETWORK  || 'devnet') as Cluster);
process.env.ANCHOR_WALLET = process.env.ANCHOR_WALLET ?? idWallet;

export const logBalance = (client: YieldRouterClient) => async (prefix: string, account: PublicKey) => {
    const accountInfo = await client.provider.connection.getAccountInfo(account);
    console.log(`${prefix} balance`, accountInfo?.lamports);
}