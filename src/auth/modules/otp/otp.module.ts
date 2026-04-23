import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { MailModule } from 'src/mail/mail.module';
import { RedisModule } from 'src/redis/redis.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        url: config.get('REDIS_URL'),
      }),
    }),
    MailModule,
  ],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule { }
