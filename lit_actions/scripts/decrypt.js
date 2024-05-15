require("dotenv").config();

const LitJsSdk = require("@lit-protocol/lit-node-client");
const { config, getSessionSigs } = require("./sessionKeys");

const test = {
  nonce: "vUH8bfFSlgTFtceCg",
  message:
    "localhost:3000 wants you to sign in with your Ethereum account:\n0x3df6470a3d8Eb27D4195c22819ecCf5e4B264850\n\nFarcaster Auth\n\nURI: http://localhost:3000/\nVersion: 1\nChain ID: 10\nNonce: vUH8bfFSlgTFtceCg\nIssued At: 2024-05-15T00:26:32.845Z\nResources:\n- farcaster://fid/402788",
  signature: "0xabcd",
  fid: "402788",
};

const runTest = async () => {
  console.log("LitNodeClient...");
  const litNodeClient = new LitJsSdk.LitNodeClientNodeJs({
    litNetwork: config.litNetwork,
    debug: true,
    alertWhenUnauthorized: false,
  });
  console.log("connecting...");
  await litNodeClient.connect();

  // create your access control conditions.  Note that the contractAddress is an IPFS hash of the file at /ipfsCode/checkWeather.js.  We pass the param of "100" to the go() function in the Lit Action Code.
  const accessControlConditions = [
    {
      contractAddress: "ipfs://" + config.litActionHash,
      standardContractType: "LitAction",
      chain: "ethereum",
      method: "verifyFarcasterSignature",
      parameters: [
        config.domain,
        test.nonce,
        encodeURIComponent(test.message),
        test.signature,
      ],
      returnValueTest: {
        comparator: "=",
        value: test.fid,
      },
    },
  ];

  console.log("getting SessionSigs to encrypt...");
  const sessionSigsToEncrypt = await getSessionSigs(litNodeClient);

  // let's encrypt something
  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
    {
      accessControlConditions,
      sessionSigs: sessionSigsToEncrypt,
      chain: "ethereum",
      dataToEncrypt: "This is a secret message",
    },
    litNodeClient,
  );

  console.log("ciphertext raw", ciphertext);
  console.log("dataToEncryptHash", dataToEncryptHash);

  console.log("Data encrypted.  Now to decrypt it.");

  console.log("getting SessionSigs to decrypt...");
  const sessionSigsToDecrypt = await getSessionSigs(litNodeClient);

  const decryptRequest = {
    chain: "ethereum", // chain field is required but nothing lives there
    sessionSigs: sessionSigsToDecrypt,
    ciphertext,
    dataToEncryptHash,
    accessControlConditions,
  };

  console.log("decryptRequest", JSON.stringify(decryptRequest));

  const decryptedString = await LitJsSdk.decryptToString(
    decryptRequest,
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
