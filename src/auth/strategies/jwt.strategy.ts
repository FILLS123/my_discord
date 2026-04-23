import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import type { Request } from 'express'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const JWT_ACCESS_SECRET = configService.get<string>('JWT_ACCESS_SECRET')

    if (!JWT_ACCESS_SECRET) {
      throw Error('JWT secret not found in .env')
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          // Извлекаем токен из куки под названием 'jwt'
          return request?.cookies?.['access_token']
        },
      ]),
      ignoreExpiration: false,
      session: false,
      secretOrKey: JWT_ACCESS_SECRET,
    })
  }

  async validate(payload: any) {
    const tokenExists = await this.prisma.refreshToken.findUnique({
      where: { id: payload.tokenid },
    })

    if (!tokenExists) {
      throw new UnauthorizedException('Token has been revoked')
    }

    return { userId: payload.sub, email: payload.email }
  }
}
