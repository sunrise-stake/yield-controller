/* eslint-disable @typescript-eslint/no-var-requires */
import { AnchorProvider } from "@coral-xyz/anchor";
import { FundSenderClient } from "../client";
import { Keypair, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
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

// ecoToken address
const defaultDestinationAccount =
  "FToVGCufMQQgt3ca2C8s1NHMMaGZBLjaj5zjjP66Brwb";
const defaultDestinationSeed = "ecoToken";
const destinationAccount = new PublicKey(
  process.env.DESTINATION_ACCOUNT ?? defaultDestinationAccount
);
const destinationSeed = Buffer.from(
  process.env.DESTINATION_SEED ?? defaultDestinationSeed
);

// ecoToken mintKey
const defaultMintKey = "26KSs4cds9P3p2K5q6j8xGD2yzB1Wa2pzms7AHSMhG3s";
const mintKey = new PublicKey(process.env.MINT_KEY ?? defaultMintKey);

const defaultSpendThreshold = 1000000000;
const spendThreshold = new BN(
  process.env.SPEND_THRESHOLD ?? defaultSpendThreshold
);

const anchorWallet = Keypair.fromSecretKey(
  Buffer.from(require(process.env.ANCHOR_WALLET as string))
);

(async () => {
  const provider = AnchorProvider.local();
  const connection = provider.connection;

  const certificateVault = await getOrCreateAssociatedTokenAccount(
    connection,
    anchorWallet,
    mintKey,
    sunriseTreasuryAddress,
    true
  );

  const state = await FundSenderClient.register(
    sunriseStateAddress,
    anchorWallet.publicKey,
    destinationSeed,
    destinationAccount,
    certificateVault.address,
    spendThreshold
  );
  console.log("state account data", state.config);
})().catch(console.error);
