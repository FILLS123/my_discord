import { IsNotEmpty, MaxLength } from 'class-validator'

export class RefreshTokenRequestDto {
  @IsNotEmpty()
  @MaxLength(10000) // Безопасный предел для HTTP-заголовков
  refreshToken: string
}
