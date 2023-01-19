import {
  approveChecked,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { setUpAnchor } from "../client";
import { PublicKey } from "@solana/web3.js";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";

const defaultMint = "tnct1RC5jg94CJLpiTZc2A2d98MP1Civjh7o6ShmTP6";
const mint = new PublicKey(process.env.MINT ?? defaultMint);

const defaultStateAddress = "9QxfwoxkgxE94uoHd3ZPFLmfNhewoFe3Xg5gwgtShYnn";
const stateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultStateAddress
);

const defaultHoldingAccount = "A4c5nctuNSN7jTsjDahv6bAWthmUzmXi3yBocvLYM4Bz";
const holdingAccount = new PublicKey(
  process.env.HOLDING_ACCOUNT ?? defaultHoldingAccount
);

(async () => {
  const provider = setUpAnchor();
  const holdingTokenAccount = getAssociatedTokenAddressSync(
    mint,
    holdingAccount,
    true
  );

  await approveChecked(
    provider.connection,
    (provider.wallet as NodeWallet).payer,
    mint,
    holdingTokenAccount,
    stateAddress,
    holdingAccount,
    10000 * 10 ** 9,
    9
  );
})().catch(console.error);
