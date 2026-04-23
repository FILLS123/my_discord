import { IsUUID, Length } from 'class-validator'

export class RevokeTokenRequestDto {
  @IsUUID('4')
  @Length(36, 36)
  tokenId: string
}
