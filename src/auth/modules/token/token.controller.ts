import { Controller, Delete, Get, Param, ParseUUIDPipe, Post, Res, UseGuards } from '@nestjs/common';
import { TokenService } from './token.service';
import { CurrentUser } from 'src/current-user/current-user.decorator';
import { ExtractRefreshToken } from 'src/extract-refresh-token/extract-refresh-token.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CookieService } from '../cookie/cookie.service';
import { GetRefreshTokensIdResponseDto } from 'src/auth/dtos/response/get-tokens-id.dto';
import type { Response } from 'express';
import { IAuthtokens } from 'src/types/auth.types';

@Controller('token')
export class TokenController {
    constructor(
        private tokenService: TokenService,
        private cookieService: CookieService,
    ) { }
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async getSessions(
        @CurrentUser() user: { userId: string; tokenId: string },
    ): Promise<GetRefreshTokensIdResponseDto> {
        return new GetRefreshTokensIdResponseDto({ tokens: await this.tokenService.getAllTokens(user.userId) })
    }

    @Post('refresh')
    async getNewToken(
        @ExtractRefreshToken() refreshToken: string,
        @Res({ passthrough: true }) response: Response,
    ) {
        const tokens: IAuthtokens = await this.tokenService.refreshToken(refreshToken)
        await this.cookieService.setTokensCookie(response, tokens)
        return { message: 'Success' }
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async revokeSession(
        @Param('id', ParseUUIDPipe) id: string,
        @CurrentUser('userId') userId: string,
    ) {
        await this.tokenService.revokeTokenById(id, userId)
        return { message: "ok"}
    }
}
