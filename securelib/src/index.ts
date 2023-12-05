import { Console } from "console";
import * as crypto from "crypto";

interface CipherResult {
  data: string;
  nonce: string;
}
export interface ProtectedData {
  mic: string;
  nonce: string;
  data: string;
}

// Auxiliary functions

function createMIC(cipheredData: CipherResult): string {
  const hash = crypto.createHash("sha256");
  hash.update(JSON.stringify(cipheredData));
  return hash.digest("base64");
}

function micMatch(mic: string, cipheredData: CipherResult): boolean {
  return createMIC(cipheredData) === mic;
}

function cipherData(data: any, secret: crypto.KeyObject): CipherResult {
  const nonce = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", secret, nonce);
  const encrypted = cipher.update(JSON.stringify(data));

  return {
    data: Buffer.concat([encrypted, cipher.final()]).toString("base64"),
    nonce: nonce.toString("base64"),
  };
}

function decipherData(
  cipheredData: ProtectedData,
  secret: crypto.KeyObject
): any {
  const nonce = Buffer.from(cipheredData.nonce, "base64");
  const decipher = crypto.createDecipheriv("aes-256-cbc", secret, nonce);

  const decrypted = Buffer.concat([decipher.update(Buffer.from(cipheredData.data, "base64")), decipher.final()]).toString();
  

  return JSON.parse(decrypted);
}

// Exported functions

export function protect(data: any, secret: crypto.KeyObject): ProtectedData {
  const cipheredData = cipherData(data, secret);

  if (!cipheredData) {
    throw new Error("Failed to cipher data.");
  }

  return {
    mic: createMIC(cipheredData),
    nonce: cipheredData.nonce,
    data: cipheredData.data,
  };
}

export function check(data: ProtectedData): boolean {
  return micMatch(data.mic, {
    data: data.data,
    nonce: data.nonce,
  });
}

export function unprotect(
  protectedData: ProtectedData,
  key: crypto.KeyObject
): any {
  if (!check(protectedData)) {
    throw new Error("Failed to decipher: compromised data!");
  }

  return decipherData(protectedData, key);
}
