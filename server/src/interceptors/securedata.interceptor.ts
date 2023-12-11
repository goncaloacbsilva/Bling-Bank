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
import { ProtectedData, micMatch, protect, unprotect } from "@securelib";
import { isMongoId, validateSync } from "class-validator";
import { plainToInstance } from "class-transformer";
import { SecureData } from "./secure.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Session } from "src/client/schemas/client.schema";

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

    if (!session) {
      throw new NotFoundException("Invalid session");
    }

    console.log("Session:", session);

    if (req.body) {
      let reqDto = plainToInstance(SecureData, req.body);
      const errors = validateSync(reqDto);

      if (errors.length > 0) {
        throw new BadRequestException(errors);
      }

      const protectedPacket: ProtectedData = {
        mic: req.headers.get("mic"),
        nonce: req.headers.get("nonce"),
        data: reqDto.data,
      };

      console.log("Protected packet:", protectedPacket);

      // Decrypt request
      req.body = unprotect(protectedPacket, session.sessionKey);
    } else {
      if (
        !micMatch(req.headers.get("mic"), {
          nonce: req.headers.get("nonce"),
        })
      )
        throw new BadRequestException("Integrity protection fault");
    }

    return handler
      .handle()
      .pipe(map((data) => protect(data, session.sessionKey)));
  }
}
