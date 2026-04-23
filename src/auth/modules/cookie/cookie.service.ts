import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { IAuthtokens } from 'src/types/auth.types';

@Injectable()
export class CookieService {
      constructor(
        private configService: ConfigService,
      ) { }
    
      async getCookieLifeTime() {
        const accessTokenLifeTime = this.configService.get<string>(
          'JWT_ACCESS_EXPIRES_IN',
        )
        const refreshTokenLifeTime = this.configService.get<string>(
          'JWT_REFRESH_EXPIRES_IN',
        )
    
        if (!accessTokenLifeTime || !refreshTokenLifeTime) {
          throw Error('JWT tokens lifetime not found in .env')
        }
    
        return {
          accessToken: Number(accessTokenLifeTime) * 60 * 1000,
          refreshToken: Number(refreshTokenLifeTime) * 60 * 1000,
        }
      }
    
      async setTokensCookie(response: Response, data: IAuthtokens) {
        try {
          const tokensLifetime = await this.getCookieLifeTime()
    
          response.cookie('access_token', data.accessToken, {
            httpOnly: true, // Защита от кражи через JS (XSS)
            secure: false, // true Только для HTTPS (в 2026 это стандарт)
            sameSite: 'strict', // Защита от CSRF
            maxAge: tokensLifetime.accessToken, // 1 час
          })
          response.cookie('refresh_token', data.refreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict',
            maxAge: tokensLifetime.refreshToken,
          })
        } catch(error) {
          throw Error(error)
        }
        
      }
}
