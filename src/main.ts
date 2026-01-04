import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
// import * as csurf from 'csurf';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/exception/http-exception-filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
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

  const allowedOrigins = [
    process.env.FRONT_URL,
    'http://localhost:3000',
    'http://localhost:3001',
  ];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (error: Error | null, result?: boolean) => void,
    ) => {
      console.log('ORIGIN', origin);
      if (!origin) {
        return callback(null, true);
      }
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.ngrok-free.app')
      ) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
    ],
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
  //!!  {'Apollo-Require-Preflight': 'true'}}
  app.use(graphqlUploadExpress({ maxFileSize: 2 * 1000 * 1000 }));
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
  console.log(`🚀 Server GRAPHQL running on ${await app.getUrl()}/graphql`);
  console.log(`🚀 Server running on ${await app.getUrl()}`);
}
void bootstrap();
