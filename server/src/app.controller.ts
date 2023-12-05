import { Body, Controller, Param, Post, ValidationPipe } from '@nestjs/common';
import { AppService } from './app.service';
import { ProtectDto } from './dtos/protect.dto';
import { ProtectedData } from '@securelib';
import { UnprotectDto } from './dtos/unprotect.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('protect')
  async protect(
    @Body(ValidationPipe) protectDto: ProtectDto,
  ): Promise<ProtectedData> {
    return this.appService.protect(protectDto);
  }

  @Post('unprotect/:key')
  async unprotect(
    @Body(ValidationPipe) unprotectDto: UnprotectDto,
    @Param('key') key: string,
  ): Promise<any> {
    return this.appService.unprotect(key, unprotectDto);
  }

  /*   @Get()
  async check(@Body): */
}
