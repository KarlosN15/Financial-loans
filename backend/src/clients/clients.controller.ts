import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  create(@Request() req: any, @Body() data: CreateClientDto) {
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

  @Post(':id/update')
  updatePost(@Request() req: any, @Param('id') id: string, @Body() data: UpdateClientDto) {
    return this.clientsService.update(req.user, +id, data);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Solo los administradores tienen permiso para eliminar clientes.');
    }
    return this.clientsService.remove(req.user, +id);
  }
}
