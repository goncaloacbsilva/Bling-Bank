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
import { protect, unprotect } from "@securelib";
import { validate, validateSync } from "class-validator";
import { plainToInstance } from "class-transformer";
import { SecureDataRequest } from "./secure.dto";
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

    let reqDto = plainToInstance(SecureDataRequest, req.body);
    const errors = validateSync(reqDto);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }

    const session = await this.sessionModel.findById(reqDto.sessionId).exec();

    if (!session) {
      throw new NotFoundException("Invalid session");
    }

    console.log(session);

    // Decrypt request
    req.body = unprotect(reqDto, session.sessionKey);

    return handler
      .handle()
      .pipe(map((data) => protect(data, session.sessionKey)));
  }
}
