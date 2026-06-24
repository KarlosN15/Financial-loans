import { IsNumber, IsPositive, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
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

  @IsNumber()
  @IsOptional()
  portfolioId?: number;

  @IsNumber()
  @IsNotEmpty()
  bankAccountId: number;
}
