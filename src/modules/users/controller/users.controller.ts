/* eslint-disable indent */
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  BadRequestException,
  NotFoundException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { IUser } from '../dtos/users.dtos';
import UsersService from '../service/users.service';
import { JwtAuthGuard } from '../service/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async register(@Body() userData: IUser): Promise<string> {
    try {
      const createdUserId = await this.usersService.create(userData);
      return createdUserId;
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException({ message: error.message });
    }
  }

  @Post('login')
  async login(
    @Body() loginData: { email: string; password: string },
  ): Promise<string> {
    try {
      const { email, password } = loginData;
      const user = await this.usersService.readOne(email, password);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      console.log(error);
      throw new BadRequestException({ message: error.message });
    }
  }

  @Get()
  async read(): Promise<IUser[]> {
    try {
      const users = await this.usersService.read();
      return users;
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async update(
    @Request() req: any,
    @Body() userUpdates: IUser | object,
  ): Promise<IUser> {
    try {
      const userId = req.user.id;
      const updatedUser = await this.usersService.update(userId, userUpdates);
      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }
      return updatedUser;
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  @Put('byEmail')
  async updateByEmail(
    @Request() req: any,
    @Body() userUpdates: IUser | any,
  ): Promise<string> {
    try {
      const { email, ...restOfUserUpdates } = userUpdates;
      const updatedUser = await this.usersService.updateByEmail(
        email || 'pamonha',
        restOfUserUpdates,
      );

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }
      return updatedUser;
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<IUser> {
    try {
      const deletedUser = await this.usersService.delete(id);
      if (!deletedUser) {
        throw new NotFoundException('User not found');
      }
      return deletedUser;
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  @Post('google-login')
  async googleLogin(
    @Body()
    googleData: {
      google_id: string;
      email: string;
      name: string;
      profile_photo?: string;
      phone: string;
    },
  ): Promise<string> {
    try {
      const token = await this.usersService.googleLogin(googleData);
      return token;
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }
  @Post('validate-token')
  async validateToken(@Body('token') token: string): Promise<unknown> {
    try {
      const isValid = await this.usersService.validate(token);
      return isValid;
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }
}
