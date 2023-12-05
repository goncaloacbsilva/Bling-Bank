import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAccountDto {

    @IsArray()
    accountHolder: string[];

    @IsNumber()
    balance: number;

    @IsNotEmpty()
    currency: 'EUR' | 'USD' | 'AED' | 'CHF' | 'BRL' | 'GBP' | 'GONCAZ';
}