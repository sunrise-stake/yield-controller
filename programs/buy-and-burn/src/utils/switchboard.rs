use anchor_lang::prelude::*;
use std::convert::TryInto;
use switchboard_v2::{AggregatorAccountData, SwitchboardDecimal};

fn get_price_from_feed(
    price_feed: &AccountLoader<AggregatorAccountData>,
    max_staleness: u64,
) -> Result<f64> {
    // deserialize account info
    let feed = price_feed.load()?;

    // check if feed is stake
    feed.check_staleness(Clock::get().unwrap().unix_timestamp, max_staleness as i64)?;

    // check if feed exceeds a confidence interval of +/i $0.80
    feed.check_confidence_interval(SwitchboardDecimal::from_f64(0.80))?;

    // get result
    feed.get_result()?.try_into()
}

// returns the NCT price in SOL
pub fn get_latest_price(
    sol_usd_price_feed: &AccountLoader<AggregatorAccountData>,
    nct_usd_price_feed: &AccountLoader<AggregatorAccountData>,
    max_staleness: u64,
) -> Result<f64> {
    let sol_usd_price = get_price_from_feed(sol_usd_price_feed, max_staleness)?;
    let nct_usd_price = get_price_from_feed(nct_usd_price_feed, max_staleness)?;

    msg!("sol_usd_price: {}", sol_usd_price);
    msg!("nct_usd_price: {}", nct_usd_price);

    Ok(nct_usd_price / sol_usd_price)
}
