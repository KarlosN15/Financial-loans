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
import { ConfigModule as AppConfigModule } from './config/config.module';
import { AuthModule } from './auth/auth.module';
import { AgentsModule } from './agents/agents.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { AuditModule } from './audit/audit.module';
import { CronModule } from './cron/cron.module';
import { EventsModule } from './events/events.module';
import { SaasModule } from './saas/saas.module';

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
    AppConfigModule,
    SaasModule,
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 120,
    }]),
    AuditModule,
    CronModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
