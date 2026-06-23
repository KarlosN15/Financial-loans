import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BanksService {
  constructor(private prisma: PrismaService) {}

  async create(adminId: number, data: { bankName: string, accountNumber: string, balance: number }) {
    return this.prisma.bankAccount.create({
      data: {
        userId: adminId,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        balance: data.balance,
      },
    });
  }

  async findAll(adminId: number) {
    return this.prisma.bankAccount.findMany({
      where: { userId: adminId },
      include: {
        transactions: true,
      },
    });
  }

  async addTransaction(adminId: number, bankAccountId: number, data: { type: 'INCOME' | 'EXPENSE', amount: number, description: string }) {
    const bankAccount = await this.prisma.bankAccount.findUnique({
      where: { id: bankAccountId },
    });

    if (!bankAccount || bankAccount.userId !== adminId) {
      throw new NotFoundException('Cuenta bancaria no encontrada');
    }

    // Actualizar balance
    const newBalance = data.type === 'INCOME' 
      ? Number(bankAccount.balance) + Number(data.amount) 
      : Number(bankAccount.balance) - Number(data.amount);

    await this.prisma.bankAccount.update({
      where: { id: bankAccountId },
      data: { balance: newBalance },
    });

    return this.prisma.bankTransaction.create({
      data: {
        bankAccountId,
        type: data.type,
        amount: data.amount,
        description: data.description,
      },
    });
  }
}
