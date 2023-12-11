import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  ValidationPipe,
} from "@nestjs/common";
import { ClientService } from "./client.service";
import { RawLoginDto } from "./dtos/login.dto";

@Controller("clients")
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  findAll() {
    return this.clientService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.clientService.findOne(id);
  }

  @Post("login")
  async login(
    @Headers("mic") mic: string,
    @Headers("nonce") nonce: string,
    @Body(ValidationPipe) rawLoginDto: RawLoginDto
  ) {
    return await this.clientService.login({
      mic: mic,
      nonce: nonce,
      ...rawLoginDto,
    });
  }
}
