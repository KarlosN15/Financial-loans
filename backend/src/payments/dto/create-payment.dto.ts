import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class CreatePaymentDto {
  @IsNotEmpty({ message: 'El ID del préstamo es obligatorio' })
  @IsNumber()
  loanId: number;

  @IsNotEmpty({ message: 'El monto a pagar es obligatorio' })
  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor que cero' })
  amount: number;

  @IsNotEmpty({ message: 'El método de pago es obligatorio' })
  @IsEnum(PaymentMethod, { message: 'Método de pago inválido (CASH o TRANSFER)' })
  method: PaymentMethod;

  @IsOptional()
  isInterestOnly?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  lateFeePaid?: number;

  @IsOptional()
  @IsNumber()
  bankAccountId?: number;
}
