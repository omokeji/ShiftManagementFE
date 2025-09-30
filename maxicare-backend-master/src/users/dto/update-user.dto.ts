// src/users/dto/update-user.dto.ts
import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
    @ApiProperty({ description: 'The new username of the user', example: 'john_doe_updated', required: false })
    @IsString()
    @IsOptional()
    username?: string;

    @ApiProperty({ description: 'The firstname of the user', example: 'john_doe' })
    @IsString()
    @IsOptional()
    firstname: string;

    @ApiProperty({ description: 'The lastname of the user', example: 'john_doe' })
    @IsString()
    @IsOptional()
    lastname: string;

    @ApiProperty({ description: 'The email of the user', example: 'john_doe@***.***' })
    @IsString()
    @IsOptional()
    email: string;

    @ApiProperty({ description: 'The phone of the user', example: '1234567890' })
    @IsString()
    @IsOptional()
    phone: string;

    @ApiProperty({ description: 'The new password of the user', example: 'newpassword123', required: false })
    @IsString()
    @IsOptional()
    password?: string;
}