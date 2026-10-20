import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  create(@Request() req: any, @Body() data: any) {
    // Solo un ADMIN puede crear agentes
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Solo los administradores pueden gestionar agentes.');
    }
    return this.agentsService.create(req.user.userId, data);
  }

  @Get()
  findAll(@Request() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Solo los administradores pueden ver la lista de agentes.');
    }
    return this.agentsService.findAll(req.user.userId);
  }

  @Get('commissions')
  getCommissions(@Request() req: any) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Solo los administradores pueden ver las comisiones.');
    }
    return this.agentsService.getCommissions(req.user.userId);
  }

  @Post(':id/commission')
  updateCommission(@Request() req: any, @Param('id') id: string, @Body('commissionRate') commissionRate: number) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Solo los administradores pueden cambiar comisiones.');
    }
    return this.agentsService.updateCommission(req.user.userId, +id, commissionRate);
  }

  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') {
      throw new UnauthorizedException('Solo los administradores pueden eliminar agentes.');
    }
    return this.agentsService.remove(req.user.userId, +id);
  }
}
