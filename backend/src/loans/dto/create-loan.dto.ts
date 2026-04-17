import { IsNumber, IsPositive, IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentFrequency } from '@prisma/client';

export class CreateLoanDto {
  @IsNumber()
  @IsNotEmpty()
  clientId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsNumber()
  @IsPositive()
  interestRate: number;

  @IsNumber()
  @IsPositive()
  term: number;

  @IsEnum(PaymentFrequency)
  frequency: PaymentFrequency;
}
