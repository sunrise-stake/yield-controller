import {
  TransactionInstruction,
  PublicKey,
  AccountMeta,
} from "@solana/web3.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import BN from "bn.js"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as borsh from "@project-serum/borsh"; // eslint-disable-line @typescript-eslint/no-unused-vars
import * as types from "../types"; // eslint-disable-line @typescript-eslint/no-unused-vars
import { PROGRAM_ID } from "../programId";

export interface UpdateStateArgs {
  state: types.GenericStateInputFields;
}

export interface UpdateStateAccounts {
  payer: PublicKey;
  state: PublicKey;
}

export const layout = borsh.struct([types.GenericStateInput.layout("state")]);

export function updateState(
  args: UpdateStateArgs,
  accounts: UpdateStateAccounts
) {
  const keys: Array<AccountMeta> = [
    { pubkey: accounts.payer, isSigner: true, isWritable: true },
    { pubkey: accounts.state, isSigner: false, isWritable: true },
  ];
  const identifier = Buffer.from([135, 112, 215, 75, 247, 185, 53, 176]);
  const buffer = Buffer.alloc(1000);
  const len = layout.encode(
    {
      state: types.GenericStateInput.toEncodable(args.state),
    },
    buffer
  );
  const data = Buffer.concat([identifier, buffer]).slice(0, 8 + len);
  const ix = new TransactionInstruction({ keys, programId: PROGRAM_ID, data });
  return ix;
}
