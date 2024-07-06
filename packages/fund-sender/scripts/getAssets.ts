const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const CERTIFICATE_VAULT = "Bup7DZk56XwQUDzuvBz9nzbr8e2iLPVrBpha1KTfEbbJ";
const url = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY ?? ""}`;

const getAssetsByOwner = async (): Promise<void> => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "my-id",
      method: "getAssetsByOwner",
      params: {
        ownerAddress: CERTIFICATE_VAULT,
        page: 1, // Starts at 1
        limit: 1000,
      },
    }),
  });
  const { result } = (await response.json()) as any;
  console.log("Assets by Owner: ", result.items);
};

await getAssetsByOwner();
