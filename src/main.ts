import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MongoClient } from 'mongodb';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const uri = process.env.MONGO_DB_URL;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Conectado ao MongoDB!');

    const db = client.db(); // Get a reference to the database
    const result = await db.command({ ping: 1 }); // Send a ping command to the database
    console.log('Teste de conexão bem-sucedido:', result);

    await app.listen(process.env.PORT);
    console.log(`Aplicação iniciada na porta ${process.env.PORT}`);
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB', error);
  }
}

bootstrap();
