import { NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import cookieParser from 'cookie-parser'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Включает class-transformer для входящих DTO
      whitelist: true,
    }),
  )

  const configService = app.get(ConfigService);

  app.use(cookieParser(await configService.get('COOKIE_SECRET')));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector), {
    strategy: 'excludeAll'
  }));

  app.enableCors({
    origin: (configService.get<string>('CLIENT_URL') ?? '').split(','),
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('OVC')
    .setDescription('Open Voice Chat')
    .setVersion('1.0')
    .addServer('/api')
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
