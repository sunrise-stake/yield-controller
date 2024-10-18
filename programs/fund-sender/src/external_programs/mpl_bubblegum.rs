use anchor_lang::prelude::Pubkey;
use mpl_bubblegum::programs::MPL_BUBBLEGUM_ID;

#[derive(Clone)]
pub struct MplBubblegum;

impl anchor_lang::Id for MplBubblegum {
    fn id() -> Pubkey {
        MPL_BUBBLEGUM_ID
    }
}
