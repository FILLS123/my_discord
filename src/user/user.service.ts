import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma/prisma.service'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { generateTempUsername } from 'src/utils/auth.util'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async checkEmail(email?: string) {
    if (!email) return
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    })
    if (existingUser) {
      throw new BadRequestException({
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'User with this email is already exists',
      })
    }
    return true
  }

  async checkUsername(username?: string) {
    if (!username) return
    const existingUser = await this.prisma.user.findUnique({
      where: { username },
    })
    if (existingUser) {
      throw new BadRequestException({
        code: 'USERNAME_ALREADY_EXISTS',
        message: 'User with this username is already exists',
      })
    }
    return true
  }

  async findUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) {
      console.log('User not found', user)
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      })
    }
    return user
  }

  async findUserByUsername(username: string) {
    const user = await this.prisma.user.findUnique({ where: { username } })
    if (!user) {
      console.log('User not found', user)
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      })
    }
    return user
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      console.log('User not found', user)
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      })
    }
    return user
  }

  async create(data: CreateUserDto) {
    await this.checkEmail(data.email)

    if (!data.username) {
      data.username = await this.generateUniqueUsername()
    }
    await this.checkUsername(data.username)
    const userData = {
      ...data,
      usermame: data.username,
    }
    return this.prisma.user.create({
      data: {
        ...data,
        username: data.username,
      },
    })
  }
  async update(id: string, data: UpdateUserDto) {
    try {
      await this.checkEmail(data.email)
      await this.checkUsername(data.username)

      return await this.prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          username: true,
          updatedAt: true,
        },
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message: `User with ID ${id} not found`,
        })
      }
      throw error
    }
  }
  async delete(id: string) {
    return this.prisma.user.delete({ where: { id } })
  }

  async generateUniqueUsername(): Promise<string> {
    let username: string = await generateTempUsername()
    let exists = await this.prisma.user.findUnique({ where: { username } })

    // Генерируем до тех пор, пока не найдём свободный
    while (exists) {
      username = await generateTempUsername()
      exists = await this.prisma.user.findUnique({ where: { username } })
    }

    return username
  }
}
