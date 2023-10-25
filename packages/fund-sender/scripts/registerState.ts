/* eslint-disable @typescript-eslint/no-var-requires */
import { FundSenderClient } from "../client";
import { Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

// mainnet Sunrise
const defaultSunriseStateAddress =
  "43m66crxGfXSJpmx5wXRoFuHubhHA1GCvtHgmHW6cM1P";
const sunriseStateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultSunriseStateAddress
);

// Sunrise Treasury
const defaultSunriseTreasuryAddress =
  "Bup7DZk56XwQUDzuvBz9nzbr8e2iLPVrBpha1KTfEbbJ";
const sunriseTreasuryAddress = new PublicKey(
  process.env.TREASURY_ADDRESS ?? defaultSunriseTreasuryAddress
);

// USAGE: yarn ts-node packages/fund-sender/resgisterState.ts destinationName destinationAccount
const destinationName = process.argv[2];
const destinationAccount = new PublicKey(process.argv[3]);

const defaultSpendThreshold = 1000000000;
const spendThreshold = new BN(
  process.env.SPEND_THRESHOLD ?? defaultSpendThreshold
);

const anchorWallet = Keypair.fromSecretKey(
  Buffer.from(require(process.env.ANCHOR_WALLET as string))
);

(async () => {
  const state = await FundSenderClient.register(
    sunriseStateAddress,
    anchorWallet.publicKey,
    destinationName,
    destinationAccount,
    sunriseTreasuryAddress,
    spendThreshold
  );
  console.log("state account data", state.config);
})().catch(console.error);
