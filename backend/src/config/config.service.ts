import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConfigService {
  constructor(private prisma: PrismaService) {}

  async createBranch(adminId: number, data: { name: string, address?: string }) {
    return this.prisma.branch.create({
      data: {
        userId: adminId,
        name: data.name,
        address: data.address,
      },
    });
  }

  async getBranches(adminId: number) {
    return this.prisma.branch.findMany({ where: { userId: adminId } });
  }

  async updateBranch(adminId: number, id: number, data: { name: string, address?: string }) {
    return this.prisma.branch.updateMany({
      where: { id, userId: adminId },
      data: { name: data.name, address: data.address },
    });
  }

  async deleteBranch(adminId: number, id: number) {
    return this.prisma.branch.deleteMany({
      where: { id, userId: adminId },
    });
  }

  async createRoute(adminId: number, data: { name: string }) {
    return this.prisma.route.create({
      data: {
        userId: adminId,
        name: data.name,
      },
    });
  }

  async getRoutes(adminId: number) {
    return this.prisma.route.findMany({ where: { userId: adminId } });
  }

  async updateRoute(adminId: number, id: number, data: { name: string }) {
    return this.prisma.route.updateMany({
      where: { id, userId: adminId },
      data: { name: data.name },
    });
  }

  async deleteRoute(adminId: number, id: number) {
    return this.prisma.route.deleteMany({
      where: { id, userId: adminId },
    });
  }

  async createPortfolio(adminId: number, data: { name: string }) {
    return this.prisma.portfolio.create({
      data: {
        userId: adminId,
        name: data.name,
      },
    });
  }

  async getPortfolios(adminId: number) {
    return this.prisma.portfolio.findMany({ where: { userId: adminId } });
  }

  async updatePortfolio(adminId: number, id: number, data: { name: string }) {
    return this.prisma.portfolio.updateMany({
      where: { id, userId: adminId },
      data: { name: data.name },
    });
  }

  async deletePortfolio(adminId: number, id: number) {
    return this.prisma.portfolio.deleteMany({
      where: { id, userId: adminId },
    });
  }
}
