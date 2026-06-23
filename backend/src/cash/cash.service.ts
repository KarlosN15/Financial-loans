import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CashService {
  constructor(private prisma: PrismaService) {}

  async openRegister(adminId: number, openingBalance: number) {
    const current = await this.getCurrentRegister(adminId);
    if (current) {
      throw new BadRequestException('Ya existe una caja abierta');
    }

    return this.prisma.cashRegister.create({
      data: {
        userId: adminId,
        openingBalance,
      },
    });
  }

  async getCurrentRegister(adminId: number) {
    return this.prisma.cashRegister.findFirst({
      where: {
        userId: adminId,
        status: 'OPEN',
      },
      include: {
        transactions: true,
      },
    });
  }

  async closeRegister(adminId: number, id: number, closingBalance: number) {
    const register = await this.prisma.cashRegister.findUnique({
      where: { id },
    });

    if (!register || register.userId !== adminId) {
      throw new NotFoundException('Caja no encontrada');
    }

    if (register.status === 'CLOSED') {
      throw new BadRequestException('Esta caja ya está cerrada');
    }

    return this.prisma.cashRegister.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closingDate: new Date(),
        closingBalance,
      },
    });
  }

  async addTransaction(adminId: number, registerId: number, data: { type: 'INCOME' | 'EXPENSE', amount: number, description: string }) {
    const register = await this.prisma.cashRegister.findUnique({
      where: { id: registerId },
    });

    if (!register || register.userId !== adminId || register.status !== 'OPEN') {
      throw new BadRequestException('Caja no válida o está cerrada');
    }

    return this.prisma.cashTransaction.create({
      data: {
        cashRegisterId: registerId,
        type: data.type,
        amount: data.amount,
        description: data.description,
      },
    });
  }
}
