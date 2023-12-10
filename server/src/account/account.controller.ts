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

  // Account

  @Get()
  async findAll(): Promise<Account[]> {
    return this.accountService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string): Promise<Account> {
    return await this.accountService.findOne(id);
  }

  // Movements

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

  // Expenses

  @Get(":id/expenses")
  async findExpenses(@Param("id") id: string) {
    return this.accountService.findExpenses(id);
  }
}
