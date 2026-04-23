import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common'
import type { RedisClientType } from 'redis'
import { REDIS_CLIENT } from './redis.constants'

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly client: RedisClientType,
  ) {}

  async onModuleInit() {
    if (!this.client.isOpen) {
      await this.client.connect()
      this.logger.log('Redis connected')
    }
  }

  async onModuleDestroy() {
    if (this.client.isOpen) {
      await this.client.quit()
      this.logger.log('Redis disconnected')
    }
  }

  get redis(): RedisClientType {
    return this.client
  }

  async set(key: string, value: string, ttl?: number) {
    if (ttl) {
      await this.client.set(key, value, { EX: ttl })
    } else {
      await this.client.set(key, value)
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async del(key: string) {
    await this.client.del(key)
  }
}
