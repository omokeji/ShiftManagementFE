// src/users/users.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse, ApiResponseBuilder } from '../common/interfaces/api-response.interface';
import { User } from './user.entity';

@ApiTags('users') // Groups endpoints under "users" in Swagger UI
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new admin' })
  @SwaggerResponse({ status: 201, description: 'User created successfully' })
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    const user = await this.usersService.createadmin(createUserDto);
    return ApiResponseBuilder.success(user, 'User created successfully');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth() 
  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @SwaggerResponse({ status: 200, description: 'List of users' })
  async findAll(): Promise<ApiResponse<User[]>> {
    const users = await this.usersService.findAll();
    return ApiResponseBuilder.success(users, 'Users retrieved successfully');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @SwaggerResponse({ status: 200, description: 'User found' })
  async findOne(@Param('id') id: string): Promise<ApiResponse<User>> {
    const user = await this.usersService.findOne(+id);
    return ApiResponseBuilder.success(user, 'User retrieved successfully');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @SwaggerResponse({ status: 200, description: 'User updated' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<ApiResponse<User>> {
    const user = await this.usersService.update(+id, updateUserDto);
    return ApiResponseBuilder.success(user, 'User updated successfully');
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @SwaggerResponse({ status: 200, description: 'User deleted' })
  async remove(@Param('id') id: string): Promise<ApiResponse<void>> {
    await this.usersService.remove(+id);
    return ApiResponseBuilder.success(undefined, 'User deleted successfully');
  }
}