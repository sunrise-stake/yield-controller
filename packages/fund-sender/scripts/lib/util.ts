import os from "os";
import { PublicKey, Cluster, clusterApiUrl } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";
import { FundSenderClient } from "../../client";

export const idWallet = os.homedir() + "/.config/solana/id.json";

process.env.ANCHOR_PROVIDER_URL =
  process.env.ANCHOR_PROVIDER_URL ??
  clusterApiUrl(
    (process.env.REACT_APP_SOLANA_NETWORK ?? "devnet" ?? "") as Cluster
  );
process.env.ANCHOR_WALLET = process.env.ANCHOR_WALLET ?? idWallet;

export const logBalance =
  (client: FundSenderClient) => async (prefix: string, account: PublicKey) => {
    const accountInfo = await client.provider.connection.getAccountInfo(
      account
    );
    console.log(`${prefix} balance`, accountInfo?.lamports);
  };

export const logSplBalance =
  (client: FundSenderClient) => async (prefix: string, account: PublicKey) => {
    const accountInfo = await getAccount(client.provider.connection, account);
    console.log(`${prefix} balance`, accountInfo?.amount);
  };
