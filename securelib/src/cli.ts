import { createPublicKey } from "crypto";
import { protectAsymmetric } from "./index";
import { readFileSync } from "fs";
import * as readline from "readline";

function encodeLoginData(data: any) {
  const serverPublicKey = createPublicKey({
    key: readFileSync(
      "/home/goncalo/Documents/IST/SIRS/t49-goncalo-miguel-renato/keys/server_public.pem"
    ),
    format: "pem",
    type: "spki",
  });

  const encryptedLoginData = protectAsymmetric(data, serverPublicKey);

  return encryptedLoginData;
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
      })
    );
  });
});
