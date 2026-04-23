import { DynamicModule, Global, Module, Provider } from '@nestjs/common'
import { createClient } from 'redis'
import { REDIS_CLIENT } from './redis.constants'
import { RedisModuleAsyncOptions, RedisModuleOptions } from './redis.interfaces'
import { RedisService } from './redis.service'

@Global()
@Module({})
export class RedisModule {
  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const redisProvider: Provider = {
      provide: REDIS_CLIENT,
      useFactory: async (...args: any[]) => {
        const config: RedisModuleOptions = await options.useFactory(...args)

        const client = createClient(config)

        client.on('error', (err) => {
          console.error('Redis Client Error', err)
        })

        return client
      },
      inject: options.inject || [],
    }

    return {
      module: RedisModule,
      providers: [redisProvider, RedisService],
      exports: [RedisService],
    }
  }
}
