import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Roles('ADMIN')
  @Post()
  create(@Request() req, @Body() data: { investorName: string, amount: number, interestRate: number }) {
    const adminId = req.user.role === 'ADMIN' ? req.user.id : req.user.adminId;
    return this.investmentsService.create(adminId, data);
  }

  @Roles('ADMIN')
  @Get()
  findAll(@Request() req) {
    const adminId = req.user.role === 'ADMIN' ? req.user.id : req.user.adminId;
    return this.investmentsService.findAll(adminId);
  }
}
