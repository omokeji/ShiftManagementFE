// src/auth/auth.controller.ts
import { Controller, Post, Body, Request, UseGuards, Get, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChangePasswordDto, ResetPasswordDto, SignInDto } from './signin.dto';
import { SignUpDto } from './signup.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';
import { ApiResponse, ApiResponseBuilder } from '../common/interfaces/api-response.interface';
import { User } from '../users/user.entity';

interface AuthResponse {
  access_token: string;
  success: boolean;
  username: string;
  message: string;
}

@ApiTags('auth') // Groups endpoints under "auth" in Swagger UI
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

    @Post('user/signup')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Sign up a new user' })
    @SwaggerResponse({ status: 201, description: 'User account created successfully' })
    async signup(@Body() signupDto: SignUpDto): Promise<ApiResponse<AuthResponse>> {
        const response = await this.authService.signupuser(signupDto);
        return ApiResponseBuilder.success(response, 'User account created successfully');
    }

    @Post('admin/signup')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new administrator account' })
    @SwaggerResponse({ status: 201, description: 'Administrator account created successfully' })
    async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<AuthResponse>> {
      const response = await this.authService.signupadmin(createUserDto);
      return ApiResponseBuilder.success(response, 'Administrator account created successfully');
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Sign in and receive JWT token' })
    @SwaggerResponse({ status: 200, description: 'Successfully signed in' })
    async login(@Body() signinDto: SignInDto): Promise<ApiResponse<AuthResponse>> {
        const response = await this.authService.login(signinDto);
        return ApiResponseBuilder.success(response, 'Successfully signed in');
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Sign out the current user' })
    @SwaggerResponse({ status: 200, description: 'Successfully signed out' })
    async logout(@Request() req): Promise<ApiResponse<undefined>> {
        await this.authService.logOut(req.user.id);
        return ApiResponseBuilder.success(undefined, 'Successfully signed out');
    }

    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Change user password' })
    @SwaggerResponse({ status: 200, description: 'Password changed successfully' })
    @SwaggerResponse({ status: 400, description: 'Bad request - Invalid current password or new password requirements not met' })
    @SwaggerResponse({ status: 401, description: 'Unauthorized - Invalid or expired token' })
    async changePassword(
      @Request() req,
      @Body() changePassword: ChangePasswordDto) {
      return this.authService.changePassword(req.user.id, changePassword.oldPassword, changePassword.newPassword);
    }

    @Post('request-password-reset')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Request a password reset link' })
    @SwaggerResponse({ status: 200, description: 'Password reset email sent if account exists' })
    @SwaggerResponse({ status: 400, description: 'Bad request - Invalid email format' })
    async requestPasswordReset(@Body() requestPasswordReset: ResetPasswordDto): Promise<ApiResponse<undefined>> {
      await this.authService.requestPasswordReset(requestPasswordReset.email);
      return ApiResponseBuilder.success(undefined, 'Password reset email sent if account exists');
    }

    @Get('confirm')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Confirm email address' })
    @SwaggerResponse({ status: 200, description: 'Email confirmed successfully' })
    @SwaggerResponse({ status: 400, description: 'Bad request - Invalid or expired confirmation token' })
    async confirm(@Query('token') token: string): Promise<ApiResponse<User>> {
      const user = await this.usersService.confirmEmail(token);
      return ApiResponseBuilder.success(user, 'Email confirmed successfully');
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset password using reset token' })
    @SwaggerResponse({ status: 200, description: 'Password reset successfully' })
    @SwaggerResponse({ status: 400, description: 'Bad request - Invalid token or password requirements not met' })
    async resetPassword(
      @Query('token') token: string,
      @Query('newPassword') newPassword: string
    ): Promise<ApiResponse<undefined>> {
      await this.authService.resetPassword(token, newPassword);
      return ApiResponseBuilder.success(undefined, 'Password reset successfully');
    }
}