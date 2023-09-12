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
import { JwtAuthGuard } from 'src/modules/users/service/jwt-auth.guard';
import { ISessions } from '../dtos/sessions.dtos';
import SessionsService from '../service/sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private readonly SessionsService: SessionsService) {}
  @Get()
  async readAll(@Request() req: any): Promise<ISessions[]> {
    try {
      const sessions = await this.SessionsService.read();
      return sessions;
    } catch (error) {
      throw new NotFoundException('No sessions found');
    }
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Request() req: any,
    @Body() data: ISessions,
  ): Promise<ISessions> {
    try {
      const session = await this.SessionsService.create(data);
      return session;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to create session',
        details: error.message,
      });
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async readOne(@Param('id') id: string): Promise<ISessions> {
    try {
      const session = await this.SessionsService.readOne(id);
      if (!session) {
        throw new NotFoundException('session not found');
      }
      return session;
    } catch (error) {
      throw new NotFoundException('session not found');
    }
  }

  @Get('/schedule:id')
  @UseGuards(JwtAuthGuard)
  async read(
    @Request() req: any,
    @Param('id') id: string,
  ): Promise<ISessions | ISessions[]> {
    try {
      const role = req.user.role;
      if (role === 'admin') {
        const sessions = await this.SessionsService.read();
        return sessions;
      } else {
        const sessions = await this.SessionsService.findByScheduleId(id);
        return sessions;
      }
    } catch (error) {
      throw new NotFoundException('No sessions found');
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() scheduleUpdates: ISessions,
  ): Promise<ISessions> {
    try {
      const updatedSchedule = await this.SessionsService.update(
        id,
        scheduleUpdates,
      );
      if (!updatedSchedule) {
        throw new NotFoundException('session not found');
      }
      return updatedSchedule;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to update session',
        details: error.message,
      });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string): Promise<ISessions> {
    try {
      const session = await this.SessionsService.delete(id);
      if (!session) {
        throw new NotFoundException('session not found');
      }
      return session;
    } catch (error) {
      throw new BadRequestException({
        message: 'Failed to delete session',
        details: error.message,
      });
    }
  }
}
