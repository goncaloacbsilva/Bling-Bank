import { Injectable } from '@nestjs/common';
import { protect, unprotect } from '@securelib';
import { KeyObject, createSecretKey, randomBytes, scryptSync } from 'crypto';
import { UnprotectDto } from './dtos/unprotect.dto';
import { ProtectDto } from './dtos/protect.dto';
import { CreateAccountDto } from './dtos/createAccount.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Account } from './schemas/account.schema';
import { Model } from 'mongoose';
import { CreateAccountMovementDto } from './dtos/createMovement.dto';

function generateSymmetricKey(): KeyObject {
    const salt = randomBytes(16); // Generate a random salt
    const key = scryptSync(
        '98n751t43v31t4754619387fd5jmdxk193780t54d6yj',
        salt,
        32,
    ); // Adjust the length based on your requirements

    return createSecretKey(key);
}

@Injectable()
export class AccountService {

    /* async protect(protectDto: ProtectDto) {
        const protectEntity = new this.AccountModel(protectDto);
        return protectEntity.save();
    } */

    constructor(@InjectModel(Account.name) private readonly accountModel: Model<Account>) { }

    async create(createAccountDto: CreateAccountDto): Promise<Account> {
        const account = new this.accountModel(createAccountDto)
        return account.save()
    }

    async createMovement(id: string, createAccountMovementDto: CreateAccountMovementDto) {
        return this.accountModel.updateOne({ _id: id }, {
            $push: {
                movements: createAccountMovementDto
            }
        })
    }

    async findAll(): Promise<Account[]> {
        return this.accountModel.find().exec();
    }

    /* async unprotect(key: string, unprotectDto: UnprotectDto) {
        return unprotect(unprotectDto, createSecretKey(Buffer.from(key, 'base64')));
    } */
}