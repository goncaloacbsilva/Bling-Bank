import { IsString, IsNumber, IsDateString } from "class-validator";

export class CreateAccountMovementDto {
  @IsDateString()
  date: string;

  @IsNumber()
  value: number;

  @IsString()
  description: string;
}
