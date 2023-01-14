import { TransactionInstruction, PublicKey, AccountMeta } from "@solana/web3.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh" // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types" // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId"

export interface RegisterStateArgs {
  state: types.GenericStateInputFields
}

export interface RegisterStateAccounts {
  payer: PublicKey
  state: PublicKey
  mint: PublicKey
  systemProgram: PublicKey
}

export const layout = borsh.struct([types.GenericStateInput.layout("state")])

export function registerState(
  args: RegisterStateArgs,
  accounts: RegisterStateAccounts
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
    { pubkey: accounts.mint, isSigner: false, isWritable: false },
    { pubkey: accounts.systemProgram, isSigner: false, isWritable: false },
  ]
  const identifier = Buffer.from([137, 35, 194, 234, 128, 215, 19, 45])
  const buffer = Buffer.alloc(1000)
  const len = layout.encode(
    {
      state: types.GenericStateInput.toEncodable(args.state),
    },
    buffer
  )
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len)
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data })
  return ix
}
