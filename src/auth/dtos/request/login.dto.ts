import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator'

export class LoginRequestDto {
  @IsEmail() //{}, { message: 'Неверный формат email' }
  @IsNotEmpty()
  @MaxLength(100)
  email: string

  @MinLength(6)
  @IsNotEmpty()
  @MaxLength(32)
  password: string
}
