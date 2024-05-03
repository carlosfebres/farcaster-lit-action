const LitJsSdk = require("@lit-protocol/lit-node-client-nodejs");
const { getAuthSig } = require("./utils.js");

const test = {
  domain: "localhost:3000",
  nonce: "aX66seBsxa2u0LIkp",
  message:
    "localhost:3000 wants you to sign in with your Ethereum account:\n0x3df6470a3d8Eb27D4195c22819ecCf5e4B264850\n\nFarcaster Auth\n\nURI: http://localhost:3000/\nVersion: 1\nChain ID: 10\nNonce: aX66seBsxa2u0LIkp\nIssued At: 2024-05-02T08:14:34.184Z\nResources:\n- farcaster-min://fid/402788",
  signature:
    "0xabcd",
};

const runTest = async () => {
  console.log("getAuthSig...");
  const authSig = await getAuthSig();
  console.log("LitNodeClient...");

  const litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
    alertWhenUnauthorized: false,
    litNetwork: "habanero",
    debug: true,
  });

  console.log("connecting...");
  await litNodeClient.connect();

  // create your access control conditions.  Note that the contractAddress is an IPFS hash of the file at /ipfsCode/checkWeather.js.  We pass the param of "100" to the go() function in the Lit Action Code.
  const accessControlConditions = [
    {
      contractAddress: "ipfs://QmYTqnkgeUSRuB6Teu9ZJSJBuwgAYZXiVdgvSBUFvcB7UK",
      standardContractType: "LitAction",
      chain: "ethereum",
      method: "verifyFarcasterSignature",
      parameters: [test.domain, test.nonce, test.message, test.signature],
      returnValueTest: {
        comparator: "=",
        value: "402788",
      },
    },
  ];

  // let's encrypt something
  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
    {
      accessControlConditions,
      authSig,
      chain: "ethereum",
      dataToEncrypt: "This is a secret message",
    },
    litNodeClient,
  );
  console.log("ciphertext ", LitJsSdk.uint8arrayToString(ciphertext, "base16"));

  console.log("Data encrypted.  Now to decrypt it.");

  const decryptedString = await LitJsSdk.decryptToString(
    {
      chain: "ethereum",
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      authSig,
    },
    litNodeClient,
  );

  console.log("decryptedString: ", decryptedString);
};

runTest()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
