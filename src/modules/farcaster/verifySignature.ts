import { createAppClient, viemConnector } from "@farcaster/auth-client";

const appClient = createAppClient({
  relay: "https://relay.farcaster.xyz",
  ethereum: viemConnector(),
});

export async function verifySignature(data: string) {
  const { fid, success, error } = await appClient.verifySignInMessage(
    JSON.parse(data),
  );

  if (!success) {
    console.log("failed verification", error);
    return;
  }

  console.log("verification successful", { fid });
}
