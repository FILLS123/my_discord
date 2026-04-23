import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/current-user/current-user.decorator';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserResponseDto } from './dtos/response/get-user-info.dto';

@Controller('user')
export class UserController {
    constructor (
        private userService: UserService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get('/')
    async getUserInfo(@CurrentUser() user: { userId: string }): Promise<UserResponseDto> {
        return new UserResponseDto(await this.userService.findUserById(user.userId))
    }
}
