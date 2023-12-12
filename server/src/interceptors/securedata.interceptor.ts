import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  ProtectedData,
  check,
  cipherData,
  micMatch,
  protect,
  secureHash,
  unprotect,
} from "@securelib";
import { isMongoId, validateSync } from "class-validator";
import { plainToInstance } from "class-transformer";
import { SecureData } from "./secure.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Session } from "src/client/schemas/client.schema";
import { createSecretKey } from "crypto";

@Injectable()
export class SecureDataInterceptor implements NestInterceptor {
  constructor(
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>
  ) {}

  async intercept(
    context: ExecutionContext,
    handler: CallHandler
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();

    if (!req.headers["session-id"])
      throw new BadRequestException("Missing session header");

    if (!isMongoId(req.headers["session-id"]))
      throw new BadRequestException("Invalid session header");

    // Analyze the risk of not verify the integrity of the "session-id -> report
    const session = await this.sessionModel
      .findById(req.headers["session-id"])
      .exec();

    const sessionKey = createSecretKey(
      Buffer.from(session.sessionKey, "base64")
    );

    if (!session) {
      throw new NotFoundException("Invalid session");
    }

    req.sessionClientId = session.client[0].toString();

    if (Object.keys(req.body).length > 0) {
      let reqDto = plainToInstance(SecureData, req.body);
      const errors = validateSync(reqDto);

      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      const protectedPacket: ProtectedData = {
        mic: req.headers["mic"],
        nonce: req.headers["nonce"],
        data: reqDto.data,
      };

      // Decrypt request
      req.body = unprotect(protectedPacket, sessionKey);
    } else {
      const micDebug = {
        mic: req.headers["mic"],
        nonce: req.headers["nonce"],
        data: "",
      };

      if (!check(micDebug))
        throw new BadRequestException("Integrity protection fault");
    }

    return handler.handle().pipe(
      map((data) => {
        const encodedPacket = protect(data, sessionKey);

        return encodedPacket;
      })
    );
  }
}
