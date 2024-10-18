use anchor_lang::prelude::Pubkey;

#[derive(Clone)]
pub struct SplAccountCompression;

impl anchor_lang::Id for SplAccountCompression {
    fn id() -> Pubkey {
        spl_account_compression::id()
    }
}