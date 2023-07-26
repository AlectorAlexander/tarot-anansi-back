import { Module } from '@nestjs/common';
import { UsersController } from './controller/users.controller';
import UsersService from './service/users.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './service/jwt.strategy';
import { JwtAuthGuard } from './service/jwt-auth.guard';
const { JWT_SECRET } = process.env;

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '1h' }
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, JwtAuthGuard], // Add JwtStrategy and JwtAuthGuard to the providers
})
export class UsersModule {}
