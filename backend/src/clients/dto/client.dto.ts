import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty({ message: 'El nombre del cliente es obligatorio' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  identification?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  guarantorName?: string;

  @IsOptional()
  @IsString()
  guarantorPhone?: string;

  @IsOptional()
  @IsNumber()
  routeId?: number;

  @IsOptional()
  @IsString()
  cedulaFrontUrl?: string;

  @IsOptional()
  @IsString()
  cedulaBackUrl?: string;

  @IsOptional()
  @IsString()
  guarantorDocUrl?: string;
}

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  identification?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  guarantorName?: string;

  @IsOptional()
  @IsString()
  guarantorPhone?: string;

  @IsOptional()
  @IsNumber()
  routeId?: number;

  @IsOptional()
  @IsString()
  cedulaFrontUrl?: string;

  @IsOptional()
  @IsString()
  cedulaBackUrl?: string;

  @IsOptional()
  @IsString()
  guarantorDocUrl?: string;
}
