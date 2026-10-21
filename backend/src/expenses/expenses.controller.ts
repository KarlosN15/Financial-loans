import { Controller, Get, Post, Body, Param, Put, Patch, UseGuards, Request } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateExpenseDto } from './dto/expense.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Roles('ADMIN', 'AGENT')
  @Post()
  create(@Request() req, @Body() data: CreateExpenseDto) {
    const adminId = Number(req.user.role === 'ADMIN' ? (req.user.userId || req.user.id) : req.user.adminId);
    return this.expensesService.create(adminId, data);
  }

  @Roles('ADMIN', 'AGENT')
  @Get()
  findAll(@Request() req) {
    const adminId = Number(req.user.role === 'ADMIN' ? (req.user.userId || req.user.id) : req.user.adminId);
    return this.expensesService.findAll(adminId);
  }

  @Roles('ADMIN', 'AGENT')
  @Put(':id/pay')
  markAsPaidPut(@Request() req, @Param('id') id: string) {
    const adminId = Number(req.user.role === 'ADMIN' ? (req.user.userId || req.user.id) : req.user.adminId);
    return this.expensesService.markAsPaid(adminId, +id);
  }

  @Roles('ADMIN', 'AGENT')
  @Patch(':id/pay')
  markAsPaidPatch(@Request() req, @Param('id') id: string) {
    const adminId = Number(req.user.role === 'ADMIN' ? (req.user.userId || req.user.id) : req.user.adminId);
    return this.expensesService.markAsPaid(adminId, +id);
  }
}
