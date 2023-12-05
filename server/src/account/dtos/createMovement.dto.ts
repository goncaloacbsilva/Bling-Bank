import { IsString, IsNumber } from 'class-validator';

export class CreateAccountMovementDto {
    @IsString()
    date: string;

    @IsNumber()
    value: number;

    @IsString()
    description: string;
}