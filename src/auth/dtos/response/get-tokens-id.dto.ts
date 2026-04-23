import { Expose, Type } from 'class-transformer'

export class TokenInfoDto {
  @Expose()
  id: string

  @Expose()
  createdAt: Date
}

export class GetRefreshTokensIdResponseDto {
  @Expose()
  @Type(() => TokenInfoDto)
  tokens: TokenInfoDto[]

  constructor(partial: Partial<GetRefreshTokensIdResponseDto>) {
    Object.assign(this, partial);
  }
}
