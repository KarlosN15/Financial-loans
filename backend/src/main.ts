import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validaciones globales
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS habilitado para Vercel, localhost y dominios de producción
  app.enableCors({
    origin: (origin, callback) => {
      // Refleja el origen de la solicitud para admitir credentials: true en Vercel y localhost
      callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With',
    credentials: true,
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();