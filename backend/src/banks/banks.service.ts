import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BanksService {
  constructor(private prisma: PrismaService) {}

  async create(adminId: number, data: { bankName: string, accountNumber: string, balance: number }) {
    return this.prisma.bankAccount.create({
      data: {
        userId: adminId,
        bankName: data.bankName.trim(),
        accountNumber: data.accountNumber.trim(),
        balance: data.balance,
      },
    });
  }

  async findAll(adminId: number) {
    return this.prisma.bankAccount.findMany({
      where: { userId: adminId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addTransaction(adminId: number, bankAccountId: number, data: { type: 'INCOME' | 'EXPENSE', amount: number, description: string }) {
    return this.prisma.$transaction(async (tx) => {
      const bankAccount = await tx.bankAccount.findUnique({
        where: { id: bankAccountId },
      });

      if (!bankAccount || bankAccount.userId !== adminId) {
        throw new NotFoundException('Cuenta bancaria no encontrada.');
      }

      if (data.type === 'EXPENSE' && Number(bankAccount.balance) < data.amount) {
        throw new BadRequestException(`Fondos insuficientes en la cuenta bancaria. Saldo disponible: RD$ ${Number(bankAccount.balance)}.`);
      }

      await tx.bankAccount.update({
        where: { id: bankAccountId },
        data: {
          balance: data.type === 'INCOME'
            ? { increment: data.amount }
            : { decrement: data.amount },
        },
      });

      return tx.bankTransaction.create({
        data: {
          bankAccountId,
          type: data.type,
          amount: data.amount,
          description: data.description.trim(),
        },
      });
    });
  }
}
