import { LoginRequestDto } from 'src/auth/dtos/request/login.dto'
import { OtpAction } from './auth.types'

export interface IPendingLogin {
  otp: string
  payload: {
    data: LoginRequestDto,
    action: OtpAction
  }
  requestId: string
}

export interface IPendingUsername {
  payload: {
    userId: string
  }
  requestId: string
}
