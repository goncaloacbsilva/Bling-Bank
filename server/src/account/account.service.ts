import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { KeyObject, createSecretKey, randomBytes, scryptSync } from "crypto";
import { CreateAccountDto } from "./dtos/createAccount.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Account, AccountMovement } from "./schemas/account.schema";
import { Model } from "mongoose";
import { CreateAccountMovementDto } from "./dtos/createMovement.dto";
import { groupBy } from "lodash";
import { DateTime } from "luxon";

function generateSymmetricKey(): KeyObject {
  const salt = randomBytes(16); // Generate a random salt
  const key = scryptSync(
    "98n751t43v31t4754619387fd5jmdxk193780t54d6yj",
    salt,
    32
  ); // Adjust the length based on your requirements

  return createSecretKey(key);
}

@Injectable()
export class AccountService {
  /* async protect(protectDto: ProtectDto) {
        const protectEntity = new this.AccountModel(protectDto);
        return protectEntity.save();
    } */

  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    @InjectModel(AccountMovement.name)
    private readonly accountMovementModel: Model<Account>
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const account = new this.accountModel(createAccountDto);
    return account.save();
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

  async find(id: string): Promise<Account> {
    const account = await this.accountModel.findById(id).exec();

    if (!account) throw new NotFoundException("Account not found");

    return account;
  }

  async findAll(): Promise<Account[]> {
    return this.accountModel.find().exec();
  }

  async findAllMovements(id: string): Promise<Account["movements"]> {
    const account = await this.accountModel.findById(id).populate("movements");

    if (!account) throw new NotFoundException("Account not found");

    return account.movements;
  }

  async findExpenses(id: string) {
    const account = await this.accountModel.findById(id).populate("movements");

    if (!account) throw new NotFoundException("Account not found");

    const expensesMovements = account.movements.filter(
      (movement) => movement.value < 0
    );

    expensesMovements.sort((a, b) => {
      const d1 = DateTime.fromFormat(a.date, "dd/MM/yyyy");
      const d2 = DateTime.fromFormat(b.date, "dd/MM/yyyy");

      return d2.toMillis() - d1.toMillis();
    });

    const result = groupBy(expensesMovements, ({ description }) => description);

    return result;
  }

  async remove(id: string) {
    return this.accountModel.deleteOne({
      _id: id,
    });
  }

  // Quero que o usuario veja o pagamento e atualize o balance e depois salve o movimento
  async payment(
    id: string,
    createAccountMovementDto: CreateAccountMovementDto
  ) {
    const account = await this.accountModel.findById(id);

    if (!account) throw new NotFoundException("Account not found");

    if (account.balance + createAccountMovementDto.value < 0)
      throw new BadRequestException("Insufficient funds");

    if (
      DateTime.now().toMillis() -
        DateTime.fromFormat(
          createAccountMovementDto.date,
          "dd/MM/yyyy"
        ).toMillis() <
      0
    )
      throw new BadRequestException("Invalid Date");

    account.save();

    return this.createMovement(id, createAccountMovementDto);
  }

  /* async unprotect(key: string, unprotectDto: UnprotectDto) {
        return unprotect(unprotectDto, createSecretKey(Buffer.from(key, 'base64')));
    } */
}
