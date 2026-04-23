import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator'

export class RegisterRequestDto {
  @IsEmail() //{}, { message: 'Неверный формат email' }
  @IsNotEmpty()
  @MaxLength(100)
  email: string

  //@MinLength(4) //, { message: 'Пароль слишком короткий' }
  //@MaxLength(12)
  //@IsNotEmpty()
  //username: string;

  @MinLength(6)
  @IsNotEmpty()
  @MaxLength(32)
  password: string
}
