// Taken from https://github.com/solana-developers/program-examples/blob/main/compression/cnft-vault/anchor/tests/readAPI.ts
// Note - not needed if using Umi instead of an anchor client

// you might want to change that to your custom RPC
import * as crypto from "node:crypto";

const RPC_PATH = process.env.ANCHOR_PROVIDER_URL!;
if (!RPC_PATH) {
    throw new Error('ANCHOR_PROVIDER_URL is not defined');
}

type JSONRPCResponse = {
    jsonrpc: string;
    id: string;
    result: any;
    error: {
        code: number;
        message: string;
    };
};

export type Asset = {
    id: string,
    compression: {
        data_hash: string;
        creator_hash: string;
        leaf_id: number;
    };
    content: {
        json_uri: string,
        files: {
            uri: string,
            mime: string
        }[],
        links: { image: string }
        metadata: {
            attributes: {
                value: string,
                trait_type: string,
            }[],
            description: string,
            name: string,
            symbol: string,
            token_standard: string,
        }
    },
    authorities: {
        address: string,
        scopes: string[]
    }[]
};

export type AssetResponse = {
    total: number,
    limit: number,
    cursor: string,
    items: Asset[]
}

export type AssetProof = {
    proof: string[],
    tree_id: string,
    root: string
}

const fetchJsonRpc = async (method: string, params: any, rpcUrl = RPC_PATH): Promise<any> => {
    const response = await fetch(rpcUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            method,
            id: crypto.randomUUID(),
            params,
        }),
    });

    // Handle HTTP errors
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);

    const data = await response.json() as JSONRPCResponse;

    // Handle JSON-RPC errors
    if (data.error) {
        if (data.error.code === -32601) {
            throw new Error(`RPC method not found: ${method} - Ensure you are using a DAS-enabled Solana RPC`);
        }
        throw new Error(`RPC error: ${data.error.message}`);
    }

    return data.result;
}

export async function getAsset(assetId: string, rpcUrl = RPC_PATH): Promise<Asset> {
    return fetchJsonRpc('getAsset', { id: assetId }, rpcUrl);
}

export async function getAssetProof(assetId: string, rpcUrl = RPC_PATH): Promise<AssetProof> {
    return fetchJsonRpc('getAssetProof', { id: assetId }, rpcUrl);
}

export async function getAssetsByOwner(owner: string, rpcUrl = RPC_PATH): Promise<AssetResponse> {
    return fetchJsonRpc('getAssetsByOwner', { ownerAddress: owner }, rpcUrl);
}