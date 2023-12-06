import { Injectable, NotFoundException } from "@nestjs/common";
import { protect, unprotect } from "@securelib";
import { KeyObject, createSecretKey, randomBytes, scryptSync } from "crypto";
import { UnprotectDto } from "./dtos/unprotect.dto";
import { ProtectDto } from "./dtos/protect.dto";
import { CreateAccountDto } from "./dtos/createAccount.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Account, AccountMovement } from "./schemas/account.schema";
import { Model } from "mongoose";
import { CreateAccountMovementDto } from "./dtos/createMovement.dto";

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
      if (a.description < b.description) {
        return -1;
      }
      if (a.description > b.description) {
          return 1;
      }
      return 0;
    });

    return expensesMovements;
  }

  async remove(id: string) {
    return this.accountModel.deleteOne({
      _id: id,
    });
  }
    

  /* async unprotect(key: string, unprotectDto: UnprotectDto) {
        return unprotect(unprotectDto, createSecretKey(Buffer.from(key, 'base64')));
    } */
}
