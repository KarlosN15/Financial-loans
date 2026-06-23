import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ConfigService } from './config.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  // Branches
  @Roles('ADMIN')
  @Post('branches')
  createBranch(@Request() req, @Body() data: { name: string, address?: string }) {
    const adminId = req.user.role === 'ADMIN' ? req.user.id : req.user.adminId;
    return this.configService.createBranch(adminId, data);
  }

  @Roles('ADMIN')
  @Get('branches')
  getBranches(@Request() req) {
    const adminId = req.user.role === 'ADMIN' ? req.user.id : req.user.adminId;
    return this.configService.getBranches(adminId);
  }

  // Routes
  @Roles('ADMIN')
  @Post('routes')
  createRoute(@Request() req, @Body() data: { name: string }) {
    const adminId = req.user.role === 'ADMIN' ? req.user.id : req.user.adminId;
    return this.configService.createRoute(adminId, data);
  }

  @Roles('ADMIN')
  @Get('routes')
  getRoutes(@Request() req) {
    const adminId = req.user.role === 'ADMIN' ? req.user.id : req.user.adminId;
    return this.configService.getRoutes(adminId);
  }

  // Portfolios
  @Roles('ADMIN')
  @Post('portfolios')
  createPortfolio(@Request() req, @Body() data: { name: string }) {
    const adminId = req.user.role === 'ADMIN' ? req.user.id : req.user.adminId;
    return this.configService.createPortfolio(adminId, data);
  }

  @Roles('ADMIN')
  @Get('portfolios')
  getPortfolios(@Request() req) {
    const adminId = req.user.role === 'ADMIN' ? req.user.id : req.user.adminId;
    return this.configService.getPortfolios(adminId);
  }
}
