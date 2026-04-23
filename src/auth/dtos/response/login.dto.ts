import { Expose } from 'class-transformer'

export class LoginResponseDto {
  @Expose()
  accessToken: string

  @Expose()
  refreshToken: string

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}
