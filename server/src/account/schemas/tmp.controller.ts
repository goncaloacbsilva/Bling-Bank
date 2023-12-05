/* import { Body, Controller, Param, Post, ValidationPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { ProtectDto } from './dtos/protect.dto';
import { ProtectedData } from '@securelib';
import { UnprotectDto } from './dtos/unprotect.dto';
import { CreateAccountDto } from './dtos/createAccount.dto';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    @Post('protect')
    async protect(
      @Body(ValidationPipe) protectDto: ProtectDto,
    ): Promise<ProtectedData> {
      
    }

    @Post('unprotect/:key')
    async unprotect(
        @Body(ValidationPipe) unprotectDto: UnprotectDto,
        @Param('key') key: string,
    ): Promise<any> {
        return this.appService.unprotect(key, unprotectDto);
    }

    @Post('create')
    async createAccount(@Body(ValidationPipe) createAccountDto: CreateAccountDto) {
        return this.appService.createAccount(createAccountDto)
    }
}
 */