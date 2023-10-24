/* eslint-disable @typescript-eslint/no-var-requires */
import { AnchorProvider } from "@coral-xyz/anchor";
import { FundSenderClient } from "../client";
import { logSplBalance } from "./lib/util";
import { Keypair, PublicKey } from "@solana/web3.js";
import {
  getAccount,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// mainnet Sunrise
const defaultSunriseStateAddress =
  "43m66crxGfXSJpmx5wXRoFuHubhHA1GCvtHgmHW6cM1P";
const sunriseStateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultSunriseStateAddress
);

// USAGE: yarn ts-node packages/fund-sender/storeCertificate.ts destinationName
const destinationName = process.argv[2];

(async () => {
  const stateAddress = FundSenderClient.getStateAddressFromSunriseAddress(
    sunriseStateAddress,
    destinationName
  );
  const client = await FundSenderClient.fetch(stateAddress);

  const log = logSplBalance(client);

  console.log("state address", stateAddress.toBase58());
  console.log("state account data", client.config);
  const provider = AnchorProvider.local();
  const connection = provider.connection;
  const anchorWallet = Keypair.fromSecretKey(
    Buffer.from(require(process.env.ANCHOR_WALLET as string))
  );
  const allInputTokenAccounts =
    await client.provider.connection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID,
      {
        filters: [
          {
            dataSize: 165, // number of bytes
          },
          {
            memcmp: {
              offset: 32, // number of bytes
              bytes: client.getInputAccount().toBase58(),
            },
          },
        ],
      }
    );
  console.log(
    "number of input certificate token addresses",
    allInputTokenAccounts.length
  );
  console.log("Storing certificates...");
  for (const inputTokenAccount of allInputTokenAccounts) {
    console.log(
      "input certificate token account:",
      inputTokenAccount.pubkey.toBase58()
    );

    const inputTokenAddressInfo = await getAccount(
      connection,
      inputTokenAccount.pubkey
    );

    const certificateVaultAta = await getOrCreateAssociatedTokenAccount(
      connection,
      anchorWallet,
      inputTokenAddressInfo.mint,
      client.config.certificateVault,
      false
    );

    await client.storeCertificates(
      inputTokenAccount.pubkey,
      certificateVaultAta.address,
      inputTokenAddressInfo.mint
    );

    await log(
      "remaining input certificate token in account",
      inputTokenAccount.pubkey
    );
    await log("token in certificate vault ATA", certificateVaultAta.address);
  }
})().catch(console.error);
