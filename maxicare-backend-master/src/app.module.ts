import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ShiftsModule } from './shift/shifts.module';
import { JobTypesModule } from './job-types/job-types.module';
import { MailModule } from './mail/mail.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'maxicare_shift_db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development', // Set to false in production
    }),
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MailModule,
    JobTypesModule,
    ShiftsModule,
    AnalyticsModule
  ],
})
export class AppModule {}
