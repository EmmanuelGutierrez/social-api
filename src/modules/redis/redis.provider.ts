import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const RedisProvider = {
  provide: 'REDIS',
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    console.log('redisprovider');
    const client = new Redis({
      host: configService.get<string>('config.redis.host') as string,
      port: configService.get<number>('config.redis.port') as number,
      db: configService.get<number>('config.redis.db') as number,
      password: configService.get<string>('config.redis.password') as string,
    });
    await client.config('SET', 'notify-keyspace-events', 'Ex').then();
    return client;
  },
};
