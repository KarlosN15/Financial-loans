import { Controller, Get, Patch, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { SaasService } from './saas.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from './superadmin.guard';

@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('saas')
export class SaasController {
  constructor(private saasService: SaasService) {}

  @Get('users')
  async getAllAdmins() {
    return this.saasService.getAllAdmins();
  }

  @Patch('users/:id/plan')
  async updateUserPlan(
    @Param('id', ParseIntPipe) id: number,
    @Body('plan') plan: string
  ) {
    return this.saasService.updateUserPlan(id, plan);
  }
}
