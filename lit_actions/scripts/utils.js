const { ethers } = require("ethers");
const siwe = require("siwe");

const getAuthSig = async () => {
  // put your private key into this env var
  const privateKey = process.env.LIT_ROLLUP_MAINNET_DEPLOYER_PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey);
  const address = await wallet.getAddress();

  // Craft the SIWE message
  const domain = "localhost:3000";
  const origin = "https://localhost:3000";
  const statement =
    "This is a test statement. You can put anything you want here.";
  const siweMessage = new siwe.SiweMessage({
    domain,
    address: address,
    statement,
    uri: origin,
    version: "1",
    chainId: 1,
    expirationTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  });
  const messageToSign = siweMessage.prepareMessage();

  // Sign the message and format the authSig
  const signature = await wallet.signMessage(messageToSign);

  return {
    sig: signature,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: messageToSign,
    address: address,
  };
};

const getPkp = async () => {
  // put a PKP public key here
  return "0x04a2ceb04fd1fb86804615bfeab2236edba5891c7f4a8586b64fc27c160a48b57d56028f9160b4d17f89331145a5552d5a380a1dca70cae3c32cf0e0e64e63a3e6";
};

module.exports = { getAuthSig, getPkp };
