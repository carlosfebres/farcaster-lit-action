const { Wallet } = require("ethers");
const { SiweMessage } = require("siwe");
const { LitAbility, LitActionResource } = require("@lit-protocol/auth-helpers");

// Test private key
const privateKey =
  "7ac5070e8bc5888dffb4fa057d79f50593352f4c3a860b0006fba6d176dd4d09";
// const privateKey = process.env.LIT_WALLET_PRIVATE_KEY;
const signingWallet = new Wallet(privateKey);

const config = {
  domain: "localhost:3000",
  litNetwork: "habanero",
  litActionHash: "QmV3puT6hRwvJ9iPjJqUDPYrXWdFdWfhBnxu3yrcCG91MN",
  capacityTokenId: 1269,
};

async function getSessionSigs(litNodeClient) {
  const { capacityDelegationAuthSig } =
    await litNodeClient.createCapacityDelegationAuthSig({
      uses: "1",
      dAppOwnerWallet: signingWallet,
      capacityTokenId: config.capacityTokenId,
    });

  // Create an access control condition resource
  const litResource = new LitActionResource(config.litActionHash);

  return await litNodeClient.getSessionSigs({
    chain: "ethereum",
    resourceAbilityRequests: [
      {
        resource: litResource,
        ability: LitAbility.AccessControlConditionDecryption,
      },
    ],
    authNeededCallback: await authNeededCallback(litNodeClient),
    capacityDelegationAuthSig,
  });
}

async function authNeededCallback(litNodeClient) {
  const nonce = await litNodeClient.getLatestBlockhash();
  return async ({ resources, expiration, uri }) => {
    const message = new SiweMessage({
      address: signingWallet.address,
      chainId: 1,
      domain: config.domain,
      expirationTime: expiration,
      nonce,
      resources,
      statement: "Sign a session key to use with Lit Protocol",
      uri,
      version: "1",
    });
    const toSign = message.prepareMessage();
    const signature = await signingWallet.signMessage(toSign);

    return {
      address: signingWallet.address,
      derivedVia: "web3.eth.personal.sign",
      sig: signature,
      signedMessage: toSign,
    };
  };
}

module.exports = { config, getSessionSigs };
