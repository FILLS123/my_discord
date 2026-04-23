import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginRequestDto } from 'src/auth/dtos/request/login.dto';
import { RegisterRequestDto } from 'src/auth/dtos/request/register.dto';
import { VerifyOTPRequestDto } from 'src/auth/dtos/request/verify-otp.dto';
import { AuthInitResponseDto } from 'src/auth/dtos/response/auth-init.dto';
import { MailService } from 'src/mail/mail.service';
import { RedisService } from 'src/redis/redis.service';
import { OtpAction } from 'src/types/auth.types';
import { IPendingLogin } from 'src/types/redis.types';
import { generateOtp, generateUUID, getOtpHash } from 'src/utils/auth.util';

@Injectable()
export class OtpService {
    constructor(
        private mailService: MailService,
        private readonly redisService: RedisService,
    ) { }
    async requestTwoFactorCode(
        data: LoginRequestDto,
        action: OtpAction,
    ): Promise<AuthInitResponseDto> {
        const emailKey = `otp_limit:${data.email}`;

        const isRateLimited = await this.redisService.get(emailKey);
        if (isRateLimited) {
            throw new HttpException(
                {
                    code: 'TOO_MANY_ATTEMPTS',
                    message: 'Wait before next attempt',
                },
                HttpStatus.TOO_MANY_REQUESTS,
            )
        }
        const otp: string = await generateOtp()
        const otpHash = await getOtpHash(otp)
        const pendingData: IPendingLogin = {
            otp: otpHash,
            payload: { data, action },
            requestId: await generateUUID(),
        }
        const expiresInSeconds = 300
        const expiresAt = Date.now() + expiresInSeconds * 1000

        await this.redisService.set(
            `pending:login:${pendingData.requestId}`,
            JSON.stringify(pendingData),
            expiresInSeconds,
        )

        await this.redisService.set(emailKey, 'blocked', 60);

        await this.mailService.sendUserConfirmationOTP({ email: data.email }, otp)

        return {
            message: 'OTP was sent',
            requestId: pendingData.requestId,
            expiresAt,
        }
    }
}
