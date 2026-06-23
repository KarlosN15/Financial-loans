import { Controller, Get, Post, Body, Param, Put, UseGuards, Request } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Roles('ADMIN')
  @Post()
  create(@Request() req, @Body() data: { amount: number, description: string, status?: 'PAID' | 'PENDING' }) {
    const adminId = req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId;
    return this.expensesService.create(adminId, data);
  }

  @Roles('ADMIN')
  @Get()
  findAll(@Request() req) {
    const adminId = req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId;
    return this.expensesService.findAll(adminId);
  }

  @Roles('ADMIN')
  @Put(':id/pay')
  markAsPaid(@Request() req, @Param('id') id: string) {
    const adminId = req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId;
    return this.expensesService.markAsPaid(adminId, +id);
  }
}
