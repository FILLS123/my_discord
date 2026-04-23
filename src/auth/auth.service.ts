import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { UserService } from 'src/user/user.service'
import { RegisterRequestDto } from './dtos/request/register.dto'
import { LoginRequestDto } from './dtos/request/login.dto'
import { MailService } from 'src/mail/mail.service'
import { RedisService } from 'src/redis/redis.service'
import {
  comparePassword,
  getPasswordHash,
  verifyOtp,
} from 'src/utils/auth.util'
import { VerifyOTPRequestDto } from './dtos/request/verify-otp.dto'
import {
  IPendingLogin,
} from 'src/types/redis.types'
import { AuthInitResponseDto } from './dtos/response/auth-init.dto'
import { IAuthtokens, OtpAction } from 'src/types/auth.types'
import { TokenService } from './modules/token/token.service'
import { OtpService } from './modules/otp/otp.service'

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private mailService: MailService,
    private readonly redisService: RedisService,
    private tokenService: TokenService,
    private otpService: OtpService,
  ) { }

  async register(data: RegisterRequestDto): Promise<AuthInitResponseDto> {
    await this.userService.checkEmail(data.email)

    const hashedPassword = await getPasswordHash(data.password)
    data.password = hashedPassword

    return await this.otpService.requestTwoFactorCode(data, OtpAction.REGISTER)
  }

  async login(data: LoginRequestDto): Promise<AuthInitResponseDto> {
    try {
      const user = await this.userService.findUserByEmail(data.email)

      await comparePassword(data.password, user.password)

      data.password = user.password

      return await this.otpService.requestTwoFactorCode(data, OtpAction.LOGIN)
    } catch {
      throw new BadRequestException({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      })
    }
  }



  async confirmRegister(data: VerifyOTPRequestDto): Promise<IAuthtokens> {
    const rawData = await this.redisService.get(
      `pending:login:${data.requestId}`,
    )

    if (!rawData) {
      throw new NotFoundException({
        code: 'REGISTER_REQUEST_INVALID',
        message: 'Registration request expired or not found',
      })
    }

    const parsedData: IPendingLogin = JSON.parse(rawData)
    if (parsedData.payload.action != OtpAction.REGISTER) {
      throw new BadRequestException({
        code: 'INVALID_AUTH_ACTION',
        message: 'This OTP is not for registration',
      })
    }
    await verifyOtp(data.otp_code, parsedData.otp)

    const user = await this.userService.create({ email: parsedData.payload.data.email, password: parsedData.payload.data.password })

    await this.redisService.del(`pending:register:${data.requestId}`)

    return await this.tokenService.getTokens(user.id, user.email)
  }
  async confirmLogin(data: VerifyOTPRequestDto): Promise<IAuthtokens> {
    const rawData = await this.redisService.get(
      `pending:login:${data.requestId}`,
    )

    if (!rawData) {
      throw new NotFoundException({
        code: 'REGISTER_REQUEST_INVALID',
        message: 'Registration request expired or not found',
      })
    }

    const parsedData: IPendingLogin = JSON.parse(rawData)
    if (parsedData.payload.action != OtpAction.LOGIN) {
      throw new BadRequestException({
        code: 'INVALID_AUTH_ACTION',
        message: 'This OTP is not for login',
      })
    }
    await verifyOtp(data.otp_code, parsedData.otp)

    const user = await this.userService.findUserByEmail(
      parsedData.payload.data.email,
    )

    await this.redisService.del(`pending:login:${data.requestId}`)

    return await this.tokenService.getTokens(user.id, user.email)
  }
}
