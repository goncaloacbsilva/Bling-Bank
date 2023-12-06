import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type AccountMovementHydrated = HydratedDocument<AccountMovement>;
export type AccountHydrated = HydratedDocument<Account>;

@Schema()
export class AccountMovement {
  @Prop()
  date: string;

  @Prop()
  value: number;

  @Prop()
  description: string;
}

@Schema()
export class Account {
  @Prop()
  accountHolder: string[];

  @Prop({ default: 0 })
  balance: number;

  @Prop()
  currency: "EUR" | "USD" | "AED" | "CHF" | "BRL" | "GBP";

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: AccountMovement.name }])
  movements: [AccountMovement];
}

export const AccountMovementSchema =
  SchemaFactory.createForClass(AccountMovement);
export const AccountSchema = SchemaFactory.createForClass(Account);
