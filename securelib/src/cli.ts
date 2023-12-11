import { createPublicKey } from "crypto";
import {
  generateAsymmetricKeys,
  protectAsymmetric,
  secureHash,
  unprotectAsymmetric,
} from "./index";
import { readFileSync } from "fs";
import prompts from "prompts";

const { publicKey, privateKey } = generateAsymmetricKeys();

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

function decodeLoginData(data: any) {
  const decryptLoginData = unprotectAsymmetric(data, privateKey);

  return decryptLoginData;
}

enum CLIOption {
  EncodeLogin,
  DecodeLogin,
}

async function main() {
  const choice = await prompts({
    type: "select",
    name: "value",
    message: "Choose a task",
    choices: [
      { title: "Create login payload", value: CLIOption.EncodeLogin },
      { title: "Decrypt login payload", value: CLIOption.DecodeLogin },
    ],
  });

  switch (choice.value as CLIOption) {
    case CLIOption.EncodeLogin:
      const userInput = await prompts([
        {
          type: "text",
          name: "clientId",
          message: "Client ID:",
        },
        {
          type: "text",
          name: "password",
          message: "Client password:",
        },
      ]);

      let loginPayload = {
        ...encodeLoginData({
          clientId: userInput.clientId,
          password: userInput.password,
        }),
        publicKey: Buffer.from(
          publicKey.export({ type: "spki", format: "pem" })
        ).toString("base64"),
      };

      // Recompute MIC to account public key
      loginPayload = {
        ...loginPayload,
        mic: secureHash({
          nonce: loginPayload.nonce,
          data: loginPayload.data,
          publicKey: loginPayload.publicKey,
        }),
      };

      console.log("Payload:");
      console.log(loginPayload);
      break;

    case CLIOption.DecodeLogin:
      const input = await prompts([
        {
          type: "text",
          name: "payload",
          message: "Payload:",
        },
      ]);

      console.log("Decoded data:");
      console.log(decodeLoginData(input.payload));
      break;
  }
}

main();
