import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BanksService } from './banks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateBankDto, CreateBankTransactionDto } from './dto/bank.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('banks')
export class BanksController {
  constructor(private readonly banksService: BanksService) {}

  @Roles('ADMIN')
  @Post()
  create(@Request() req, @Body() data: CreateBankDto) {
    const adminId = req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId;
    return this.banksService.create(adminId, data);
  }

  @Roles('ADMIN')
  @Get()
  findAll(@Request() req) {
    const adminId = req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId;
    return this.banksService.findAll(adminId);
  }

  @Roles('ADMIN')
  @Post(':id/transaction')
  addTransaction(
    @Request() req,
    @Param('id') id: string,
    @Body() data: CreateBankTransactionDto
  ) {
    const adminId = req.user.role === 'ADMIN' ? req.user.userId : req.user.adminId;
    return this.banksService.addTransaction(adminId, +id, data);
  }
}
