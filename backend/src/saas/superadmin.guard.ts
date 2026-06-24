import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.email) {
      throw new UnauthorizedException('Debes iniciar sesión');
    }

    const superAdminEmail = this.configService.get<string>('SUPERADMIN_EMAIL') || 'admin@prestamopro.com';
    
    if (!superAdminEmail || user.email.toLowerCase() !== superAdminEmail.toLowerCase()) {
      throw new UnauthorizedException('Acceso denegado. Se requieren permisos de Super Administrador (SaaS).');
    }

    return true;
  }
}
