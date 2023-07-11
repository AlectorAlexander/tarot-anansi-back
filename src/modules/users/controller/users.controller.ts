import { Controller, Post, Get, Put, Delete, Param, Body, BadRequestException } from '@nestjs/common';
import { IUser } from '../dtos/users.dtos';
import UsersService from '../service/users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    async Register(@Body() userData: IUser): Promise<String> {
        try {
            return await this.usersService.create(userData);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    @Post('login')
        async login(@Body() loginData: { email: string, password: string }): Promise<IUser> {
    try {
        const { email, password } = loginData;
        return await this.usersService.readOne(email, password);
    } catch (error) {
        throw new BadRequestException(error.message);
    }
}


    @Get()
    async read(): Promise<IUser[]> {
        try {
            return await this.usersService.read();
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() userUpdates: IUser | object): Promise<IUser> {
        try {
            return await this.usersService.update(id, userUpdates);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<IUser> {
        try {
            return await this.usersService.delete(id);
        } catch (error) {
            throw new BadRequestException(error);
        }
    }
}
