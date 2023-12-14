import { Logger, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AccountModule } from "./account/account.module";
import { ClientModule } from "./client/client.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { PaymentModule } from "./payment/payment.module";
import { ScheduleModule } from "@nestjs/schedule";
import { CacheModule } from "@nestjs/cache-manager";
import { Duration } from "luxon";

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      ttl: Duration.fromObject({
        days: 15,
      }).as("milliseconds"),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger("MongooseModule");

        const uri = configService.getOrThrow("DB_CONNECTION");
        const useTLS = configService.getOrThrow("DB_USE_TLS") == "true";

        logger.log(`Connecting to ${uri}...`);
        if (useTLS) logger.warn(`TLS enabled`);

        return {
          uri: uri,
          tls: useTLS,
        };
      },
      inject: [ConfigService],
    }),
    AccountModule,
    ClientModule,
    PaymentModule,
  ],
})
export class AppModule {}
