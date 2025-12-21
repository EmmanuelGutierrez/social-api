import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Redis, RedisKey } from 'ioredis';
import Redlock, { Lock } from 'redlock';

@Injectable()
export class RedisService implements OnModuleDestroy, OnModuleInit {
  constructor(
    @Inject('REDIS')
    private readonly redisProvider: Redis,
  ) {}
  // private client: Redis;
  private suscriber: Redis;
  private redlock: Redlock;
  onModuleInit() {
    // this.redisProvider = new Redis({
    //   host: this.configService.redis.host,
    //   port: this.configService.redis.port,
    //   db: this.configService.redis.db,
    //   password: this.configService.redis.password,
    // });
    this.suscriber = this.redisProvider.duplicate();
    this.redlock = new Redlock([this.redisProvider], {
      retryCount: 5,
      retryDelay: 200,
    });

    // await this.suscriber.psubscribe('__keyevent@1__:expired', (err, count) =>
    //   console.log('key expired', err, count),
    // );

    this.redisProvider.on('connect', () => console.log('Redis connect'));
    this.redisProvider.on('error', () => console.log('Redis error'));
  }

  async onModuleDestroy() {
    await this.redisProvider?.quit();
  }

  async handleSeatExpiration(key: string) {
    // Ejemplo: screening:123💺A:5
    const [prefix, screeningId] = key.split(':');

    const setKey = `${prefix}:${screeningId}:reserved_keys`;
    await this.redisProvider.srem(setKey, key);

    // También podrías emitir eventos vía socket, logs, etc.
    console.log(`Seat eliminado del set: ${key}`);
  }

  getClient() {
    return this.redisProvider;
  }

  getSuscriber() {
    console.log('getSuscriber', this.suscriber);
    return this.suscriber;
  }
  getRedlock() {
    return this.redlock;
  }
  async set<T>(key: string, value: T, ttlInSeconds?: number) {
    const stringValue = JSON.stringify(value);
    if (ttlInSeconds) {
      return await this.redisProvider.set(
        key,
        stringValue,
        'EX',
        ttlInSeconds,
        'NX',
      );
    } else {
      return await this.redisProvider.set(key, stringValue);
    }
  }

  async sadd<T>(key: string, value: T, ttlInSeconds?: number) {
    const stringValue = JSON.stringify(value);
    if (ttlInSeconds) {
      return await this.redisProvider.sadd(
        key,
        stringValue,
        'EX',
        ttlInSeconds,
      );
    } else {
      return await this.redisProvider.sadd(key, stringValue);
    }
  }

  async mget<T>(keys: RedisKey[]) {
    if (!keys.length) return [];
    const values = await this.redisProvider.mget(keys);
    const returnValues: T[] = [];
    values.forEach((value) => {
      if (value) {
        returnValues.push(JSON.parse(value) as T);
      }
    });
    return returnValues;
  }

  async del(...keys: string[]) {
    const values = await this.redisProvider.del(keys);

    return values;
  }

  async smembers<T>(key: string) {
    const values = await this.redisProvider.smembers(key);
    return values.map((value) => JSON.parse(value) as T);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisProvider.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async exist(key: string) {
    const result = await this.redisProvider.exists(key);
    return result === 1;
  }

  async acquireLock(resource: string, ttl = 5000) {
    return this.redlock.acquire([`lock:${resource}`], ttl);
  }

  async releaseLock(lock: Lock) {
    return await lock.release();
  }

  async withLock<T>(resource: string, ttl: number, callback: () => Promise<T>) {
    const lock = await this.acquireLock(resource, ttl);
    try {
      return await callback();
    } catch (error) {
      console.log('error', error);
      await this.releaseLock(lock);
    }
  }

  async increment(key: string) {
    return await this.redisProvider.incr(key);
  }

  async decrement(key: string) {
    return await this.redisProvider.decr(key);
  }
}
