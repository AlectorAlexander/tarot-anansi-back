import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/main.module';
import 'dotenv/config';
import * as mongoose from 'mongoose';

async function bootstrap() {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL, {
    });
    console.log('Database connection established!');

    const app = await NestFactory.create(AppModule);
    await app.listen(process.env.PORT);
    console.log(`Application started on port ${process.env.PORT}`);
  } catch (error) {
    console.error('Error while starting the application', error);
  }
}

bootstrap();
