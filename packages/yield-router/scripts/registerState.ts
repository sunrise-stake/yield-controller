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
const defaultOutputYieldAddress =
  "4XTLzYF3kteTbb3a9NYYjeDAYwNoEGSkjoqJYkiLCnmm";
const outputYieldAddress = new PublicKey(
  process.env.OUTPUT_YIELD_ADDRESS ?? defaultOutputYieldAddress
);

const anchorWallet = Keypair.fromSecretKey(
  Buffer.from(require(process.env.ANCHOR_WALLET as string))
);

(async () => {
  const state = await YieldRouterClient.register(
    sunriseStateAddress,
    anchorWallet.publicKey,
    [outputYieldAddress],
    [100],
    new BN(100)
  );
  console.log("state account data", state.config);
})().catch(console.error);
