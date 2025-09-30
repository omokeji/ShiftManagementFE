import { IsString, MinLength, IsNotEmpty, IsDate, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JobTypeDto {
  @ApiProperty({ description: 'The title of the job type', example: 'Evercare Hospital' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'The description of the job type', example: 'Diagnosis and others' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'The phone of the job type', example: 'Diagnosis and others' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'The email of the job type', example: 'Diagnosis and others' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'The address of the job location', example: '123 Main St, City, Country' })
  @IsString()
  address?: string;

  @ApiProperty({ description: 'The latitude of the job location', example: 37.7749 })
  @IsNumber()
  lat?: number;

  @ApiProperty({ description: 'The longitude of the job location', example: -122.4194 })
  @IsNumber()
  lon?: number;

  @ApiProperty({ description: 'The radius around the job location in kilometers', example: 10 })
  @IsNumber()
  radius: number;
}

