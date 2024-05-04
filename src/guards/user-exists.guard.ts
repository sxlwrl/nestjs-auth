import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class UserExistsGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const id = Number(context.switchToHttp().getRequest().params.id);

    const userExists = await this.usersService.findUser({ id });

    if (!userExists) {
      throw new NotFoundException('User does not exist');
    }

    return true;
  }
}
