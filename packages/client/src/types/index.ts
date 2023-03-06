import {PublicKey} from "@solana/web3.js";
import BN from "bn.js";

export type YieldControllerState = {
    mint: PublicKey,
    treasury: PublicKey,
    holdingAccount: PublicKey,
    holdingTokenAccount: PublicKey,

    updateAuthority: PublicKey,

    price: number,
    purchaseProportion: number,
    purchaseThreshold: BN,

    totalTokensPurchased: BN,
    index: number,
    bump: number,
    yieldAccountBump: number,
}