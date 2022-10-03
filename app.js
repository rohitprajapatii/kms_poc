const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
// const crc32c = require("fast-crc32c");

// Imports the Cloud KMS library
const { KeyManagementServiceClient } = require("@google-cloud/kms");
app.use(bodyParser.json());

var upload = multer();
var storage = new Storage();
var kmsKeyName = "wework-key-1";

const bucket = storage.bucket("kms_staging");
const options = {
  kmsKeyName,
};

const user_data = {
  panNumber: "XXXXXXX",
  name: "XXXXX",
};
const projectId = "wework-staging";
const locationId = "asia-south1";
const keyRingId = "wework-key-ring-2";
const keyId = "wework-key-1";
const plaintextBuffer = Buffer.from(JSON.stringify(user_data));

// Instantiates a client
const client = new KeyManagementServiceClient();

// Build the key name
const keyName = client.cryptoKeyPath(projectId, locationId, keyRingId, keyId);

// Optional, but recommended: compute plaintext's CRC32C.
// const plaintextCrc32c = crc32c.calculate(plaintextBuffer);

async function encryptSymmetric() {
  try {
    const [encryptResponse] = await client.encrypt({
      name: keyName,
      plaintext: plaintextBuffer,
      // plaintextCrc32c: {
      //   value: plaintextCrc32c,
      // },
    });

    const ciphertext = encryptResponse.ciphertext;
    console.log(`Ciphertext: ${ciphertext.toString("base64")}`);
    return ciphertext;
  } catch (error) {
    console.log(error);
  }
}
encryptSymmetric().then((ciphertext) => {
  console.log(ciphertext, "this is ciphertext");
  decryptSymmetric(ciphertext);
});

async function decryptSymmetric(ciphertext) {
  const [decryptResponse] = await client.decrypt({
    name: keyName,
    ciphertext: ciphertext,
    // ciphertextCrc32c: {
    //   value: ciphertextCrc32c,
    // },
  });
  console.log(decryptResponse.plaintext.toString(), "this is decrypted data");
}
function apiResponse(results) {
  return JSON.stringify({ status: 200, error: null, response: results });
}

app.listen(3000, () => {
  console.log("Server started on port 3000...");
});
