import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Request() req: any, @Body() data: CreatePaymentDto) {
    return this.paymentsService.create(req.user, data);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.paymentsService.findAll(req.user);
  }

  @Get('upcoming')
  getUpcoming(@Request() req: any) {
    return this.paymentsService.getUpcoming(req.user);
  }
}
