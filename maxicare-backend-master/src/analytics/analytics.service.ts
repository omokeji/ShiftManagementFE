import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Shift } from '../shift/shift.entity';
import { JobType } from '../job-types/job-type.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Shift)
    private shiftsRepository: Repository<Shift>,
    @InjectRepository(JobType)
    private jobTypesRepository: Repository<JobType>,
  ) {}

  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get total counts
    const totalUsers = await this.usersRepository.count();
    const totalShifts = await this.shiftsRepository.count();
    const totalJobTypes = await this.jobTypesRepository.count();

    // Get recent counts
    const newUsersLast30Days = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :date', { date: thirtyDaysAgo })
      .getCount();

    const newUsersLast7Days = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :date', { date: sevenDaysAgo })
      .getCount();

    // Get active shifts
    const activeShifts = await this.shiftsRepository
      .createQueryBuilder('shift')
      .where('shift.status = :status', { status: 'in-progress' })
      .getCount();

    // Get completed shifts this month
    const completedShiftsThisMonth = await this.shiftsRepository
      .createQueryBuilder('shift')
      .where('shift.status = :status', { status: 'completed' })
      .andWhere('shift.endTime >= :startOfMonth', { 
        startOfMonth: new Date(now.getFullYear(), now.getMonth(), 1) 
      })
      .getCount();

    // Calculate growth rates
    const userGrowthRate = totalUsers > 0 ? ((newUsersLast30Days / totalUsers) * 100) : 0;
    const shiftCompletionRate = totalShifts > 0 ? ((completedShiftsThisMonth / totalShifts) * 100) : 0;

    return {
      overview: {
        totalUsers,
        totalShifts,
        totalJobTypes,
        activeShifts,
        completedShiftsThisMonth
      },
      growth: {
        newUsersLast30Days,
        newUsersLast7Days,
        userGrowthRate: Math.round(userGrowthRate * 100) / 100,
        shiftCompletionRate: Math.round(shiftCompletionRate * 100) / 100
      },
      trends: {
        userGrowthTrend: newUsersLast7Days > 0 ? 'up' : 'down',
        shiftTrend: completedShiftsThisMonth > 0 ? 'up' : 'down'
      }
    };
  }

  async getShiftAnalytics(period: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get shifts by status
    const shiftsByStatus = await this.shiftsRepository
      .createQueryBuilder('shift')
      .select('shift.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('shift.createdAt >= :startDate', { startDate })
      .groupBy('shift.status')
      .getRawMany();

    // Get shifts by job type
    const shiftsByJobType = await this.shiftsRepository
      .createQueryBuilder('shift')
      .leftJoin('shift.jobType', 'jobType')
      .select('jobType.title', 'jobType')
      .addSelect('COUNT(*)', 'count')
      .where('shift.createdAt >= :startDate', { startDate })
      .groupBy('jobType.title')
      .getRawMany();

    // Get daily shift counts
    const dailyShifts = await this.shiftsRepository
      .createQueryBuilder('shift')
      .select('DATE(shift.startTime)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('shift.startTime >= :startDate', { startDate })
      .groupBy('DATE(shift.startTime)')
      .orderBy('DATE(shift.startTime)', 'ASC')
      .getRawMany();

    return {
      period,
      shiftsByStatus,
      shiftsByJobType,
      dailyShifts,
      totalShifts: shiftsByStatus.reduce((sum, item) => sum + parseInt(item.count), 0)
    };
  }

  async getUserAnalytics(period: string) {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get users by role
    const usersByRole = await this.usersRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    // Get new users over time
    const newUsersOverTime = await this.usersRepository
      .createQueryBuilder('user')
      .select('DATE(user.createdAt)', 'date')
      .addSelect('COUNT(*)', 'count')
      .where('user.createdAt >= :startDate', { startDate })
      .groupBy('DATE(user.createdAt)')
      .orderBy('DATE(user.createdAt)', 'ASC')
      .getRawMany();

    // Get active users (users with shifts in the period)
    const activeUsers = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.shifts', 'shift')
      .where('shift.startTime >= :startDate', { startDate })
      .getCount();

    return {
      period,
      usersByRole,
      newUsersOverTime,
      activeUsers,
      totalUsers: usersByRole.reduce((sum, item) => sum + parseInt(item.count), 0)
    };
  }

  async getRevenueAnalytics(period: string) {
    // This would typically calculate revenue based on shift rates, job types, etc.
    // For now, we'll return mock data structure
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get completed shifts for revenue calculation
    const completedShifts = await this.shiftsRepository
      .createQueryBuilder('shift')
      .leftJoin('shift.jobType', 'jobType')
      .select('jobType.title', 'jobType')
      .addSelect('COUNT(*)', 'shiftCount')
      .addSelect('AVG(TIMESTAMPDIFF(HOUR, shift.startTime, shift.endTime))', 'avgHours')
      .where('shift.status = :status', { status: 'completed' })
      .andWhere('shift.endTime >= :startDate', { startDate })
      .groupBy('jobType.title')
      .getRawMany();

    // Mock revenue calculation (in real app, this would use actual rates)
    const revenueData = completedShifts.map(item => ({
      jobType: item.jobType,
      shiftCount: parseInt(item.shiftCount),
      avgHours: parseFloat(item.avgHours) || 0,
      estimatedRevenue: parseInt(item.shiftCount) * (parseFloat(item.avgHours) || 8) * 25 // $25/hour mock rate
    }));

    const totalRevenue = revenueData.reduce((sum, item) => sum + item.estimatedRevenue, 0);

    return {
      period,
      revenueData,
      totalRevenue,
      averageRevenuePerShift: revenueData.length > 0 ? totalRevenue / revenueData.reduce((sum, item) => sum + item.shiftCount, 0) : 0
    };
  }

  async getPerformanceMetrics() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get shift completion rate
    const totalShifts = await this.shiftsRepository.count();
    const completedShifts = await this.shiftsRepository
      .createQueryBuilder('shift')
      .where('shift.status = :status', { status: 'completed' })
      .getCount();

    // Get average shift duration
    const avgShiftDuration = await this.shiftsRepository
      .createQueryBuilder('shift')
      .select('AVG(TIMESTAMPDIFF(HOUR, shift.startTime, shift.endTime))', 'avgDuration')
      .where('shift.status = :status', { status: 'completed' })
      .getRawOne();

    // Get on-time completion rate
    const onTimeShifts = await this.shiftsRepository
      .createQueryBuilder('shift')
      .where('shift.status = :status', { status: 'completed' })
      .andWhere('shift.endTime <= shift.scheduledEndTime')
      .getCount();

    // Get user satisfaction (mock data for now)
    const satisfactionScore = 4.2; // This would come from feedback/ratings

    return {
      shiftCompletionRate: totalShifts > 0 ? (completedShifts / totalShifts) * 100 : 0,
      averageShiftDuration: parseFloat(avgShiftDuration?.avgDuration) || 0,
      onTimeCompletionRate: completedShifts > 0 ? (onTimeShifts / completedShifts) * 100 : 0,
      userSatisfactionScore: satisfactionScore,
      totalShifts,
      completedShifts,
      onTimeShifts
    };
  }

  async getRecentActivities(limit: number = 10) {
    // Get recent shifts
    const recentShifts = await this.shiftsRepository
      .createQueryBuilder('shift')
      .leftJoin('shift.assignedUser', 'user')
      .leftJoin('shift.jobType', 'jobType')
      .select([
        'shift.id',
        'shift.status',
        'shift.startTime',
        'shift.endTime',
        'shift.createdAt',
        'user.firstname',
        'user.lastname',
        'jobType.title'
      ])
      .orderBy('shift.createdAt', 'DESC')
      .limit(limit)
      .getMany();

    // Get recent users
    const recentUsers = await this.usersRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.firstname', 'user.lastname', 'user.role', 'user.createdAt'])
      .orderBy('user.createdAt', 'DESC')
      .limit(5)
      .getMany();

    return {
      recentShifts: recentShifts.map(shift => ({
        id: shift.id,
        type: 'shift',
        action: `Shift ${shift.status}`,
        description: `${shift.assignedUser?.firstname} ${shift.assignedUser?.lastname} - ${shift.jobType?.title}`,
        timestamp: shift.createdAt,
        status: shift.status
      })),
      recentUsers: recentUsers.map(user => ({
        id: user.id,
        type: 'user',
        action: 'New user registered',
        description: `${user.firstname} ${user.lastname} (${user.role})`,
        timestamp: user.createdAt
      }))
    };
  }
}
