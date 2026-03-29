import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Request() req: any, @Body() data: { name: string; email?: string; identification: string; phone?: string }) {
    return this.clientsService.create(req.user, data);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.clientsService.findAll(req.user);
  }

  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.findOne(req.user, +id);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.clientsService.remove(req.user, +id);
  }
}

