import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any, twoFactorCode?: string) {
    if (user.isTwoFactorEnabled) {
      if (!twoFactorCode) {
        throw new UnauthorizedException('2FA code required');
      }
      if (!user.twoFactorSecret) {
        throw new UnauthorizedException('2FA not properly configured');
      }
      const isCodeValid = authenticator.verify({
        token: twoFactorCode,
        secret: user.twoFactorSecret,
      });
      if (!isCodeValid) {
        throw new UnauthorizedException('Invalid 2FA code');
      }
    }

    const payload = { email: user.email, sub: user.id, role: user.role, adminId: user.adminId, plan: user.plan };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
    };
  }

  async register(data: { name: string; email: string; password: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email.toLowerCase().trim() } });
    if (existing) throw new ConflictException('El correo electrónico ya está registrado.');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'ADMIN',
        plan: 'inicio',
      },
    });

    return this.login(user);
  }

  async generateTwoFactorAuthenticationSecret(user: any) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'SISTEMAFAC', secret);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret },
    });

    return {
      secret,
      otpauthUrl,
    };
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return qrcode.toDataURL(otpAuthUrl);
  }

  async turnOnTwoFactorAuthentication(userId: number, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('User not found or 2FA not initialized');
    }
    const isCodeValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isCodeValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { isTwoFactorEnabled: true },
    });
  }

  async changePassword(userId: number, currentPassword?: string, newPassword?: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('La nueva contraseña debe tener al menos 6 caracteres.');
    }
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('La contraseña actual es incorrecta.');
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { message: 'Contraseña actualizada con éxito.' };
  }
}
