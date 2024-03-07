import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  NotFoundException,
  BadRequestException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ISchedules } from '../dtos/schedules.dtos';
import SchedulesService from '../service/schedules.service';
import { JwtAuthGuard } from 'src/modules/users/service/jwt-auth.guard';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Post('calendar')
  async readAll(
    @Body() dates: { start_date: Date; end_date?: Date },
  ): Promise<ISchedules[]> {
    try {
      const schedules = await this.schedulesService.findByDate(
        dates.start_date,
        dates.end_date,
      );
      return schedules;
    } catch (error) {
      console.log(error);

      throw new NotFoundException('No schedules found for this date');
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: any,
    @Body() data: ISchedules,
  ): Promise<ISchedules> {
    try {
      const userId = req.user.id;
      data.user_id = userId;
      data.start_date = new Date(data.start_date);
      data.end_date = new Date(data.end_date);
      const schedule = await this.schedulesService.create(data);
      return schedule;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to create schedule',
        details: error.message,
      });
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async read(@Request() req: any): Promise<ISchedules[]> {
    try {
      const role = req.user.role;
      if (role === 'admin') {
        const schedules = await this.schedulesService.read();
        return schedules;
      } else {
        const userId = req.user.id;
        const schedules = await this.schedulesService.findByUserId(userId);
        return schedules;
      }
    } catch (error) {
      throw new NotFoundException('No schedules found');
    }
  }

  @Post('date')
  @UseGuards(JwtAuthGuard)
  async findByDate(
    @Body() dates: { start_date: Date; end_date?: Date },
  ): Promise<ISchedules[]> {
    try {
      const schedules = await this.schedulesService.findByDate(
        dates.start_date,
        dates.end_date,
      );
      return schedules;
    } catch (error) {
      throw new NotFoundException('No schedules found for this date');
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async readOne(@Param('id') id: string): Promise<ISchedules> {
    try {
      const schedule = await this.schedulesService.readOne(id);
      if (!schedule) {
        throw new NotFoundException('Schedule not found');
      }
      return schedule;
    } catch (error) {
      throw new NotFoundException('Schedule not found');
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() scheduleUpdates: ISchedules,
  ): Promise<ISchedules> {
    try {
      const updatedSchedule = await this.schedulesService.update(
        id,
        scheduleUpdates,
      );
      if (!updatedSchedule) {
        throw new NotFoundException('Schedule not found');
      }
      return updatedSchedule;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to update schedule',
        details: error.message,
      });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string): Promise<ISchedules> {
    try {
      const deletedSchedule = await this.schedulesService.delete(id);
      if (!deletedSchedule) {
        throw new NotFoundException('Schedule not found');
      }
      return deletedSchedule;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to delete schedule',
        details: error.message,
      });
    }
  }

  @Post('filter-slots')
  async filterSlots(
    @Body() body: { date: Date; slots: string[] },
  ): Promise<string[]> {
    try {
      const { date, slots } = body;

      const filteredSlots = await this.schedulesService.filterAvailableSlots(
        date,
        slots,
      );
      return filteredSlots;
    } catch (error) {
      console.log(error);

      throw new BadRequestException({
        message: 'Failed to filter available slots',
        details: error.message,
      });
    }
  }
}
