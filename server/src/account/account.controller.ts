import { CreateAccountDto } from "./dtos/createAccount.dto";
import { AccountService } from "./account.service";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ValidationPipe,
} from "@nestjs/common";
import { Account } from "./schemas/account.schema";
import { CreateAccountMovementDto } from "./dtos/createMovement.dto";

@Controller("accounts")
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /*     @Post('protect')
    async protect(
      @Body(ValidationPipe) protectDto: ProtectDto,
    ): Promise<ProtectedData> {
      
    } */

  /* @Post('unprotect/:key')
    async unprotect(
        @Body(ValidationPipe) unprotectDto: UnprotectDto,
        @Param('key') key: string,
    ): Promise<any> {
        return this.appService.unprotect(key, unprotectDto);
    } */

  @Post()
  async createAccount(
    @Body(ValidationPipe) createAccountDto: CreateAccountDto
  ) {
    return this.accountService.create(createAccountDto);
  }

  @Get(":id")
  async find(@Param("id") id: string): Promise<Account> {
    return this.accountService.find(id);
  }

  @Get(":id/movements")
  async findAllMovements(
    @Param("id") id: string
  ): Promise<Account["movements"]> {
    return this.accountService.findAllMovements(id);
  }

  @Post(":id/movements")
  async createMovement(
    @Body(ValidationPipe) createAccountMovementDto: CreateAccountMovementDto,
    @Param("id") id: string
  ) {
    return this.accountService.createMovement(id, createAccountMovementDto);
  }

  @Get()
  async findAll(): Promise<Account[]> {
    return this.accountService.findAll();
  }

  @Delete(":id")
  async delete(@Param("id") id: string) {
    return this.accountService.remove(id);
  }

  @Get(":id/expenses")
  async findExpenses(@Param("id") id: string) {
    return this.accountService.findExpenses(id);
  }

  @Put(":id/payments")
  async payment(
    @Body(ValidationPipe) createAccountMovementDto: CreateAccountMovementDto,
    @Param("id") id: string
  ) {
    return this.accountService.payment(id, createAccountMovementDto);
  }
}
