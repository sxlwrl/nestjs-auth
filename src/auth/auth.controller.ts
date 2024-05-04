import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RegisterUserDto } from './dto/registerUser.dto';
import { LoginUserDto } from './dto/loginUser.dto';
import { AuthService } from './auth.service';
import { Token } from './types/token.type';
import { CustomRequest } from './types/custom-request.type';
import { RefreshGuard } from '../guards/refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  signUp(@Body() signUpData: RegisterUserDto): Promise<Token> {
    return this.authService.signup(signUpData);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  signIn(@Body() signInData: LoginUserDto): Promise<Token> {
    return this.authService.signin(signInData);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshGuard)
  refreshTokens(@Req() req: CustomRequest) {
    const userId = Number(req.user?.sub);
    const token = req.headers?.authorization?.split(' ')[1];

    return this.authService.refreshToken(userId, token);
  }
}
