import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import * as argon from 'argon2';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        password: false,
      },
    });
    if (users) return users;
    else return [];
  }

  async getUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        username: true,
        password: false,
      },
    });
    if (user) return user;
    else {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  }

  async createUser(dto: CreateUserDto) {
    const hash = await argon.hash(dto.password);
    try {
      await this.prisma.user.create({ data: { ...dto, password: hash } });
      return { message: 'New User Created' };
    } catch (err) {
      if (err.code === 'P2002') {
        throw new HttpException('Email Already in Use', HttpStatus.CONFLICT);
      } else {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    try {
      await this.prisma.user.update({
        where: {
          id,
        },
        data: {
          ...dto,
        },
      });
      return { message: 'User Updated' };
    } catch (err) {
      if (err.code === 'P2005') {
        throw new HttpException("User doesn't Exists", HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async deleteUser(id: string) {
    try {
      await this.prisma.user.delete({
        where: {
          id,
        },
      });
      return { message: 'User Deleted' };
    } catch (err) {
      if (err.code === 'P2005') {
        throw new HttpException("User doesn't Exists", HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          'Internal Server Error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
