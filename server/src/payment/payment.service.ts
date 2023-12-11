import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import {
  KeyObject,
  createPublicKey,
  createSecretKey,
  randomBytes,
  scryptSync,
} from "crypto";

import { InjectModel } from "@nestjs/mongoose";

import { Model } from "mongoose";
import { DateTime } from "luxon";
import { Account } from "src/account/schemas/account.schema";
import { AccountMovement } from "src/account/schemas/movement.schema";
import { CreatePaymentDto } from "./dtos/createPayment.dto";
import { HolderSignature, Payment } from "./schemas/payment.schema";
import { checkSignature } from "../../../securelib/src";
import { AuthorizePaymentDto } from "./dtos/authorizePayment.dto";
import { Client } from "src/client/schemas/client.schema";

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectModel(Account.name) private readonly accountModel: Model<Account>,
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>,
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
    @InjectModel(AccountMovement.name)
    private readonly accountMovementModel: Model<AccountMovement>
  ) {}

  // Auxiliary functions

  private checkHolderSignature(
    holderSignature: HolderSignature,
    paymentId: string
  ): boolean {
    const publicKeyObject = createPublicKey({
      key: Buffer.from(holderSignature.publicKey, "base64"),
      format: "pem",
      type: "spki",
    });

    return checkSignature(
      {
        clientId: holderSignature.clientId,
        paymentId: paymentId,
      },
      holderSignature.signature,
      publicKeyObject
    );
  }

  private checkPaymentSignatures(paymentId: string, payment: Payment): boolean {
    var isValidSignature = false;
    payment.holdersSignatures.forEach((signature) => {
      isValidSignature = this.checkHolderSignature(signature, paymentId);
    });

    return isValidSignature;
  }

  // Allows an entity to emit payments to accounts

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const account = await this.accountModel
      .findById(createPaymentDto.accountId)
      .exec();

    if (!account) throw new NotFoundException("Account not found");

    if (account.balance + createPaymentDto.ammount < 0)
      throw new BadRequestException("Insufficient funds");

    if (
      DateTime.now().toMillis() -
        DateTime.fromISO(createPaymentDto.date).toMillis() <
      0
    )
      throw new BadRequestException("Invalid Date");

    const payment = new this.paymentModel({
      date: DateTime.fromISO(createPaymentDto.date),
      entity: createPaymentDto.entity,
      ammount: createPaymentDto.ammount,
      description: createPaymentDto.description,
      account: account,
    });

    account.paymentOrders.push(payment);

    return await payment.save();
  }

  async authorizePayment(authorizePaymentDto: AuthorizePaymentDto) {
    const payment = await this.paymentModel
      .findById(authorizePaymentDto.paymentId)
      .exec();
    const client = await this.clientModel.findById("").exec();

    if (!payment) throw new NotFoundException("Payment not found");
    if (!payment.account.holders.includes(client))
      throw new ForbiddenException();

    if (payment.completed)
      throw new BadRequestException("This payment was already processed");
  }

  async processPayment(payment: Payment) {
    const movement = new this.accountMovementModel({
      date: payment.date,
      ammount: payment.ammount,
      description: payment.description,
      account: payment.account,
      paymentOrder: payment,
    });

    if (payment.account.balance + payment.ammount < 0)
      throw new BadRequestException("Insufficient funds");

    //autosave?
    payment.account.balance = payment.account.balance + payment.ammount;

    payment.account.movements.push(movement);
    payment.completed = true;

    return await movement.save();
  }
}
