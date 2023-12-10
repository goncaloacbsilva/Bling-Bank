import { IsDateString, IsMongoId, IsNumber, IsString } from "class-validator";

export class CreatePaymentDto {
  @IsDateString()
  date: string;

  @IsString()
  entity: string;

  @IsNumber()
  ammount: number;

  @IsString()
  description: string;

  @IsMongoId()
  accountId: string;
}
