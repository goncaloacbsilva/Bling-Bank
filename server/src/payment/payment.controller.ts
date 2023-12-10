import { PaymentService } from "./payment.service";
import { Body, Controller, Param, Post, ValidationPipe } from "@nestjs/common";

import { CreatePaymentDto } from "./dtos/createPayment.dto";

@Controller("payments")
export class PaymentController {
  constructor(private readonly accountService: PaymentService) {}

  @Post()
  async createPayment(
    @Body(ValidationPipe) createPaymentDto: CreatePaymentDto
  ) {
    return this.accountService.createPayment(createPaymentDto);
  }
}
