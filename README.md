# Yield Controller

The Sunrise Stake Yield Controller is a suite of Solana programs that control
the distribution of staking yield from the Sunrise Stake program to climate projects.

The current yield distribution mechanism of Sunrise buys and retires 
[Toucan NCT carbon tokens](https://blog.toucan.earth/announcing-nct-nature-carbon-tonne/),
however the target model is to diversify the yield distribution to a range of climate
projects, controlled by a DAO.

## History

### 1. Initial release - Toucan NCT Buy-Burn-Fixxed

The initial version of the Sunrise Yield Controller used the Buy-Burn-Fixed strategy to
distribute yield. This strategy was implemented in the `buy-burn-fixed` package.

The `buy_burn_fixed` strategy bought Toucan NCT tokens at a fixed price and burned them. 
The Toucan NCT tokens were bridged from Polygon manually via [Wormhole](https://wormhole.com/) and
stored in a PDA owned by the program.

The price of NCT was manually updated periodically by a Sunrise administrator in order to ensure
a fair price was paid by Sunrise for the Toucan NCT tokens.

This had a number of downsides:
- The price of NCT was manually updated, which was a centralised process.
- NCT had to be manually bridged from Polygon to Solana, also a centralised process.
- Bridged NCT was burned, rather than retired via Toucan, which reduced the transparency of the process, and
  meant that the off-chain registries could not be updated.
- Yield distribution was limited to Toucan NCT tokens.

### 2. Toucan NCT Buy-Burn-Switchboard

The second version used a price oracle set up on [Switchboard](https://switchboard.xyz/) to 
determine the correct NCT price. This reduced the ability of administrators to control the price, but
did not affect the other downsides of release 1.

### 3. Offset Bridge

The third version of the yield controller replaced the buy-burn mechanism for a bridge-buy-retire mechanism
called the Offset Bridge.

Rather than manually bridging NCT to Solana, and having the yield controller buy and burn it, instead
a new system - the [offset bridge](https://github.com/sunrise-stake/offset-bridge) - was set up to
bridge funds to Polygon, store them in a smart contract wallet, and automatically retire them via Toucan.

This ensured that NCT was correctly converted to tCO2 tokens and retired against the Toucan registry,
while ensuring the funds remained in control of the protocol (not touching EOA wallets), but nonetheless
had a number of "crank" steps that, while permissionless, still needed manual involvement to perform.

Details of the Offset Bridge can be found in the [Offset Bridge README](https://github.com/sunrise-stake/offset-bridge/blob/main/README.md).

At present, this is the current mechanism for yield distribution in Sunrise.
It uses the "Yield Router" program to route yield from the Sunrise Stake program to the Offset Bridge.

### 4. (Planned) Diversified Yield Router

![v4.png](doc/v4.png)

The current implementation of the yield controller sends all funds from the Sunrise program directly to
a PDA owned by the Offset Bridge using the Yield Router, however the Yield Router only has one destination,
the offset bridge.

The next step will be to adapt the router to support additional distribution of yield to a range of
climate projects, rather than just NCT.

The architecture is as follows:
- Sunrise Stake program sends yield to a PDA owned by the Yield Router program (as at present).
- Yield Router owns a [State account](https://solscan.io/account/6Uad9j9DpKE9Jhebb5T3vWNWuCYTP7XxG6LJBPaqJB31),
  which contains a list of destinations and their allocation percentage
- The Yield Router `allocate_yield` instruction shares yield across the destinations according to their
  allocation percentage.
- Each destination is expected to be a PDA that then distributes the yield to the climate project
  according to their own rules. For example, the Offset Bridge bridges the funds to Polygon, buys
  NCT etc.

## Usage (latest version -- Yield Router)
There is a state account owned by the yield controller program which stores the following data:
- `sunrise_state`: public key of a state account; from which the input yield account, which holds funds to be sent to PDAs that will transfer fund to various climate projects (e.g. the offset bridge), can be derived
- `update_authority`: public key of the account having the authority to update the state account
- `output_yield_accounts`: a vector holding public keys of the PDAs that will transfer funds to various climate project
- `spend_proportions`: a vector holding the proportions of funds to be sent to each elements in `output_yield_accounts`, the proportions must sum up to 100
- `spend_threshold`: minimum amount of fund existing in `sunrise_state` account before transfer of funds to `output_yield_accounts` is allowed
- `total_spent`: total amount of fund sent to various climate projects

This state account needs to be first registered on chain, this only needs to be performed once for a yield controller program. To do so, one can use the `register_state` instruction by calling the `packages/yield-router/registerState.ts` script as follow:
```ANCHOR_PROVIDER_URL=<anchor_provider_url> STATE_ADDRESS=<state_address> OUTPUT_YIELD_ADDRESS=<output_yield_address> yarn ts-node packages/yield-router/registerState.ts```
where `state_address` is the public key of the state account from which the input yield account can be derived and `output_yield_address` is the address of the public key of the first PDA of a climate project.

When using the `packages/yield-router/registerState.ts` script to register the state, currently it only supports registering the state first with only one output yield account address. To update it with multiple output yield accounts (or any other updates in terms of removing certain yield accounts or changing the proportions between the various output yield accounts), one can use the `update_state` instruction by calling the `packages/yield-router/updateState.ts` script as follow:
```ANCHOR_PROVIDER_URL=<anchor_provider_url> yarn ts-node packages/yield-router/updateState.ts```
one will first be prompted to enter a new update authority address, this is to be skipped when it is not wished to update the update authority. Afterwards, the new output yield addresses and the associated spending proportions will be prompted to be input one by one, the proportions must sum up to 100.

To send funds from the input yield account (`sunrise_state`) to the `output_yield_accounts` with the specified `spend_threshold`, one needs to simply use the `allocate_yield` instruction by calling `packages/yield-router/allocateYield.ts` script as follow:
```ANCHOR_PROVIDER_URL=<anchor_provider_url> AMOUNT=<amount> yarn ts-node packages/yield-router/allocateYield.ts```
where amount is the amount of funds to be sent.

To check the current status of the yield controller, one can call the `packages/yield-router/getState.ts` script as follow:
```ANCHOR_PROVIDER_URL=<anchor_provide_url> yarn ts-node packages/yield-router/getState.ts```
This script contains various instructions and will return the state account address, the state account data, the balance of the input yield account and the balance of the output yield account.

## Deployed Addresses:

| Account                             | Mainnet                                                                                                                          | Devnet                                                                                                                                          | Description                                                                                                                                                                         | Notes |
|-------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------|
| `yield-router` program                   | | [syriqUnUPcFQjRSaxdFo2wPnXXPjbRsLmhiWUVoGdTo](https://explorer.solana.com/address/syriqUnUPcFQjRSaxdFo2wPnXXPjbRsLmhiWUVoGdTo?cluster=devnet)   | program to route yield accumulated to different climate projects              |       |
| `yield-router` state address                 | | [Jpp29FzyV7rXdVRWFaiE9tBcVCaEMvj16gk87rC3S4z](https://explorer.solana.com/address/Jpp29FzyV7rXdVRWFaiE9tBcVCaEMvj16gk87rC3S4z?cluster=devnet)   | state address of `yield-router` program              |       |
| `fund-sender` program                    | | [sfsH2CVS2SaXwnrGwgTVrG7ytZAxSCsTnW82BvjWTGz](https://explorer.solana.com/address/sfsH2CVS2SaXwnrGwgTVrG7ytZAxSCsTnW82BvjWTGz?cluster=devnet)   | program to transfer fund from output yield accounts to climate project wallets              |       |
| ecoToken `fund-sender` state address                   |  | [FVGb13zXEMBAChayjEMnae28M4avRKbXVBKhjqPvSkbv](https://explorer.solana.com/address/FVGb13zXEMBAChayjEMnae28M4avRKbXVBKhjqPvSkbv?cluster=devnet)   | ecoToken `fund-sender` state address                 |       |
| ecoToken temporary fund account                    |  | [9CZJereiv7mVg5iwMq7cnAXXu1Z3r1MDyumkY3C18x96](https://explorer.solana.com/address/9CZJereiv7mVg5iwMq7cnAXXu1Z3r1MDyumkY3C18x96?cluster=devnet)   | ecoToken `output_yield_account` for `yield-router` / input_account for `fund-sender`                 |       |
| ecoToken Wallet                    | [FToVGCufMQQgt3ca2C8s1NHMMaGZBLjaj5zjjP66Brwb](https://explorer.solana.com/address/FToVGCufMQQgt3ca2C8s1NHMMaGZBLjaj5zjjP66Brwb) | [eco7LrrTRHBFW1Ab4B4GzYThaRzUEyjPrTJDqPUJbWn](https://explorer.solana.com/address/eco7LrrTRHBFW1Ab4B4GzYThaRzUEyjPrTJDqPUJbWn?cluster=devnet)   | ecoToken wallet                 |       |
| offset bridge `fund-sender` state address                    | | [4SoZYUny9QCf3hh3LSYYCRXN3ENHWnYSyf4ih19mwvBc](https://explorer.solana.com/address/4SoZYUny9QCf3hh3LSYYCRXN3ENHWnYSyf4ih19mwvBc?cluster=devnet)   | offset `fund-sender` state address              |       |
| offset bridge temporary fund account                    | | [4VXd2SpV5vax6QJt12Avqo5SW8dZoMW2Yg8c37GGGuvM](https://explorer.solana.com/address/4VXd2SpV5vax6QJt12Avqo5SW8dZoMW2Yg8c37GGGuvM?cluster=devnet)   | offset bridge `output_yield_account` for `yield-router` / input_account for `fund-sender`              |       |
| offset bridge Wallet                    | | [osb2bAXA7PUJZKDAmMGTwGL7vdZRZuemfENjbdT1UaN](https://explorer.solana.com/address/osb2bAXA7PUJZKDAmMGTwGL7vdZRZuemfENjbdT1UaN?cluster=devnet)   | offset bridge wallet              |       |
| Certificate Vault                    | [Bup7DZk56XwQUDzuvBz9nzbr8e2iLPVrBpha1KTfEbbJ](https://explorer.solana.com/address/Bup7DZk56XwQUDzuvBz9nzbr8e2iLPVrBpha1KTfEbbJ) | [scvRXyo93vXa3Lyt3p6cj8cVtXGnn1LkuFyoJVu8GQb](https://explorer.solana.com/address/scvRXyo93vXa3Lyt3p6cj8cVtXGnn1LkuFyoJVu8GQb?cluster=devnet)   | [Sunrise DAO](https://app.realms.today/dao/sunrisestake) certificate vault                                                                                          |       |
