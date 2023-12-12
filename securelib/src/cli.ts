import { KeyObject, createPublicKey, createSecretKey } from "crypto";
import {
  ProtectedData,
  generateAsymmetricKeys,
  protect,
  protectAsymmetricClient,
  secureHash,
  unprotect,
  unprotectAsymmetric,
} from "./index";
import { readFileSync } from "fs";
import prompts, { Choice } from "prompts";
import axios, { AxiosError, AxiosInstance } from "axios";
import { DisplayData, DisplayExpenses, DisplayMovements } from "./display";

// Auxiliary functions

function encodeLoginData(data: any) {
  const serverPublicKey = createPublicKey({
    key: readFileSync(
      "/Users/goncalo/Desktop/IST - MEIC/1st year/2nd Quarter/SIRS/t49-goncalo-miguel-renato/keys/server_public.pem"
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

interface Session {
  id: string;
  key: KeyObject;
}

class BlingBankClient {
  private clientInstance: AxiosInstance;
  private clientKeys: ClientKeys;
  private session?: Session;
  private currentAccountId?: string;

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

  private createPayload(data?: any) {
    if (!this.session)
      throw new Error("Fatal: Unable to create payload: Mising session key");

    let protectedPayload;
    if (data) {
      protectedPayload = protect(data, this.session.key);
    } else {
      protectedPayload = protect("", this.session.key);
    }

    return {
      headers: {
        mic: protectedPayload.mic,
        nonce: protectedPayload.nonce,
        "session-id": this.session.id,
      },
      body: protectedPayload.data,
    };
  }

  private decodeServerPayload(data: ProtectedData) {
    if (!this.session)
      throw new Error("Fatal: Unable to decode payload: Mising session key");

    return unprotect(data, this.session.key);
  }

  public async getAccounts(): Promise<string[]> {
    const payloadData = this.createPayload();

    try {
      const response = await this.clientInstance.get("client/accounts", {
        headers: payloadData.headers,
      });

      var plainData = this.decodeServerPayload(response.data);
      return plainData;
    } catch (err) {
      handleRequestError(err);
      return [];
    }
  }

  public async setAccount(accountId: string) {
    const payloadData = this.createPayload();

    try {
      const response = await this.clientInstance.get("accounts/" + accountId, {
        headers: payloadData.headers,
      });

      var plainData = this.decodeServerPayload(response.data);
      this.currentAccountId = accountId;

      return plainData;
    } catch (err) {
      handleRequestError(err);
      return undefined;
    }
  }

  public async getMovements() {
    const payloadData = this.createPayload();

    try {
      const response = await this.clientInstance.get(
        `accounts/${this.currentAccountId}/movements`,
        {
          headers: payloadData.headers,
        }
      );

      var plainData = this.decodeServerPayload(response.data);
      return plainData;
    } catch (err) {
      //console.error(err);
      handleRequestError(err);
      return [];
    }
  }

  public async getExpenses() {
    const payloadData = this.createPayload();

    try {
      const response = await this.clientInstance.get(
        `accounts/${this.currentAccountId}/expenses`,
        {
          headers: payloadData.headers,
        }
      );

      var plainData = this.decodeServerPayload(response.data);
      return plainData;
    } catch (err) {
      handleRequestError(err);
      return [];
    }
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
        "client/login",
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

      this.session = {
        id: decryptLoginData.sessionId,
        key: createSecretKey(
          Buffer.from(decryptLoginData.sessionKey, "base64")
        ),
      };
    } catch (err) {
      handleRequestError(err);
      return false;
    }

    return true;
  }
}

enum CLIOption {
  Movements,
  AuthorizePayment,
  CreatePayment,
  Expenses,
  Exit,
}

async function accountManagementCLI(client: BlingBankClient, accountData: any) {
  while (true) {
    console.clear();
    console.log("Account", accountData._id);
    console.log(`Balance: ${accountData.balance} ${accountData.currency}`);

    const accountManagement = await prompts({
      type: "select",
      name: "accountOperation",
      message: "Choose an option",
      choices: [
        { title: "Movements", value: CLIOption.Movements },
        { title: "Expenses", value: CLIOption.Expenses },
        { title: "Create payment order", value: CLIOption.CreatePayment },
        { title: "Authorize payment", value: CLIOption.AuthorizePayment },
        { title: "Back", value: CLIOption.Exit },
      ],
    });

    console.clear();

    switch (accountManagement.accountOperation as CLIOption) {
      case CLIOption.Movements:
        await DisplayData.display(
          DisplayMovements,
          await client.getMovements()
        );
        break;
      case CLIOption.Expenses:
        console.log("Expenses:");
        const expenses = await client.getExpenses();
        await DisplayData.display(
          DisplayExpenses,
          Object.keys(expenses).map((expenseKey) => {
            return { category: expenseKey, content: expenses[expenseKey] };
          })
        );
        break;
      case CLIOption.CreatePayment:
        console.log("Create Payment Order:");
        const paymentOrder = await prompts([
          {
            type: "text",
            name: "entity",
            message: `entity:`,
          },
          {
            type: "text",
            name: "ammount",
            message: `ammount:`,
          },
          {
            type: "text",
            name: "description",
            message: `description:`,
          },
        ]);
        //faltam cenas
        break;
      case CLIOption.AuthorizePayment:
        console.log("Authorize Payment:");
        break;
      case CLIOption.Exit:
        return;
    }
  }
}

async function main() {
  const client = new BlingBankClient("http://localhost:3000/");

  console.clear();

  console.log(
    "========================================================================================="
  );
  console.log(
    " _______   __  __                      _______                       __       "
  );
  console.log(
    "|       \\ |  \\|  \\                    |       \\                     |  \\      "
  );
  console.log(
    "| $$$$$$$\\| $$ \\$$ _______    ______  | $$$$$$$\\  ______   _______  | $$   __ "
  );
  console.log(
    "| $$__/ $$| $$|  \\|       \\  /      \\ | $$__/ $$ |      \\ |       \\ | $$  /  \\"
  );
  console.log(
    "| $$    $$| $$| $$| $$$$$$$\\|  $$$$$$\\| $$    $$  \\$$$$$$\\| $$$$$$$\\| $$_/  $$"
  );
  console.log(
    "| $$$$$$$\\| $$| $$| $$  | $$| $$  | $$| $$$$$$$\\ /      $$| $$  | $$| $$   $$ "
  );
  console.log(
    "| $$__/ $$| $$| $$| $$  | $$| $$__| $$| $$__/ $$|  $$$$$$$| $$  | $$| $$$$$$\\ "
  );
  console.log(
    "| $$    $$| $$| $$| $$  | $$ \\$$    $$| $$    $$ \\$$    $$| $$  | $$| $$  \\$$\\"
  );
  console.log(
    " \\$$$$$$$  \\$$ \\$$ \\$$   \\$$  \\$$$$$$$ \\$$$$$$$   \\$$$$$$$ \\$$   \\$$ \\$$   \\$$"
  );
  console.log(
    "                            |  \\__| $$                                        "
  );
  console.log(
    "                             \\$$    $$                                        "
  );
  console.log(
    "                              \\$$$$$$                                         "
  );

  console.log(
    "========================================================================================="
  );

  console.log("Login:\n");
  const isLoggedIn = await client.login();

  if (!isLoggedIn) return;

  console.clear();
  //add person name
  console.log("Welcome back\n");
  const accounts = await client.getAccounts();

  while (true) {
    const accountSelection = await prompts({
      type: "select",
      name: "accountId",
      message: "Choose your account",
      choices: [
        ...accounts.map((accountId: string) => ({
          title: `Account ${accountId}`,
          value: accountId,
        })),
        { title: "Exit", value: CLIOption.Exit },
      ],
    });

    if (accountSelection.accountId === CLIOption.Exit) return;

    // Select account
    const accountData = await client.setAccount(accountSelection.accountId);

    if (accountData) await accountManagementCLI(client, accountData);
    console.clear();
  }
}

main();
