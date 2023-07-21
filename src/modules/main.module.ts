// main.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';

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
export class AppModule {}
