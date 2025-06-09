import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { KafkaConfig } from 'kafkajs';
import { KafkaHelper } from './model/entities/kafka';
import * as dotenv from 'dotenv';

dotenv.config();

const kafkaConfig: KafkaConfig = {clientId: 'immunify', brokers: ['localhost:7000']};
const kafkaHelper = new KafkaHelper(kafkaConfig);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
