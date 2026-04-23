import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PassportModule } from '@nestjs/passport'
import { JwtStrategy } from './strategies/jwt.strategy'
import { UserModule } from 'src/user/user.module'
import { MailModule } from 'src/mail/mail.module'
import { RedisModule } from 'src/redis/redis.module'
import { OtpModule } from './modules/otp/otp.module';
import { TokenModule } from './modules/token/token.module';
import { TokenService } from './modules/token/token.service'
import { CookieModule } from './modules/cookie/cookie.module'

@Module({
  imports: [
    MailModule,
    UserModule,
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        url: config.get('REDIS_URL'),
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TokenModule,
    OtpModule,
    CookieModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthService, TokenService],
})
export class AuthModule {}
