import { CreateAccountDto } from './dtos/createAccount.dto';
import { AccountService } from './account.service';
import { Body, Controller, Get, Param, Post, ValidationPipe } from '@nestjs/common';
import { Account } from './schemas/account.schema';
import { CreateAccountMovementDto } from './dtos/createMovement.dto';

@Controller('accounts')
export class AccountController {
    constructor(private readonly accountService: AccountService) { }

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
    async createAccount(@Body(ValidationPipe) createAccountDto: CreateAccountDto) {
        return this.accountService.create(createAccountDto);
    }

    @Post(':id/movements')
    async createMovement(@Body(ValidationPipe) createAccountMovementDto: CreateAccountMovementDto, @Param('id') id: string) {
        return this.accountService.createMovement(id, createAccountMovementDto)
    }

    @Get()
    async findAll(): Promise<Account[]> {
        return this.accountService.findAll();
    }
}