import { KeyObject, createPublicKey } from "crypto";
import {
  generateAsymmetricKeys,
  protectAsymmetricClient,
  secureHash,
  unprotectAsymmetric,
} from "./index";
import { readFileSync } from "fs";
import prompts from "prompts";
import axios, { AxiosError, AxiosInstance } from "axios";

// Auxiliary functions

function encodeLoginData(data: any) {
  const serverPublicKey = createPublicKey({
    key: readFileSync(
      "/home/goncalo/Documents/IST/SIRS/t49-goncalo-miguel-renato/keys/server_public.pem"
    ),
    format: "pem",
    type: "spki",
  });

  const encryptedLoginData = protectAsymmetricClient(data, serverPublicKey);

  return encryptedLoginData;
}

function handleRequestError(err: any) {
  const error = err as AxiosError;

  if (error.response) {
    const responseData: any = error.response.data;

    console.error(
      "Authentication Error:",
      responseData["message"] ?? "Unknown error"
    );
  } else {
    console.error(err);
  }
}

interface LoginData {
  clientId: string;
  password: string;
}

interface ClientKeys {
  publicKey: KeyObject;
  privateKey: KeyObject;
}

class BlingBankClient {
  private clientInstance: AxiosInstance;
  private clientKeys: ClientKeys;

  constructor(address: string) {
    this.clientKeys = generateAsymmetricKeys();

    this.clientInstance = axios.create({
      baseURL: address,
    });
  }

  get publicKeyBase64() {
    return Buffer.from(
      this.clientKeys.publicKey.export({ type: "spki", format: "pem" })
    ).toString("base64");
  }

  private createLoginPayload(loginData: LoginData) {
    let loginPayload = {
      ...encodeLoginData(loginData),
      publicKey: this.publicKeyBase64,
    };

    // Recompute MIC to account public key
    return {
      ...loginPayload,
      mic: secureHash({
        nonce: loginPayload.nonce,
        data: loginData,
        publicKey: loginPayload.publicKey,
      }),
    };
  }

  public async login(): Promise<boolean> {
    const loginCredentials = await prompts([
      {
        type: "text",
        name: "clientId",
        message: "Client ID:",
      },
      {
        type: "password",
        name: "password",
        message: "Client password:",
      },
    ]);

    const loginPayload = this.createLoginPayload(loginCredentials);

    try {
      const response = await this.clientInstance.post(
        "clients/login",
        {
          data: loginPayload.data,
          publicKey: loginPayload.publicKey,
        },
        {
          headers: {
            mic: loginPayload.mic,
            nonce: loginPayload.nonce,
          },
        }
      );

      const decryptLoginData = unprotectAsymmetric(
        response.data,
        this.clientKeys.privateKey
      );
    } catch (err) {
      handleRequestError(err);
      return false;
    }

    return true;
  }
}

enum CLIOption {
  Accounts,
  Payments,
  Exit,
}

async function main() {
  const client = new BlingBankClient("http://192.168.2.170:3000/");

  console.log("Login:\n");
  const isLoggedIn = await client.login();

  if (!isLoggedIn) return;

  console.log("Login successfull\n");

  while (true) {
    const choice = await prompts({
      type: "select",
      name: "accountId",
      message: "Choose your account",
      choices: [
        { title: "Account #1", value: CLIOption.Accounts },
        { title: "Account #2", value: CLIOption.Payments },
        { title: "Exit", value: CLIOption.Exit },
      ],
    });

    switch (choice.accountId as CLIOption) {
      case CLIOption.Exit:
        return;
    }
  }
}

main();
