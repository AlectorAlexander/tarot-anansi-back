import { BookingModule } from './booking/booking.module';
import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './users/service/jwt-middleware-consume';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './users/service/jwt.strategy';
import { JwtAuthGuard } from './users/service/jwt-auth.guard';
import { SchedulesModule } from './schedules/schedules.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PaymentModule } from './payments/payments.module';
import { sessionsModule } from './sessions/sessions.module';
import { productsModule } from './products/products.module';
import { postsModule } from './posts/posts.module';
const { JWT_SECRET } = process.env;

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    MongooseModule.forRoot(process.env.MONGO_DB_URL, {
      autoCreate: true,
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          console.log('Database connection established!');
        });
        return connection;
      },
    }),
    UsersModule,
    SchedulesModule,
    NotificationsModule,
    BookingModule,
    PaymentModule,
    sessionsModule,
    productsModule,
    postsModule,
  ],
  providers: [JwtStrategy, JwtAuthGuard],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
