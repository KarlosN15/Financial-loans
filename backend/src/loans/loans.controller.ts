import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { LoansService } from './loans.service';
import { PaymentFrequency } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('loans')
@UseGuards(JwtAuthGuard)
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  create(@Request() req: any, @Body() data: { clientId: number; amount: number; interestRate: number; term: number; frequency: PaymentFrequency }) {
    return this.loansService.createLoan(req.user, data);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.loansService.findAll(req.user);
  }

  @Get('summary')
  getSummary(@Request() req: any) {
    return this.loansService.getSummary(req.user);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.loansService.remove(req.user, +id);
  }
}
