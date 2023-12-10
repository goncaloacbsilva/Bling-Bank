import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { Client, Session } from "./schemas/client.schema";
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { LoginDto, RawLoginDto } from "./dtos/login.dto";
import { KeyObject, createPrivateKey } from "crypto";
import { writeFileSync } from "fs";
import {
  decryptAsymmetricData,
  generateAsymmetricKeys,
  generateSymmetricKey,
  unprotectAsymmetric,
} from "@securelib";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);
  private privateKey: KeyObject;

  constructor(
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>
  ) {
    this.logger.log("Generating server keypair...");
    if (!process.env.KEYS_PATH)
      throw new Error("FATAL: Missing keys path at .env (KEYS_PATH)");

    const { publicKey, privateKey } = generateAsymmetricKeys();
    this.logger.log("Exporting keys...");

    writeFileSync(
      `${process.env.KEYS_PATH}/server_public.pem`,
      publicKey.export({ type: "spki", format: "pem" })
    );
    writeFileSync(
      `${process.env.KEYS_PATH}/server_private.pem`,
      privateKey.export({ type: "pkcs8", format: "pem" })
    );

    this.logger.log("Keys exported to:", process.env.KEYS_PATH);
  }

  findAll() {
    return this.clientModel.find().exec();
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientModel.findById(id).exec();

    if (!client) throw new NotFoundException("Account not found");

    return client;
  }

  async login(rawLoginDto: RawLoginDto) {
    const loginData = unprotectAsymmetric(rawLoginDto, this.privateKey);

    let loginDto = plainToInstance(LoginDto, loginData);
    const errors = validateSync(loginDto);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    // Check credentials

    const client = await this.clientModel.findById(loginDto.clientId);

    if (!client) throw new NotFoundException("Client not found");

    if (client.password !== loginDto.password)
      throw new UnauthorizedException("Invalid credentials");

    // Initialize session

    const sessionKey = generateSymmetricKey();

    const session = new this.sessionModel({
      sessionKey: sessionKey,
      client: client,
    });

    await session.save();

    return {
      sessionKey: sessionKey.export().toString("base64"),
    };
  }
}
