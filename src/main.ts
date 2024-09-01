import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './prisma-client-exception/prisma-client-exception.filter';
import { constant } from './constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // DTO Validation
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: '*',
  });

  // Prisma Exception / Error handling
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  await app.listen(3001);
}
bootstrap();
