import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ExpenseStatus } from '@prisma/client';

export class CreateExpenseDto {
  @IsNotEmpty({ message: 'El monto del gasto es obligatorio' })
  @IsNumber()
  @Min(0.01, { message: 'El monto debe ser mayor que 0' })
  amount: number;

  @IsNotEmpty({ message: 'La descripción del gasto es obligatoria' })
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(ExpenseStatus)
  status?: ExpenseStatus;
}
