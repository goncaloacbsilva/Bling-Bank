import { IsBase64, IsMongoId } from "class-validator";

export class AuthorizePaymentDto {
  @IsMongoId()
  sessionId: string;

  @IsMongoId()
  paymentId: string;

  @IsBase64()
  signature: string;
}
