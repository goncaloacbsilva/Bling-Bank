import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AccountModule } from "./account/account.module";
import { ClientModule } from "./client/client.module";
import { ConfigModule } from "@nestjs/config";
import { PaymentModule } from "./payment/payment.module";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot("mongodb://localhost:27017/mongo"),
    AccountModule,
    ClientModule,
    PaymentModule,
  ],
})
export class AppModule {}
