import { PublicKey } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"

export interface GenericStateInputFields {
  mint: PublicKey
  updateAuthority: PublicKey
  treasury: PublicKey
  holdingAccount: PublicKey
  holdingTokenAccount: PublicKey
  price: BN
  purchaseThreshold: BN
  purchaseProportion: number
}

export interface GenericStateInputJSON {
  mint: string
  updateAuthority: string
  treasury: string
  holdingAccount: string
  holdingTokenAccount: string
  price: string
  purchaseThreshold: string
  purchaseProportion: number
}

export class GenericStateInput {
  readonly mint: PublicKey
  readonly updateAuthority: PublicKey
  readonly treasury: PublicKey
  readonly holdingAccount: PublicKey
  readonly holdingTokenAccount: PublicKey
  readonly price: BN
  readonly purchaseThreshold: BN
  readonly purchaseProportion: number

  constructor(fields: GenericStateInputFields) {
    this.mint = fields.mint
    this.updateAuthority = fields.updateAuthority
    this.treasury = fields.treasury
    this.holdingAccount = fields.holdingAccount
    this.holdingTokenAccount = fields.holdingTokenAccount
    this.price = fields.price
    this.purchaseThreshold = fields.purchaseThreshold
    this.purchaseProportion = fields.purchaseProportion
  }

  static layout(property?: string) {
    return borsh.struct(
      [
        borsh.publicKey("mint"),
        borsh.publicKey("updateAuthority"),
        borsh.publicKey("treasury"),
        borsh.publicKey("holdingAccount"),
        borsh.publicKey("holdingTokenAccount"),
        borsh.u64("price"),
        borsh.u64("purchaseThreshold"),
        borsh.f32("purchaseProportion"),
      ],
      property
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromDecoded(obj: any) {
    return new GenericStateInput({
      mint: obj.mint,
      updateAuthority: obj.updateAuthority,
      treasury: obj.treasury,
      holdingAccount: obj.holdingAccount,
      holdingTokenAccount: obj.holdingTokenAccount,
      price: obj.price,
      purchaseThreshold: obj.purchaseThreshold,
      purchaseProportion: obj.purchaseProportion,
    })
  }

  static toEncodable(fields: GenericStateInputFields) {
    return {
      mint: fields.mint,
      updateAuthority: fields.updateAuthority,
      treasury: fields.treasury,
      holdingAccount: fields.holdingAccount,
      holdingTokenAccount: fields.holdingTokenAccount,
      price: fields.price,
      purchaseThreshold: fields.purchaseThreshold,
      purchaseProportion: fields.purchaseProportion,
    }
  }

  toJSON(): GenericStateInputJSON {
    return {
      mint: this.mint.toString(),
      updateAuthority: this.updateAuthority.toString(),
      treasury: this.treasury.toString(),
      holdingAccount: this.holdingAccount.toString(),
      holdingTokenAccount: this.holdingTokenAccount.toString(),
      price: this.price.toString(),
      purchaseThreshold: this.purchaseThreshold.toString(),
      purchaseProportion: this.purchaseProportion,
    }
  }

  static fromJSON(obj: GenericStateInputJSON): GenericStateInput {
    return new GenericStateInput({
      mint: new PublicKey(obj.mint),
      updateAuthority: new PublicKey(obj.updateAuthority),
      treasury: new PublicKey(obj.treasury),
      holdingAccount: new PublicKey(obj.holdingAccount),
      holdingTokenAccount: new PublicKey(obj.holdingTokenAccount),
      price: new BN(obj.price),
      purchaseThreshold: new BN(obj.purchaseThreshold),
      purchaseProportion: obj.purchaseProportion,
    })
  }

  toEncodable() {
    return GenericStateInput.toEncodable(this)
  }
}
