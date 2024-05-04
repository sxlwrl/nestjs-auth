import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterUserDto } from './dto/registerUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Token } from './types/token.type';
import { Payload } from './types/payload.type';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async signup(data: RegisterUserDto) {
    const { username, email, password } = data;

    const isEmailTaken = await this.usersService.findUser({ email: email });

    const isUsernameTaken = await this.usersService.findUser({
      username: username,
    });

    if (isUsernameTaken) {
      throw new ConflictException('User with this username already exists');
    }

    if (isEmailTaken) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await this.usersService.createUser({
      ...data,
      password: hashedPassword,
    });

    const tokens = await this._generateTokens(user.id, user.username);

    await this.updateToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async signin(data: LoginUserDto) {
    const { username, password } = data;
    const user = await this.usersService.findUser({ username });

    if (!user) {
      throw new BadRequestException('User with this username is not existed');
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword) {
      throw new BadRequestException('Password is incorrect');
    }

    const tokens = await this._generateTokens(user.id, user.username);

    await this.updateToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async refreshToken(userId: number, token: string): Promise<Token> {
    const user = await this.usersService.findUser({ id: userId });

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access denied');
    }

    const compareToken = await bcrypt.compare(token, user.refreshToken);

    if (!compareToken) {
      throw new ForbiddenException('Access denied');
    }

    const tokens = await this._generateTokens(user.id, user.username);
    await this.updateToken(user.id, tokens.refresh_token);

    return tokens;
  }

  async updateToken(userId: number, token: string): Promise<void> {
    const hashedToken = await bcrypt.hash(token, 12);
    await this.usersService.updateUser(userId, { refreshToken: hashedToken });
  }

  protected async _generateTokens(
    userId: number,
    username: string,
  ): Promise<Token> {
    const payload: Payload = {
      sub: userId,
      username: username,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('ACCESS_SECRET'),
        expiresIn: '30m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('REFRESH_SECRET'),
        expiresIn: '30d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
