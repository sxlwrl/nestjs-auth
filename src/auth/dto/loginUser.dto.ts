import { IsNotEmpty, IsString, Length } from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 20)
  username: string;

  @IsString()
  @IsNotEmpty()
  @Length(5)
  password: string;
}
