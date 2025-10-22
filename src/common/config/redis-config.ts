import { Inject, Injectable } from '@nestjs/common';
import { config, configType } from './config';

@Injectable()
export class RedisConfigService {
  constructor(
    @Inject(config.KEY)
    private readonly configService: configType,
  ) {}

  getRedisUrl(): string {
    const password = this.configService.redis.password;
    const host = this.configService.redis.host;
    const port = this.configService.redis.port;
    const auth = password ? `:${password}@` : '';
    return `redis://${auth}${host}:${port};`;
  }

  getRedisDb(): number {
    return this.configService.redis.db ?? parseInt('0');
  }

  getRedisFullUrlWithDb(): string {
    return `${this.getRedisUrl()}/${this.getRedisDb()}`;
  }

  getHost() {
    return this.configService.redis.host;
  }

  getPort(): number {
    return this.configService.redis.port || parseInt('6379');
  }

  getPassword(): string {
    return this.configService.redis.password || '';
  }
}
