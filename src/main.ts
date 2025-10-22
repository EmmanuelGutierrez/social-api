import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/exception/http-exception-filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            `'self'`,
            'data:',
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [
            `'self'`,
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    }),
  );
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.APP_ORIGIN || 'http://localhost:3000',
    credentials: true,
  });

  // CSRF solo si usás cookies y sesiones
  // app.use(
  //   csurf({
  //     cookie: { httpOnly: true, sameSite: 'strict', secure: false },
  //   }),
  // );

  const config: ConfigService = app.get(ConfigService);
  const port: number = config.get<number>('PORT') as number;
  // const redisIoAdapter = new RedisIoAdapter(app);
  // await redisIoAdapter.connectToRedis();
  // app.useWebSocketAdapter(redisIoAdapter);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  const configSwagger = new DocumentBuilder()
    .setTitle('Monotributo Recurrente')
    .setDescription('Monotributo API description')
    .setVersion('1.0')
    .setOpenAPIVersion('3.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api-doc', app, document);

  await app.listen(port || 4000);
  console.log(`🚀 Server running on http://localhost:${port}/graphql`);
}
void bootstrap();
