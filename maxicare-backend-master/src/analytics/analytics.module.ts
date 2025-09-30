import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { User } from '../users/user.entity';
import { Shift } from '../shift/shift.entity';
import { JobType } from '../job-types/job-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Shift, JobType])
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService]
})
export class AnalyticsModule {}
