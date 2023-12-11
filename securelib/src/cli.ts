import { createPublicKey } from "crypto";
import { generateAsymmetricKeys, protectAsymmetric, unprotectAsymmetric } from "./index";
import { readFileSync } from "fs";
import * as readline from "readline";


const { publicKey, privateKey } = generateAsymmetricKeys()

function encodeLoginData(data: any) {
  const serverPublicKey = createPublicKey({
    key: readFileSync(
      "C:\Users\User\Desktop\t49-goncalo-miguel-renato\keys\server_public.pem"
    ),
    format: "pem",
    type: "spki",
  });

  const encryptedLoginData = protectAsymmetric(data, serverPublicKey);

  return encryptedLoginData;
}

function decodeLoginData(data: any) {
  
  const decryptLoginData = unprotectAsymmetric(data, privateKey);

  return decryptLoginData;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let clientId: string;
let password: string;

rl.question("Enter Client ID: ", (id) => {
  clientId = id;

  rl.question("Enter Password: ", (pass) => {
    rl.close();

    password = pass;
    console.log(
      encodeLoginData({
        clientId: clientId,
        password: password,
        publicKey: publicKey.export().toString("base64")
      })
    );
  });
});
