import { Injectable } from '@nestjs/common/decorators';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ForbiddenException } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(dto.password);
      // Save new user into db

      const savedUser =
        await this.prisma.user.create({
          data: {
            email: dto.email,
            hash,
          },
          // select: {
          //     id: true,
          //     email: true,
          //     createdAt: true,
          //     firstName: true,
          //     lastName: true
          // }
        });

      delete savedUser.hash;
      // return saved user
      return savedUser;
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002') {
          throw new ForbiddenException(
            'Credentials taken',
          );
        }
      }
      throw error;
    }
  }

  signin() {
    return { msg: 'I am sign in.' };
  }
}
