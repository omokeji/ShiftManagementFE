import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  @ApiProperty({ description: 'The username of the user', example: 'john_doe@xxx.ooo' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The password of the user', example: '********', minLength: 8 })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  password: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'The username of the user', example: 'john_doe@xxx.ooo' })
  @IsString()
  @IsNotEmpty()
  email: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'The current password of the user', example: 'current_password' })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ description: 'The new password of the user', example: 'new_password', minLength: 8 })
  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  newPassword: string;
}


