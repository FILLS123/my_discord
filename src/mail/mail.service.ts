import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmationOTP(user: { email: string }, otp_code: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Добро пожаловать!',
      template: './email-confirm', // путь относительно папки dir, указанной в конфиге
      context: {
        authCode: otp_code, // Если используете цифровой код
      },
    })
  }
}
