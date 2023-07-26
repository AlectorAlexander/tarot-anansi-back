import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { LoggerMiddleware } from './users/service/jwt-middleware-consume';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_DB_URL, {
      autoCreate: true,
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          console.log('Database connection established!');
        });
        return connection;
      }
    }),
    UsersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
