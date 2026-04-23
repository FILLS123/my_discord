import { randomInt, randomUUID } from 'crypto'
import * as argon2 from 'argon2';
import { UnauthorizedException } from '@nestjs/common'

export async function generateOtp(length: number = 6): Promise<string> {
  let otp = ''
  for (let i = 0; i < length; i++) {
    otp += randomInt(0, 10).toString()
  }
  return otp
}

export async function getOtpHash(code: string): Promise<string> {
  const hashedCode = await argon2.hash(code);
  return hashedCode
}

export async function verifyOtp(code: string, codeHash: string) {
  const isPasswordValid = await argon2.verify(codeHash, code);
  if (!isPasswordValid) {
    throw new UnauthorizedException({
      code: 'INVALID_OTP_CODE',
      message: 'Invalid OTP code',
    })
  }
}


export async function getPasswordHash(password: string) {
  const hashedPassword = await argon2.hash(password);
  return hashedPassword
}

export async function comparePassword(password: string, passwordHash: string) {
  const isPasswordValid = await argon2.verify(passwordHash, password);
  if (!isPasswordValid) {
    throw new UnauthorizedException('Invalid email or password')
  }
}

export async function generateUUID(): Promise<string> {
  return randomUUID()
}

export async function generateTempUsername() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let randomPart = ''
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `user${randomPart}`
}
