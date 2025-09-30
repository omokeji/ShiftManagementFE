import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { JobTypesService } from './job-types.service';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/role-decorator';
import { JobTypeDto } from './job-type.dto';
import { ApiResponse, ApiResponseBuilder } from '../common/interfaces/api-response.interface';
import { JobType } from './job-types.entity';

@ApiTags('job-types')
@Controller('api/job-types')
export class JobTypesController {
  constructor(private jobTypesService: JobTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a job type (Admin only)' })
  @SwaggerResponse({ status: 201, description: 'Job type created successfully' })
  async create(@Body() body: JobTypeDto): Promise<ApiResponse<JobType>> {
    const sanitizedJson = JSON.parse(JSON.stringify(body).replace(/[\u00A0\u200B-\u200D\uFEFF]/g, ''));
    const jobType = await this.jobTypesService.create(
      sanitizedJson.title,
      sanitizedJson.description,
      sanitizedJson.phone,
      sanitizedJson.email,
      {
        address: sanitizedJson.address,
        lat: sanitizedJson.lat,
        lon: sanitizedJson.lon,
        radius: sanitizedJson.radius
      }
    );
    return ApiResponseBuilder.success(jobType, 'Job type created successfully');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get all job types' })
  @SwaggerResponse({ status: 200, description: 'Job types retrieved successfully' })
  async findAll(): Promise<ApiResponse<JobType[]>> {
    const jobTypes = await this.jobTypesService.findAll();
    return ApiResponseBuilder.success(jobTypes, 'Job types retrieved successfully');
  }
}