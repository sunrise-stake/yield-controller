/* eslint-disable @typescript-eslint/no-var-requires */
// Set up anchor provider
import { FundSenderClient } from "../client";
import { PublicKey } from "@solana/web3.js";

// mainnet Sunrise
const defaultSunriseStateAddress =
  "43m66crxGfXSJpmx5wXRoFuHubhHA1GCvtHgmHW6cM1P";
const sunriseStateAddress = new PublicKey(
  process.env.STATE_ADDRESS ?? defaultSunriseStateAddress
);

const cnftAddressLookupTableAddress =
  process.env.CNFT_ALT ?? "FmV5V5C3kd9X7bXgFCeFbfBGyt46eUMy6s2kb3rZPudm";
let cnftAddressLookupTable = cnftAddressLookupTableAddress
  ? new PublicKey(cnftAddressLookupTableAddress)
  : undefined;

// USAGE: yarn ts-node packages/fund-sender/storeCertificate.ts destinationName
const destinationName = process.argv[2];

(async () => {
  const stateAddress = FundSenderClient.getStateAddressFromSunriseAddress(
    sunriseStateAddress,
    destinationName
  );
  console.log("Getting state account...", stateAddress.toBase58());
  const client = await FundSenderClient.fetch(stateAddress);

  const assets = await client.getCNFTCertificates();
  console.log("number of CNFT certificates", assets.length);

  if (assets.length === 0) {
    console.log("No certificates to store.");
    return;
  }

  if (!cnftAddressLookupTable) {
    console.log("No CNFT address lookup table provided - creating...");
    cnftAddressLookupTable = await client.createALTForCNFTTransfer();
    console.log(
      "Created CNFT address lookup table",
      cnftAddressLookupTable.toBase58()
    );
  }

  console.log("Storing certificates...");
  for (const asset of assets) {
    await client.storeCNFTCertificate(asset.id, cnftAddressLookupTable);
  }
})().catch(console.error);
