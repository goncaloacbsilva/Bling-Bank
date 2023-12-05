import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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

  balance: number;

  @Prop()
  currency: 'EUR' | 'USD' | 'AED' | 'CHF' | 'BRL' | 'GBP';

  movements: AccountMovement[];
}

export const AccountMovementSchema = SchemaFactory.createForClass(AccountMovement);
export const AccountSchema = SchemaFactory.createForClass(Account);