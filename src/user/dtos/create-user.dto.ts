// dto/update-user.dto.ts
import {
  IsEmail,
  IsNotEmpty,
  MaxLength,
  MinLength,
  IsOptional,
} from 'class-validator'

export class CreateUserDto {
  @IsEmail() //{}, { message: 'Неверный формат email' }
  @IsNotEmpty()
  @MaxLength(100)
  email: string

  @MinLength(4) //, { message: 'Пароль слишком короткий' }
  @IsOptional()
  @MaxLength(12)
  @IsNotEmpty()
  username?: string

  @MinLength(6)
  @IsNotEmpty()
  @MaxLength(32)
  password: string
}
