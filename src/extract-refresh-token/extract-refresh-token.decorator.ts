import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common'

export const ExtractRefreshToken = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest()
    const token: string = request.cookies?.refresh_token
    
    if (!token) {
      // Выбрасываем ошибку прямо здесь — сервис даже не будет вызван
      throw new UnauthorizedException({
        code: 'REFRESH_TOKEN_MISSING',
        message: 'Refresh token missing',
      })
    }
    return token
  },
)
