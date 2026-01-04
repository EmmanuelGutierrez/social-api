import { ConfigType, registerAs } from '@nestjs/config';

export const config = registerAs('config', () => {
  return {
    api: {
      port: process.env.PORT,
      jwtSecret: process.env.JWT_SECRET,
      wsJwtSecret: process.env.WS_JWT_SECRET,
      apiKey: process.env.API_KEY,
      env: process.env.API_ENV,
      frontUrl: process.env.FRONT_URL,
    },
    database: {
      dbName: process.env.DATABASE_NAME,
      dbPort: process.env.DATABASE_PORT,
      dbUser: process.env.DATABASE_USER,
      dbPass: process.env.DATABASE_PASS,
      dbHost: process.env.DATABASE_HOST,
      dbConnection: process.env.DATABASE_CONNECTION,
    },
    redis: {
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
      port: Number(process.env.REDIS_PORT),
      db: Number(process.env.REDIS_DB),
      username: process.env.REDIS_USERNAME,
    },
    cloudinary: {
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    },
    mercadopago: {
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY,
    },
  };
});

export type configType = ConfigType<typeof config>;
