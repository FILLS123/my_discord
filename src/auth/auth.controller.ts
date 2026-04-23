import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common'
import type { Response } from 'express'
import { AuthService } from './auth.service'
import { RegisterRequestDto } from './dtos/request/register.dto'
import { LoginRequestDto } from './dtos/request/login.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { VerifyOTPRequestDto } from './dtos/request/verify-otp.dto'
import { AuthInitResponseDto } from './dtos/response/auth-init.dto'
import { IAuthtokens } from 'src/types/auth.types'
import { CookieService } from './modules/cookie/cookie.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private cookieService: CookieService,
  ) { }

  @Post('login')
  async getLogin(@Body() data: LoginRequestDto): Promise<AuthInitResponseDto> {
    return new AuthInitResponseDto(await this.authService.login(data))
  }
  @Post('register')
  async getRegister(
    @Body() data: RegisterRequestDto,
  ): Promise<AuthInitResponseDto> {
    return new AuthInitResponseDto(await this.authService.register(data))
  }

  @Post('login/confirm')
  async confirmLogin(
    @Body() data: VerifyOTPRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens: IAuthtokens = await this.authService.confirmLogin(data)

    await this.cookieService.setTokensCookie(response, tokens)

    return { message: 'Success' }
  }
  @Post('register/confirm')
  async confirmRegister(
    @Body() data: VerifyOTPRequestDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens: IAuthtokens = await this.authService.confirmRegister(data)

    await this.cookieService.setTokensCookie(response, tokens)

    return { message: 'Success' }
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('access_token')
    response.clearCookie('refresh_token')
    return { message: 'Logged out' }
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  async getProtected() {
    return { message: 'ok' }
  }
}
