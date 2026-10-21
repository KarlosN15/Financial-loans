import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.authService.login(user, body.twoFactorCode);
  }

  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async registerCode(@Request() req) {
    const { otpauthUrl } = await this.authService.generateTwoFactorAuthenticationSecret(req.user);
    const qrCodeDataURL = await this.authService.generateQrCodeDataURL(otpauthUrl);
    return { qrCodeDataURL };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/turn-on')
  async turnOnTwoFactorAuthentication(
    @Request() req,
    @Body('twoFactorCode') twoFactorCode: string,
  ) {
    await this.authService.turnOnTwoFactorAuthentication(req.user.userId || req.user.id || req.user.sub, twoFactorCode);
    return { message: '2FA enabled successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req: any, @Body() body: { currentPassword?: string; newPassword: string }) {
    const userId = Number(req.user.userId || req.user.id || req.user.sub);
    return this.authService.changePassword(userId, body.currentPassword, body.newPassword);
  }
}
