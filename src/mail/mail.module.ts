import { Module } from '@nestjs/common'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { ConfigService } from '@nestjs/config'
import { MailService } from './mail.service'
import { join } from 'path'

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [], // Импортируем ConfigModule(но сейчас он глобальный)
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_HOST', 'gmail-smtp-msa.l.google.com'),
          port: config.get<number>('MAIL_PORT', 465),
          secure: false,
          auth: {
            user: config.get<string>('MAIL_ACCOUNT_USERNAME'),
            pass: config.get<string>('MAIL_ACCOUNT_PASSWORD'),
          },
          tls: {
            // Это игнорирует проблемы с сертификатами на Windows/VPN
            rejectUnauthorized: false,
            minVersion: 'TLSv1.2'
          }
        },
        defaults: {
          from: `"No Reply" <${config.get<string>('MAIL_FROM')}>`,
        },
        template: {
          dir: join(__dirname, 'templates'), // Путь к папке с .hbs файлами
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService], // Внедряем ConfigService
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule { }
