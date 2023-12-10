import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { KeyObject } from "crypto";
import { Account } from "../../account/schemas/account.schema";

@Schema()
export class Client {
  @Prop()
  name: string;

  @Prop()
  password: string;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }])
  accounts: Account[];
}

@Schema()
export class Session {
  @Prop()
  sessionKey: KeyObject;

  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: Client.name }])
  client: Client;
}

export type ClientHydrated = HydratedDocument<Client>;
export const ClientSchema = SchemaFactory.createForClass(Client);

export type SessionHydrated = HydratedDocument<Session>;
export const SessionSchema = SchemaFactory.createForClass(Session);
