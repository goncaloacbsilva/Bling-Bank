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
import { KeyObject, createPrivateKey, createPublicKey } from "crypto";
import { writeFileSync } from "fs";
import {
  decryptAsymmetricData,
  generateAsymmetricKeys,
  generateSymmetricKey,
  secureHash,
  micMatch,
  ProtectedData,
  protectAsymmetricServer,
} from "@securelib";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name);
  private privateKey: KeyObject;

  constructor(
    @InjectModel(Client.name) private readonly clientModel: Model<Client>,
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
    private configService: ConfigService
  ) {
    this.logger.log("Generating server keypair...");

    const keysPath = this.configService.getOrThrow<string>("KEYS_PATH");

    const { publicKey, privateKey } = generateAsymmetricKeys();

    this.privateKey = privateKey;

    this.logger.log("Exporting keys...");

    writeFileSync(
      `${keysPath}/server_public.pem`,
      publicKey.export({ type: "spki", format: "pem" })
    );
    writeFileSync(
      `${keysPath}/server_private.pem`,
      privateKey.export({ type: "pkcs8", format: "pem" })
    );

    this.logger.log(`Keys exported to: ${keysPath}`);
  }

  findAll() {
    return this.clientModel.find().exec();
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientModel.findById(id).exec();

    if (!client) throw new NotFoundException("Account not found");

    return client;
  }

  async login(encodedLoginDto: ProtectedData & { publicKey: string }) {
    let loginData = undefined;

    try {
      loginData = decryptAsymmetricData(encodedLoginDto, this.privateKey);
    } catch (err: any) {
      throw new BadRequestException("Data decryption fault");
    }

    const micPayload = {
      nonce: encodedLoginDto.nonce,
      data: loginData,
      publicKey: encodedLoginDto.publicKey,
    };

    if (!micMatch(encodedLoginDto.mic, micPayload))
      throw new BadRequestException("Data integrity fault");

    let loginDto = plainToInstance(LoginDto, loginData);
    const errors = validateSync(loginDto);

    if (errors.length > 0) {
      throw new BadRequestException(
        errors.map((error) => Object.values(error.constraints).join(", "))
      );
    }

    // Check credentials

    const client = await this.clientModel.findById(loginDto.clientId);

    if (!client) throw new NotFoundException("Client not found");

    if (client.password !== secureHash(loginDto.password))
      throw new UnauthorizedException("Invalid credentials");

    // Initialize session

    const sessionKey = generateSymmetricKey();

    const session = new this.sessionModel({
      sessionKey: sessionKey,
      client: client,
    });

    await session.save();

    const responseData = {
      sessionId: session.id,
      sessionKey: sessionKey.export().toString("base64"),
    };

    const protectedData = protectAsymmetricServer(
      responseData,
      createPublicKey({
        key: Buffer.from(encodedLoginDto.publicKey, "base64"),
        format: "pem",
        type: "spki",
      })
    );

    return {
      mic: protectedData.mic,
      data: protectedData.data,
    };
  }
}
