import {
  client,
  authSig,
  pkpPublicKey,
  getLitActionCode,
  errorLog,
} from "../utils.mjs";

const litActionCode = await getLitActionCode();

let res;
const message = new Uint8Array(
  await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode("Hello world"),
  ),
);

try {
  console.log("executing...");
  res = await client.executeJs({
    code: litActionCode,
    authSig,
    debug: true,
    jsParams: {
      toSign: message,
      publicKey: pkpPublicKey,
      sigName: "example-sig",
    },
  });

  console.log("res", res);
} catch (e) {
  errorLog(e);
}
