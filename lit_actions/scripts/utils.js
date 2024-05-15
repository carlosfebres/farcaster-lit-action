require("dotenv").config();

const { ethers } = require("ethers");

const siwe = require("siwe");

const getAuthSig = async () => {
  // put your private key into this env var
  const privateKey = process.env.LIT_WALLET_PRIVATE_KEY;
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

module.exports = { getAuthSig };
