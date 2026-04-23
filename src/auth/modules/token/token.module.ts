import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenController } from './token.controller';
import { CookieModule } from '../cookie/cookie.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const jwtSecret = config.get<string>('JWT_ACCESS_SECRET')

        if (jwtSecret === undefined) {
          // Check secret
          throw Error('JWT access secret not found')
        }

        const jwtExpiresIn = config.get<string>('JWT_ACCESS_EXPIRES_IN') || 5

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: Number(jwtExpiresIn),
          },
        }
      },
    }),
    CookieModule,
  ],
  providers: [TokenService],
  exports: [TokenService, JwtModule],
  controllers: [TokenController]
})
export class TokenModule { }
