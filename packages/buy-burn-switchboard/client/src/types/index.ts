import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";

export interface BuyBurnSwitchboardState {
  mint: PublicKey;
  treasury: PublicKey;
  holdingAccount: PublicKey;
  holdingTokenAccount: PublicKey;

  updateAuthority: PublicKey;

  solUsdPriceFeed: PublicKey;
  nctUsdPriceFeed: PublicKey;
  purchaseProportion: number;
  purchaseThreshold: BN;

  totalTokensPurchased: BN;
  index: number;
  bump: number;
  yieldAccountBump: number;
}
