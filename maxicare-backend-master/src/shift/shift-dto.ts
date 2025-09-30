import { IsString, MinLength, IsNotEmpty, IsDate, IsNumber, IsArray, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateShiftDto {
    @ApiProperty({ description: 'The title of the shift' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'The type of shift' })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({ description: 'The date of the shift' })
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    date: Date;

    @ApiProperty({ description: 'The start date of the shift' })
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    startDate: Date;

    @ApiProperty({ description: 'The end date of the shift' })
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    endDate: Date;

    @ApiProperty({ description: 'The start time of the shift' })
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    startTime: Date;

    @ApiProperty({ description: 'The end time of the shift' })
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    endTime: Date;

    @ApiProperty({ description: 'The ID of the job this shift is for' })
    @IsNumber()
    @IsNotEmpty()
    jobId: number;

    @ApiProperty({ description: 'Required skills for the shift' })
    @IsString()
    @IsNotEmpty()
    requiredSkills: string;

    @ApiProperty({ description: 'Description of the shift' })
    @IsString()
    @IsOptional()
    description: string;

    @ApiProperty({ description: 'Maximum number of employees for the shift' })
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    maxEmployees: number;

    @ApiProperty({ description: 'Break duration in minutes' })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    breakDuration: number;
}

export class FilterShiftDto {
    @ApiProperty({ description: 'Filter by date', required: false })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    date?: Date;

    @ApiProperty({ description: 'Filter by type', required: false })
    @IsOptional()
    @IsString()
    type?: string;

    @ApiProperty({ description: 'Filter by job ID', required: false })
    @IsOptional()
    @IsNumber()
    jobId?: number;

    @ApiProperty({ description: 'Filter by status', required: false })
    @IsOptional()
    @IsString()
    status?: string;
}

export class ClockInShiftDTO {
    @ApiProperty({ description: 'The ID of the shift to clock in to' })
    @IsNumber()
    @IsNotEmpty()
    shiftId: number;

    @ApiProperty({ description: 'Latitude of user location' })
    @IsNumber()
    @IsNotEmpty()
    lat: number;

    @ApiProperty({ description: 'Longitude of user location' })
    @IsNumber()
    @IsNotEmpty()
    lon: number;
}

export class RequestClockInChangeDTO {
    @ApiProperty({ description: 'The ID of the shift' })
    @IsNumber()
    @IsNotEmpty()
    shiftId: number;

    @ApiProperty({ description: 'Requested clock in time' })
    @IsDate()
    @Type(() => Date)
    @IsNotEmpty()
    requestedClockIn: Date;
}

export class ApproveClockInChangeDTO {
    @ApiProperty({ description: 'The ID of the shift' })
    @IsNumber()
    @IsNotEmpty()
    shiftId: number;

    @ApiProperty({ description: 'The ID of the user requesting the change' })
    @IsNumber()
    @IsNotEmpty()
    userId: number;

    @ApiProperty({ description: 'Whether to approve or reject the change' })
    @IsString()
    @IsNotEmpty()
    approve: boolean;
}

export class ClockOutShiftDTO {
    @ApiProperty({ description: 'The ID of the shift to clock out from' })
    @IsNumber()
    @IsNotEmpty()
    shiftId: number;

    @ApiProperty({ description: 'Optional note for the clock out' })
    @IsString()
    @IsOptional()
    note?: string;
}

export class AvailableShiftsFilterDto {
    @ApiProperty({ description: 'Filter by date', required: false })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    date?: Date;

    @ApiProperty({ description: 'Filter by time', required: false })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    time?: Date;
}