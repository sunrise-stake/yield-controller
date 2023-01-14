import { PublicKey, Connection } from "@solana/web3.js"
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface StateFields {
  updateAuthority: PublicKey
  treasury: PublicKey
  mint: PublicKey
  price: BN
  purchaseThreshold: BN
  purchaseProportion: number
  bump: number
}

export interface StateJSON {
  updateAuthority: string
  treasury: string
  mint: string
  price: string
  purchaseThreshold: string
  purchaseProportion: number
  bump: number
}

export class State {
  readonly updateAuthority: PublicKey
  readonly treasury: PublicKey
  readonly mint: PublicKey
  readonly price: BN
  readonly purchaseThreshold: BN
  readonly purchaseProportion: number
  readonly bump: number

  static readonly discriminator = Buffer.from([
    216, 146, 107, 94, 104, 75, 182, 177,
  ])

  static readonly layout = borsh.struct([
    borsh.publicKey("updateAuthority"),
    borsh.publicKey("treasury"),
    borsh.publicKey("mint"),
    borsh.u64("price"),
    borsh.u64("purchaseThreshold"),
    borsh.f32("purchaseProportion"),
    borsh.u8("bump"),
  ])

  constructor(fields: StateFields) {
    this.updateAuthority = fields.updateAuthority
    this.treasury = fields.treasury
    this.mint = fields.mint
    this.price = fields.price
    this.purchaseThreshold = fields.purchaseThreshold
    this.purchaseProportion = fields.purchaseProportion
    this.bump = fields.bump
  }

  static async fetch(c: Connection, address: PublicKey): Promise<State | null> {
    const info = await c.getAccountInfo(address)

    if (info === null) {
      return null
    }
    if (!info.owner.equals(PROGRAM_ID)) {
      throw new Error("account doesn't belong to this program")
    }

    return this.decode(info.data)
  }

  static async fetchMultiple(
    c: Connection,
    addresses: PublicKey[]
  ): Promise<Array<State | null>> {
    const infos = await c.getMultipleAccountsInfo(addresses)

    return infos.map((info) => {
      if (info === null) {
        return null
      }
      if (!info.owner.equals(PROGRAM_ID)) {
        throw new Error("account doesn't belong to this program")
      }

      return this.decode(info.data)
    })
  }

  static decode(data: Buffer): State {
    if (!data.slice(0, 8).equals(State.discriminator)) {
      throw new Error("invalid account discriminator")
    }

    const dec = State.layout.decode(data.slice(8))

    return new State({
      updateAuthority: dec.updateAuthority,
      treasury: dec.treasury,
      mint: dec.mint,
      price: dec.price,
      purchaseThreshold: dec.purchaseThreshold,
      purchaseProportion: dec.purchaseProportion,
      bump: dec.bump,
    })
  }

  toJSON(): StateJSON {
    return {
      updateAuthority: this.updateAuthority.toString(),
      treasury: this.treasury.toString(),
      mint: this.mint.toString(),
      price: this.price.toString(),
      purchaseThreshold: this.purchaseThreshold.toString(),
      purchaseProportion: this.purchaseProportion,
      bump: this.bump,
    }
  }

  static fromJSON(obj: StateJSON): State {
    return new State({
      updateAuthority: new PublicKey(obj.updateAuthority),
      treasury: new PublicKey(obj.treasury),
      mint: new PublicKey(obj.mint),
      price: new BN(obj.price),
      purchaseThreshold: new BN(obj.purchaseThreshold),
      purchaseProportion: obj.purchaseProportion,
      bump: obj.bump,
    })
  }
}
