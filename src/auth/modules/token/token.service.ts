import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'
import { Prisma } from '@prisma/client'
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt'
import { LoginResponseDto } from 'src/auth/dtos/response/login.dto';
import { addMinutes } from 'date-fns'
import { StringValue } from 'ms'
import { RefreshTokenRequestDto } from 'src/auth/dtos/request/refresh-token.dto';
import { IAuthtokens } from 'src/types/auth.types';

@Injectable()
export class TokenService {
    constructor(
        private prismaService: PrismaService,
        private configService: ConfigService,
        private jwtService: JwtService,
    ) { }

    private async getJWTTokensLifeTime() {
        const accessTokenLifeTime: string | undefined = this.configService.get<string>(
            'JWT_ACCESS_EXPIRES_IN',
        ) // minutes
        const refreshTokenLifeTime: string | undefined = this.configService.get<string>(
            'JWT_REFRESH_EXPIRES_IN',
        ) // minutes

        if (!accessTokenLifeTime || !refreshTokenLifeTime) {
            throw Error('JWT tokens lifetime not found in .env')
        }

        return {
            accessToken: Number(accessTokenLifeTime),
            refreshToken: Number(refreshTokenLifeTime),
        }
    }
    async getTokens(
        userId: string,
        email: string,
        transaction: Prisma.TransactionClient = this.prismaService,
    ): Promise<LoginResponseDto> {
        // Есть нюанс, аргумент transaction создан для вызова функции getTokens внустри транзакциии Prisma (контекст транзакции передаётся через аргумент, но при обычном использовании функции контекста нет и по дефолту стоит this.prismaService)
        const tokenid = crypto.randomUUID() // UID refresh токена, который мы записываем в payload access token'а

        const payload = { tokenid, sub: userId, email: email }
        const Refreshpayload = { tokenType: "refresh", tokenid, sub: userId, email: email }

        const refreshTokenSecret =
            this.configService.get<string>('JWT_REFRESH_SECRET')

        if (refreshTokenSecret === undefined) {
            // Check secret
            throw Error('JWT refresh secret not found in .env')
        }

        const JWTTokensLifeTime = await this.getJWTTokensLifeTime()

        const refreshToken = await this.jwtService.signAsync(Refreshpayload, {
            secret: refreshTokenSecret,
            expiresIn: JWTTokensLifeTime.refreshToken + "m" as StringValue,
        })
        const accessToken = await this.jwtService.signAsync(payload, {
            expiresIn: JWTTokensLifeTime.accessToken + "m" as StringValue,
        })

        const tokenData: Prisma.RefreshTokenCreateInput = {
            id: tokenid,
            token: refreshToken,
            user: {
                connect: { id: userId },
            },
            expiresAt: addMinutes(new Date(), JWTTokensLifeTime.refreshToken),
        }

        await transaction.refreshToken.create({ data: tokenData })

        return { accessToken, refreshToken }
    }
    async getAllTokens(
        userId: string,
    ): Promise<
        Prisma.Result<
            Prisma.RefreshTokenDelegate,
            { select: { id: true; createdAt: true } },
            'findMany'
        >
    > {
        const tokens = await this.prismaService.refreshToken.findMany({
            where: { userId },
            select: {
                id: true,
                createdAt: true,
            },
        })

        return tokens
    }

    async revokeToken(data: RefreshTokenRequestDto): Promise<string> {
        const tokenRecord = await this.prismaService.refreshToken.findUnique({
            where: { token: data.refreshToken },
        })

        if (!tokenRecord) {
            throw new UnauthorizedException({
                code: 'INVALID_TOKEN',
                message: 'Refresh token is invalid or expired',
            })
        }

        await this.prismaService.refreshToken.delete({
            where: { id: tokenRecord.id },
        })
        return 'ok'
    }

    async revokeTokenById(tokenId: string, userId): Promise<string> {
        const tokenRecord = await this.prismaService.refreshToken.findUnique({
            where: { id: tokenId, userId },
        })

        if (!tokenRecord) {
            throw new UnauthorizedException({
                code: 'INVALID_TOKEN',
                message: 'Refresh token is invalid or expired',
            })
        }

        await this.prismaService.refreshToken.delete({ where: { id: tokenId } })
        return 'ok'
    }
    async refreshToken(
        refreshToken: string
      ): Promise<IAuthtokens> {
        const tokenRecord = await this.prismaService.refreshToken.findUnique({
          where: { token: refreshToken },
          include: { user: true }, // Сразу берем пользователя
        })
        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
    
          // Если токен найден и просрочен, удаляем его (если он был)
          if (tokenRecord) {
            await this.prismaService.refreshToken.delete({
              where: { id: tokenRecord.id },
            })
          }
          throw new UnauthorizedException({
            code: 'INVALID_TOKEN',
            message: 'Refresh token is invalid or expired',
          })
        }
    
        return this.prismaService.$transaction(async (tx) => {
          await tx.refreshToken.delete({ where: { id: tokenRecord.id } })
    
          const user = tokenRecord.user
    
          const tokens = await this.getTokens(user.id, user.email, tx)
    
          return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          }
        })
      }
}
