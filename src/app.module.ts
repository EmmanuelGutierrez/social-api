import { Module, UnauthorizedException } from '@nestjs/common';
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
import { PostModule } from './modules/post/post.module';
import { FileModule } from './modules/file/file.module';
import { RedisPubSubModule } from './modules/redis-pub-sub/redis-pub-sub.module';
import { AuthService } from './modules/auth/auth.service';
import { contextGraphqlWs } from './common/interfaces/context-graphql-ws';
import { toLowerCaseKeys } from './common/utils/toLowerCaseKeys';
import { CloudinaryModule } from './modules/file/cloudinary/cloudinary.module';
@Module({
  imports: [
    // MongooseModule.forRoot(
    //   process.env.MONGO_URI || 'mongodb://localhost/testdb',
    // ),
    DatabaseModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [AuthModule],
      inject: [AuthService],
      useFactory: async (authService: AuthService) => {
        return {
          subscriptions: {
            'graphql-ws': {
              onConnect: (ctx: contextGraphqlWs) => {
                const { extra, connectionParams } = ctx;
                const AuthorizationObj: { authorization?: string } =
                  toLowerCaseKeys(connectionParams);
                if (!AuthorizationObj.authorization) {
                  throw new UnauthorizedException('No token auth');
                }
                const tokenData = authService.decodeToken(
                  connectionParams.Authorization as string,
                );
                if (!tokenData) {
                  throw new UnauthorizedException('No user');
                }
                extra.user = tokenData;
                // jwtService.decode(ctx.connectionParams.Authorization as string);
              },
            },
          },
          autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
          playground: false,
          // buildSchemaOptions: {
          //   scalarsMap:[{type:}]
          // },
          plugins: [ApolloServerPluginLandingPageLocalDefault()],
          installSubscriptionHandlers: true,
          context: ({ req, res, extra }) => {
            return { req, res, extra };
          },
        };
      },
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
        WS_JWT_SECRET: Joi.string().required(),
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
    PostModule,
    FileModule,
    RedisPubSubModule,
    CloudinaryModule,
  ],
})
export class AppModule {}
