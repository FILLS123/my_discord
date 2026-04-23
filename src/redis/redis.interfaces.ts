import { RedisClientOptions } from 'redis'

export interface RedisModuleOptions extends RedisClientOptions {}

export interface RedisModuleAsyncOptions {
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions
  inject?: any[]
}
