import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  try {
    await app.listen(process.env.PORT);
    console.log(`Aplicação iniciada na porta ${process.env.PORT}`);
  } catch (error) {
    console.error('Erro ao iniciar a aplicação', error);
  }
}

bootstrap();
