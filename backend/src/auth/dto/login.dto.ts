import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password: string;

  @IsOptional()
  @IsString()
  twoFactorCode?: string;
}
