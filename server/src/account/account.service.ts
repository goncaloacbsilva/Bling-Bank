import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { KeyObject, createSecretKey, randomBytes, scryptSync } from "crypto";
import { InjectModel } from "@nestjs/mongoose";
import { Account } from "./schemas/account.schema";
import { Model, Types } from "mongoose";
import { CreateAccountMovementDto } from "./dtos/createMovement.dto";
import { groupBy } from "lodash";
import { DateTime } from "luxon";
import { seedAccounts, seedClients } from "./data/seed";
import { Client } from "../client/schemas/client.schema";
import { AccountMovement } from "./schemas/movement.schema";

@Injectable()
export class AccountService implements OnModuleInit {
  private readonly logger = new Logger(AccountService.name);

  constructor(
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    @InjectModel(AccountMovement.name)
    private readonly accountMovementModel: Model<Account>
  ) {}

  async onModuleInit() {
    // Populate db

    // Create clients
    const createdUsersIndex = new Map<string, number>();

    this.logger.warn(`[DB Populate]: Deleting previous data`);
    await this.accountModel.deleteMany().exec();
    await this.clientModel.deleteMany().exec();

    let index = 0;
    let clients = seedClients.map((clientDto) => {
      const client = new this.clientModel(clientDto);
      this.logger.log(`[DB Populate]: Creating client ${client._id}`);

      createdUsersIndex.set(client.name, index);
      index++;
      return client;
    });

    let accounts = seedAccounts.map((accountsDto) => {
      const account = new this.accountModel({
        currency: accountsDto.currency,
      });

      this.logger.log(`[DB Populate]: Creating account ${account._id}`);

      accountsDto.accountHolders.forEach((holder) => {
        const client = clients[createdUsersIndex.get(holder)];
        client.accounts.push(account);
        account.holders.push(client);
      });

      return account;
    });

    await Promise.all([
      clients.map((m) => m.save()),
      accounts.map((m) => m.save()),
    ]);
    this.logger.log(`[DB Populate]: Saved documents`);
  }

  // Account

  async findAll(): Promise<Account[]> {
    return await this.accountModel.find().exec();
  }

  async findAccount(clientId: string, accountId: string): Promise<Account> {
    const account = await this.accountModel.findById(accountId).exec();

    if (!account) throw new NotFoundException("Account not found");

    const clientIds = account.holders.map((holder) => holder.toString());

    if (!clientIds.includes(clientId))
      throw new ForbiddenException(
        "The account cannot be accessed by the current client"
      );

    return account;
  }

  // Movements feature

  async findAllMovements(id: string): Promise<Account["movements"]> {
    const account = await this.accountModel.findById(id).populate("movements");

    if (!account) throw new NotFoundException("Account not found");

    return account.movements;
  }

  async createMovement(
    id: string,
    createAccountMovementDto: CreateAccountMovementDto
  ) {
    const movement = new this.accountMovementModel(createAccountMovementDto);
    movement.save();

    const update = await this.accountModel.findByIdAndUpdate(
      id,
      {
        $push: {
          movements: movement,
        },
        $inc: {
          balance: createAccountMovementDto.value,
        },
      },
      {
        new: true,
      }
    );

    return update.movements;
  }

  // Expenses feature

  async findExpenses(id: string) {
    const account = await this.accountModel.findById(id).populate("movements");

    if (!account) throw new NotFoundException("Account not found");

    const expensesMovements = account.movements.filter(
      (movement) => movement.ammount < 0
    );

    expensesMovements.sort((a, b) => {
      return a.date.toMillis() - b.date.toMillis();
    });

    const result = groupBy(expensesMovements, ({ description }) => description);

    return result;
  }
}
