import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ApiResponse, ApiResponseBuilder } from '../common/interfaces/api-response.interface';

@ApiTags('analytics')
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard-stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @SwaggerResponse({ status: 200, description: 'Dashboard statistics retrieved successfully' })
  async getDashboardStats(): Promise<ApiResponse<any>> {
    const stats = await this.analyticsService.getDashboardStats();
    return ApiResponseBuilder.success(stats, 'Dashboard statistics retrieved successfully');
  }

  @Get('shift-analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shift analytics' })
  @SwaggerResponse({ status: 200, description: 'Shift analytics retrieved successfully' })
  async getShiftAnalytics(@Query('period') period: string = '30d'): Promise<ApiResponse<any>> {
    const analytics = await this.analyticsService.getShiftAnalytics(period);
    return ApiResponseBuilder.success(analytics, 'Shift analytics retrieved successfully');
  }

  @Get('user-analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user analytics' })
  @SwaggerResponse({ status: 200, description: 'User analytics retrieved successfully' })
  async getUserAnalytics(@Query('period') period: string = '30d'): Promise<ApiResponse<any>> {
    const analytics = await this.analyticsService.getUserAnalytics(period);
    return ApiResponseBuilder.success(analytics, 'User analytics retrieved successfully');
  }

  @Get('revenue-analytics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get revenue analytics' })
  @SwaggerResponse({ status: 200, description: 'Revenue analytics retrieved successfully' })
  async getRevenueAnalytics(@Query('period') period: string = '30d'): Promise<ApiResponse<any>> {
    const analytics = await this.analyticsService.getRevenueAnalytics(period);
    return ApiResponseBuilder.success(analytics, 'Revenue analytics retrieved successfully');
  }

  @Get('performance-metrics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get performance metrics' })
  @SwaggerResponse({ status: 200, description: 'Performance metrics retrieved successfully' })
  async getPerformanceMetrics(): Promise<ApiResponse<any>> {
    const metrics = await this.analyticsService.getPerformanceMetrics();
    return ApiResponseBuilder.success(metrics, 'Performance metrics retrieved successfully');
  }

  @Get('recent-activities')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent activities' })
  @SwaggerResponse({ status: 200, description: 'Recent activities retrieved successfully' })
  async getRecentActivities(@Query('limit') limit: number = 10): Promise<ApiResponse<any>> {
    const activities = await this.analyticsService.getRecentActivities(limit);
    return ApiResponseBuilder.success(activities, 'Recent activities retrieved successfully');
  }
}
