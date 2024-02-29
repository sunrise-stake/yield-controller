/* eslint-disable @typescript-eslint/no-var-requires */
import { YieldRouterClient } from "../client";
import { Keypair, PublicKey } from "@solana/web3.js";
import BN from "bn.js";

// mainnet Sunrise
const defaultSunriseStateAddress =
  "43m66crxGfXSJpmx5wXRoFuHubhHA1GCvtHgmHW6cM1P";
const sunriseStateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultSunriseStateAddress
);

// mainnet offset bridge wrapped SOL ATA
// const defaultOutputYieldAddress =
//   "4XTLzYF3kteTbb3a9NYYjeDAYwNoEGSkjoqJYkiLCnmm";
const outputYieldAddress1 = new PublicKey(
    // offset bridge input account (dummy for devnet)
  process.env.OUTPUT_YIELD_ADDRESS ?? "4VXd2SpV5vax6QJt12Avqo5SW8dZoMW2Yg8c37GGGuvM"
);
const outputYieldAddress2 = new PublicKey(
    // ecotoken fund sender input account (dummy for devnet)
    process.env.OUTPUT_YIELD_ADDRESS ?? "9CZJereiv7mVg5iwMq7cnAXXu1Z3r1MDyumkY3C18x96"
);

const anchorWallet = Keypair.fromSecretKey(
  Buffer.from(require(process.env.ANCHOR_WALLET as string))
);

(async () => {
  const state = await YieldRouterClient.register(
    sunriseStateAddress,
    anchorWallet.publicKey,
    [outputYieldAddress1, outputYieldAddress2],
    [50, 50],
    new BN(0)
  );
  console.log("state account data", state.config);
})().catch(console.error);
