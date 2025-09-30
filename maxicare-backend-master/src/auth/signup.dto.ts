import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
    @ApiProperty({ description: 'The username of the user', example: 'john_doe' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ description: 'The firstname of the user', example: 'john_doe' })
    @IsString()
    @IsNotEmpty()
    firstname: string;

    @ApiProperty({ description: 'The lastname of the user', example: 'john_doe' })
    @IsString()
    @IsNotEmpty()
    lastname: string;

    @ApiProperty({ description: 'The email of the user', example: 'john_doe@***.***' })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ description: 'The phone of the user', example: '1234567890' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ description: 'The team type of the user', example: 'RN, LPN, CNA' })
    @IsString()
    @IsNotEmpty()
    team: string;

    @ApiProperty({ description: 'The team type of the user', example: 'RN, LPN, CNA' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'The role of the user', example: 'user' })
    @IsString()
    @IsNotEmpty()
    role: string;

    @ApiProperty({ description: 'The password of the user', example: 'password123', minLength: 8 })
    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    password: string;
}