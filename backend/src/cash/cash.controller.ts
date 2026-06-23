import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CashService } from './cash.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cash')
export class CashController {
  constructor(private readonly cashService: CashService) {}

  @Roles('ADMIN')
  @Post('open')
  openRegister(@Request() req, @Body() data: { openingBalance: number }) {
    const adminId = req.user.role === 'ADMIN' ? req.user.id : req.user.adminId;
    return this.cashService.openRegister(adminId, data.openingBalance);
  }

  @Roles('ADMIN')
  @Post(':id/close')
  closeRegister(@Request() req, @Param('id') id: string, @Body() data: { closingBalance: number }) {
    const adminId = req.user.role === 'ADMIN' ? req.user.id : req.user.adminId;
    return this.cashService.closeRegister(adminId, +id, data.closingBalance);
  }

  @Roles('ADMIN')
  @Get('current')
  getCurrentRegister(@Request() req) {
    const adminId = req.user.role === 'ADMIN' ? req.user.id : req.user.adminId;
    return this.cashService.getCurrentRegister(adminId);
  }

  @Roles('ADMIN')
  @Post(':id/transaction')
  addTransaction(
    @Request() req,
    @Param('id') id: string,
    @Body() data: { type: 'INCOME' | 'EXPENSE', amount: number, description: string }
  ) {
    const adminId = req.user.role === 'ADMIN' ? req.user.id : req.user.adminId;
    return this.cashService.addTransaction(adminId, +id, data);
  }
}
