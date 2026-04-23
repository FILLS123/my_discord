import { IsString, IsUUID, Length, Matches } from 'class-validator'

export class VerifyOTPRequestDto {
  @IsUUID('4')
  requestId: string

  @IsString()
  @Length(6, 6, { message: 'OTP code must be exactly 6 digits' })
  @Matches(/^[0-9]+$/, { message: 'OTP code must contain only digits' })
  otp_code: string
}
