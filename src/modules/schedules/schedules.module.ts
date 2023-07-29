import { Module } from '@nestjs/common';
import { SchedulesController } from './controller/schedules.controller';
import SchedulesService from './service/schedules.service';

@Module({
  controllers: [SchedulesController],
  providers: [SchedulesService],
})
export class SchedulesModule {}
