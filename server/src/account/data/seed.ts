import { secureHash } from "@securelib";
import { Types } from "mongoose";

interface ClientDto {
  name: string;
  password: string;
}

export interface AccountDto {
  accountHolders: string[];
  currency: "EUR" | "USD" | "AED" | "CHF" | "BRL" | "GBP";
}

export const seedClients: ClientDto[] = [
  {
    name: "Alice",
    password: secureHash("alice12345"),
  },
  {
    name: "Bob",
    password: secureHash("bob12345"),
  },
  {
    name: "Eve",
    password: secureHash("eve12345"),
  },
  {
    name: "Carol",
    password: secureHash("carol12345"),
  },
  {
    name: "Walter",
    password: secureHash("walter12345"),
  },
];

export const seedAccounts: AccountDto[] = [
  {
    accountHolders: ["Alice"],
    currency: "EUR",
  },
  {
    accountHolders: ["Bob"],
    currency: "USD",
  },
  {
    accountHolders: ["Eve"],
    currency: "EUR",
  },
  {
    accountHolders: ["Bob", "Eve", "Carol", "Walter"],
    currency: "CHF",
  },
];
