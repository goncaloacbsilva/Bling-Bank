import { IsArray, IsNotEmpty, IsNumber } from "class-validator";

export class CreateAccountDto {
  @IsArray()
  accountHolder: string[];

  @IsNotEmpty()
  currency: "EUR" | "USD" | "AED" | "CHF" | "BRL" | "GBP" | "GONCAZ";
}
