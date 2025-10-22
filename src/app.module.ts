import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ThrottlerModule } from '@nestjs/throttler';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/mongo.database';
import * as Joi from 'joi';
import { ConfigModule } from '@nestjs/config';
import { getEnvPath } from './common/utils/env.helper';
import { config } from './common/config/config';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
@Module({
  imports: [
    // MongooseModule.forRoot(
    //   process.env.MONGO_URI || 'mongodb://localhost/testdb',
    // ),
    DatabaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req, res, extra }) => ({ req, res, extra }),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      // cors: false, // ya lo maneja main.ts
    }),
    ConfigModule.forRoot({
      envFilePath: getEnvPath(`${__dirname}/common/envs`),
      load: [config],
      isGlobal: true,
      validationSchema: Joi.object().keys({
        // API_ENV: Joi.string().default('dev'),
        PORT: Joi.number().default(3000),
        API_KEY: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASS: Joi.string().required(),
        DATABASE_CONNECTION: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_DB: Joi.number().required(),
        REDIS_PASSWORD: Joi.string(),
        CLOUDINARY_API_KEY: Joi.string().required(),
        CLOUDINARY_API_SECRET: Joi.string().required(),
        CLOUDINARY_CLOUD_NAME: Joi.string().required(),
      }),
    }),
    ThrottlerModule.forRoot({ throttlers: [{ ttl: 60, limit: 20 }] }),
    AuthModule,
    UserModule,
  ],
})
export class AppModule {}
