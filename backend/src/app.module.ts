import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ClientsModule } from './clients/clients.module';
import { LoansModule } from './loans/loans.module';
import { PaymentsModule } from './payments/payments.module';
import { CashModule } from './cash/cash.module';
import { ExpensesModule } from './expenses/expenses.module';
import { BanksModule } from './banks/banks.module';
import { InvestmentsModule } from './investments/investments.module';
import { ConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { AgentsModule } from './agents/agents.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ClientsModule,
    LoansModule,
    PaymentsModule,
    AuthModule,
    AgentsModule,
    CashModule,
    ExpensesModule,
    BanksModule,
    InvestmentsModule,
    ConfigModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
