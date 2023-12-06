import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  Account,
  AccountMovement,
  AccountMovementSchema,
  AccountSchema,
} from "./schemas/account.schema";
import { AccountService } from "./account.service";
import { AccountController } from "./account.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema },
      { name: AccountMovement.name, schema: AccountMovementSchema },
    ]),
  ],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
