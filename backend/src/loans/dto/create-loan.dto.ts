import { IsNumber, IsPositive, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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
  @IsOptional()
  term?: number;

  @IsEnum(PaymentFrequency)
  frequency: PaymentFrequency;

  @IsNumber()
  @IsNotEmpty()
  bankAccountId: number;

  @IsString()
  @IsOptional()
  loanType?: 'REDITO' | 'INSTALLMENT';

  @IsString()
  @IsOptional()
  interestType?: 'SIMPLE' | 'FRENCH';

  @IsString()
  @IsOptional()
  lateFeeType?: 'PERCENT' | 'FIXED' | 'NONE';

  @IsNumber()
  @IsOptional()
  lateFeeValue?: number;

  @IsNumber()
  @IsOptional()
  graceDays?: number;
}
