import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class OpenCashRegisterDto {
  @IsNotEmpty({ message: 'El balance inicial es obligatorio' })
  @IsNumber()
  @Min(0, { message: 'El balance inicial no puede ser negativo' })
  openingBalance: number;
}

export class CloseCashRegisterDto {
  @IsNotEmpty({ message: 'El balance de cierre es obligatorio' })
  @IsNumber()
  @Min(0, { message: 'El balance de cierre no puede ser negativo' })
  closingBalance: number;
}

export class CashTransactionDto {
  @IsNotEmpty({ message: 'El tipo de transacción es obligatorio' })
  @IsEnum(TransactionType, { message: 'El tipo debe ser INCOME o EXPENSE' })
  type: TransactionType;

  @IsNotEmpty({ message: 'El monto es obligatorio' })
  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor que 0' })
  amount: number;

  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString()
  description: string;
}
