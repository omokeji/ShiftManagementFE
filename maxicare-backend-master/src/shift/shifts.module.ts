import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShiftsService } from './shifts.service';
import { ShiftsController } from './shifts.controller';
import { Shift } from './shift.entity';
import { JobTypesModule } from '../job-types/job-types.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Shift]), JobTypesModule, UsersModule],
  providers: [ShiftsService],
  controllers: [ShiftsController],
  exports: [ShiftsService],
})
export class ShiftsModule {}