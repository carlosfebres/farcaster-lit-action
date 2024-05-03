/**
 * NAME: farcaster_authentication
 */

import { createAppClient } from "@farcaster/auth-client";
import { ethers } from "ethers";

type Hex = `0x${string}`;
interface EthereumConnector {
  getFid: (custody: Hex) => Promise<BigInt>;
}

const ID_REGISTRY_ADDRESS = "0x00000000Fc6c5F01Fc30151999387Bb99A9f489b";

const RPC_URLS = [
  "https://mainnet.optimism.io",
  "https://1rpc.io/op",
  "https://gateway.tenderly.co/public/optimism",
];

function getIdOfData(address: Hex) {
  const hex = address.substring(2);
  const addressParam = ethers.utils.defaultAbiCoder.encode(["address"], [address]);
  const funcId = "d94fe832"; // keccak256("idOf(address)")[0:8]
  return `0x${funcId}${addressParam}`;
}

async function makeRpcCall(
  rpcUrl: string,
  to: string,
  data: string,
): Promise<string> {
  const response = await fetch(rpcUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: 42,
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{ to, data }, "latest"],
    }),
  }).then((response) => response.json());

  if ("error" in response) throw new Error(response.error.message);
  return response.result;
}

async function multiRpcCalls(rpcUrls: string[], to: string, data: string) {
  for (let i = 0; i < rpcUrls.length; i++) {
    const rpcUrl = rpcUrls[i];
    try {
      return await makeRpcCall(rpcUrl, to, data);
    } catch (error) {
      console.log(`called failed to ${rpcUrl}`);
    }
  }
  throw new Error("All calls failed");
}

const connector: EthereumConnector = {
  async getFid(custody) {
    const response = await multiRpcCalls(
      RPC_URLS,
      ID_REGISTRY_ADDRESS,
      getIdOfData(custody),
    );
    return BigInt(response);
  },
};

const appClient = createAppClient(
  {
    relay: "https://relay.farcaster.xyz",
    ethereum: connector,
  },
  undefined,
);

export const verifyFarcasterSignature = async (
  domain: string,
  nonce: string,
  message: string,
  signature: `0x${string}`,
) => {
  try {
    const { fid, success, isError, error } =
      await appClient.verifySignInMessage({
        domain,
        nonce,
        message,
        signature,
      });
    if (!success || isError) {
      return "";
    }
    return fid.toString();
  } catch (error) {}
  return "";
};
