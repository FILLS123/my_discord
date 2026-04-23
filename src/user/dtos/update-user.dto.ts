// dto/update-user.dto.ts
import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  email?: string

  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(32)
  username?: string

  // Пароль обновляется через отдельный метод,
}
