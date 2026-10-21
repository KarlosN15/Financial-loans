import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateBankDto {
  @IsNotEmpty({ message: 'El nombre del banco es obligatorio' })
  @IsString()
  bankName: string;

  @IsNotEmpty({ message: 'El número de cuenta es obligatorio' })
  @IsString()
  accountNumber: string;

  @IsNumber()
  balance: number;
}

export class CreateBankTransactionDto {
  @IsNotEmpty({ message: 'El tipo de transacción es obligatorio' })
  @IsEnum(TransactionType, { message: 'El tipo debe ser INCOME o EXPENSE' })
  type: TransactionType;

  @IsNotEmpty({ message: 'El monto es obligatorio' })
  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor a 0' })
  amount: number;

  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString()
  description: string;
}
