import { Expose } from 'class-transformer'

export class AuthInitResponseDto {
  @Expose()
  message: string

  @Expose()
  requestId: string

  @Expose()
  expiresAt: number

  constructor(partial: Partial<AuthInitResponseDto>) {
    Object.assign(this, partial);
  }
}