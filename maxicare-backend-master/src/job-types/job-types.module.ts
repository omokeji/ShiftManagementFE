import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobTypesService } from './job-types.service';
import { JobTypesController } from './job-types.controller';
import { JobType } from './job-types.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobType])],
  providers: [JobTypesService],
  controllers: [JobTypesController],
  exports: [JobTypesService]
})
export class JobTypesModule {}