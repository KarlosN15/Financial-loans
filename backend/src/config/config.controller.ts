import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
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
    const adminId = Number(req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId);
    return this.configService.createBranch(adminId, data);
  }

  @Roles('ADMIN')
  @Get('branches')
  getBranches(@Request() req) {
    const adminId = Number(req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId);
    return this.configService.getBranches(adminId);
  }

  @Roles('ADMIN')
  @Put('branches/:id')
  updateBranch(@Request() req, @Param('id') id: string, @Body() data: { name: string, address?: string }) {
    const adminId = Number(req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId);
    return this.configService.updateBranch(adminId, Number(id), data);
  }

  @Roles('ADMIN')
  @Delete('branches/:id')
  deleteBranch(@Request() req, @Param('id') id: string) {
    const adminId = Number(req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId);
    return this.configService.deleteBranch(adminId, Number(id));
  }

  // Routes
  @Roles('ADMIN')
  @Post('routes')
  createRoute(@Request() req, @Body() data: { name: string }) {
    const adminId = Number(req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId);
    return this.configService.createRoute(adminId, data);
  }

  @Roles('ADMIN')
  @Get('routes')
  getRoutes(@Request() req) {
    const adminId = Number(req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId);
    return this.configService.getRoutes(adminId);
  }

  @Roles('ADMIN')
  @Put('routes/:id')
  updateRoute(@Request() req, @Param('id') id: string, @Body() data: { name: string }) {
    const adminId = Number(req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId);
    return this.configService.updateRoute(adminId, Number(id), data);
  }

  @Roles('ADMIN')
  @Delete('routes/:id')
  deleteRoute(@Request() req, @Param('id') id: string) {
    const adminId = Number(req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId);
    return this.configService.deleteRoute(adminId, Number(id));
  }

  // Portfolios
  @Roles('ADMIN')
  @Post('portfolios')
  createPortfolio(@Request() req, @Body() data: { name: string }) {
    const adminId = Number(req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId);
    return this.configService.createPortfolio(adminId, data);
  }

  @Roles('ADMIN')
  @Get('portfolios')
  getPortfolios(@Request() req) {
    const adminId = Number(req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId);
    return this.configService.getPortfolios(adminId);
  }

  @Roles('ADMIN')
  @Put('portfolios/:id')
  updatePortfolio(@Request() req, @Param('id') id: string, @Body() data: { name: string }) {
    const adminId = Number(req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId);
    return this.configService.updatePortfolio(adminId, Number(id), data);
  }

  @Roles('ADMIN')
  @Delete('portfolios/:id')
  deletePortfolio(@Request() req, @Param('id') id: string) {
    const adminId = Number(req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId);
    return this.configService.deletePortfolio(adminId, Number(id));
  }
}
