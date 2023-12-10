import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AccountModule } from "./account/account.module";
import { ClientModule } from './client/client.module';

@Module({
  imports: [
    MongooseModule.forRoot("mongodb://localhost:27017/mongo"),
    AccountModule,
    ClientModule,
  ],
})
export class AppModule {}
