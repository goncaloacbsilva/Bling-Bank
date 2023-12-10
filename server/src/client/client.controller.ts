import { Controller, Get, Param } from "@nestjs/common";
import { ClientService } from "./client.service";

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
}
