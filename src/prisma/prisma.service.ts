import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import * as dotenv from 'dotenv'
dotenv.config()

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name)
  constructor() {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    // 2. Создаем адаптер для Prisma
    const adapter = new PrismaPg(pool)

    // 3. Передаем адаптер в базовый класс
    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Prisma connected')
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
