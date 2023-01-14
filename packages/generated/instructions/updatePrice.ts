import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdatePriceArgs {
  price: BN;
}

export interface UpdatePriceAccounts {
  state: PublicKey;
  payer: PublicKey;
}

export const layout = borsh.struct([borsh.u64("price")]);

export function updatePrice(
  args: UpdatePriceArgs,
  accounts: UpdatePriceAccounts
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.state, isSigner: false, isWritable: true },
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
  ];
  const identifier = Buffer.from([61, 34, 117, 155, 75, 34, 123, 208]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      price: args.price,
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
