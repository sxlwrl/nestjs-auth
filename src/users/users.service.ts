import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async findUser(property: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: property,
    });
  }

  async createUser(data: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({
      data: {
        ...data,
      },
    });
  }

  async updateUser(userId: number, data: UpdateUserDto): Promise<User> {
    if (data.password) {
      const password = await bcrypt.hash(data.password, 12);
      data = { ...data, password };
    }

    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        ...data,
      },
    });
  }

  async deleteUser(userId: number): Promise<User> {
    return this.prismaService.user.delete({
      where: {
        id: userId,
      },
    });
  }
}
