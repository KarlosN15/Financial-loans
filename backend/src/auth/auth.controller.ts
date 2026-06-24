import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.authService.login(user, body.twoFactorCode);
  }

  @Post('register')
  async register(@Body() body: any) {
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
}
