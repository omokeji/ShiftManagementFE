import { Injectable, ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Shift } from './shift.entity';
import * as geolib from 'geolib'; 
import { JobTypesService } from '../job-types/job-types.service';
import { UsersService } from '../users/users.service';
import * as turf from '@turf/turf';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FilterShiftDto } from './shift-dto';
import { TimeEntry } from './shift.types';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift)
    private shiftsRepository: Repository<Shift>,
    private jobTypesService: JobTypesService,
    private usersService: UsersService,
  ) {}

  async createShift(
    title: string,
    type: string,
    date: Date,
    startDate: Date,
    endDate: Date,
    startTime: Date,
    endTime: Date,
    jobId: number,
    requiredSkills: string,
    description: string,
    maxEmployees: number,
    breakDuration: number,
  ) {
    try {
      if (startDate > endDate) {
        throw new BadRequestException('Start date cannot be after end date');
      }
      if (startTime > endTime) {
        throw new BadRequestException('Start time cannot be after end time');
      }
      if (maxEmployees < 1) {
        throw new BadRequestException('Maximum employees must be at least 1');
      }
      if (breakDuration < 0) {
        throw new BadRequestException('Break duration cannot be negative');
      }

      // Verify that the job exists
      const jobs = await this.jobTypesService.findAll();
      const job = jobs.find(j => j.id === jobId);
      if (!job) {
        throw new BadRequestException('Job not found');
      }

      const shift = this.shiftsRepository.create({ 
        title,
        type,
        date,
        startDate,
        endDate,
        startTime,
        endTime,
        jobId,
        job,
        requiredSkills,
        description,
        maxEmployees,
        breakDuration,
        status: 'open',
        users: [],
        clockRecords: [],
        clockInChangeRequests: []
      });
      return await this.shiftsRepository.save(shift);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create shift. Please check your input.');
    }
  }

  async pickUpShift(shiftId: number, userId: number) {
    try {
      const shift = await this.shiftsRepository.findOne({
        where: { id: shiftId },
        relations: ['users'],
      });

      if (!shift) {
        throw new NotFoundException('Shift not found');
      }

      if (shift.status !== 'open') {
        throw new BadRequestException('This shift is no longer available');
      }

      if (shift.users.length >= shift.maxEmployees) {
        throw new BadRequestException('Shift is already full');
      }

      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (shift.users.some(u => u.id === userId)) {
        throw new BadRequestException('You have already picked up this shift');
      }

      // Check if user has any overlapping shifts
      const existingShifts = await this.getUserShifts(userId);
      const hasOverlap = existingShifts.some(existingShift => {
        if (existingShift.id === shift.id) return false;

        return (
          shift.startTime < existingShift.endTime &&
          shift.endTime > existingShift.startTime
        );
      });

      if (hasOverlap) {
        throw new BadRequestException('You have another shift that overlaps with this time');
      }
      
      // Initialize clockRecords array if it doesn't exist
      if (!shift.clockRecords) {
        shift.clockRecords = [];
      }

      shift.users.push(user);
      return await this.shiftsRepository.save(shift);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to pick up shift. Please try again.');
    }
  }

  async findAll(filters?: FilterShiftDto) {
    const queryBuilder = this.shiftsRepository
      .createQueryBuilder('shift')
      .leftJoinAndSelect('shift.users', 'users');

    if (filters) {
      if (filters.date) {
        queryBuilder.andWhere('DATE(shift.date) = DATE(:date)', { date: filters.date });
      }
      if (filters.type) {
        queryBuilder.andWhere('shift.type = :type', { type: filters.type });
      }
      if (filters.jobId) {
        queryBuilder.andWhere('shift.jobId = :jobId', { jobId: filters.jobId });
      }
      if (filters.status) {
        queryBuilder.andWhere('shift.status = :status', { status: filters.status });
      }
    }

    return queryBuilder.getMany();
  }

  async clockIn(shiftId: number, userId: number, lat: number, lon: number) {
    try {
      const shift = await this.shiftsRepository.findOne({ 
        where: { id: shiftId }, 
        relations: ['users', 'job'] 
      });

      if (!shift) {
        throw new NotFoundException('Shift not found');
      }

      if (!shift.users.some(u => u.id === userId)) {
        throw new BadRequestException('You are not assigned to this shift');
      }

      const now = new Date();
      const shiftStart = new Date(shift.startTime);
      const thirtyMinsBefore = new Date(shiftStart.getTime() - 30 * 60000);

      if (shift.clockRecords?.some(r => r.userId === userId && !r.clockOut)) {
        throw new BadRequestException('You are already clocked in');
      }

      // Get location from job
      const jobLocation = shift.job.location;
      if (!jobLocation || !jobLocation.lat || !jobLocation.lon) {
        throw new BadRequestException('Job location not found or invalid');
      }

      const GEOFENCE_RADIUS = jobLocation.radius || 100; // Use job's radius or default to 100 meters

      if (!this.isWithinRadius(lat, lon, jobLocation.lat, jobLocation.lon, GEOFENCE_RADIUS)) {
        throw new BadRequestException('Outside geofence');
      }

      if (now < thirtyMinsBefore) {
        throw new BadRequestException('Cannot clock in more than 30 minutes before shift start time');
      }

      if (now > shiftStart) {
        throw new BadRequestException('Cannot clock in after shift start time');
      }

      // Initialize clockRecords array if it doesn't exist
      if (!shift.clockRecords) {
        shift.clockRecords = [];
      }
      // Add clock-in record
      console.log(`Clocking in for shift ${shiftId} by user ${userId} at ${now}`);
      shift.clockRecords.push({ userId, clockIn: now });
      return await this.shiftsRepository.save(shift);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to clock in. Please try again.');
    }
  }

  async clockOut(shiftId: number, userId: number, note?: string) {
    try {
      const shift = await this.shiftsRepository.findOne({ 
        where: { id: shiftId }, 
        relations: ['users'] 
      });

      if (!shift) {
        throw new NotFoundException('Shift not found');
      }

      if (!shift.users.some(u => u.id === userId)) {
        throw new BadRequestException('You are not assigned to this shift');
      }

      const record = shift.clockRecords.find(r => r.userId === userId && !r.clockOut);
      if (!record) {
        throw new BadRequestException('No active clock-in record found');
      }

      record.clockOut = new Date();
      record.note = note;
      return await this.shiftsRepository.save(shift);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to clock out. Please try again.');
    }
  }

  async requestClockInChange(shiftId: number, userId: number, requestedClockIn: Date) {
    const shift = await this.shiftsRepository.findOne({
      where: { id: shiftId },
      relations: ['users'],
    });
    if (!shift || !shift.users.some(u => u.id === userId)) {
      throw new BadRequestException('Invalid shift or user not assigned');
    }
    const record = shift.clockRecords.find(r => r.userId === userId && !r.clockOut);
    if (!record) throw new BadRequestException('No clock-in record to change');
    if (shift.clockInChangeRequests.some(r => r.userId === userId && r.approved === undefined)) {
      throw new BadRequestException('Pending clock-in change request already exists');
    }
    shift.clockInChangeRequests.push({ userId, requestedClockIn, approved: undefined });
    return this.shiftsRepository.save(shift);
  }

  async approveClockInChange(shiftId: number, userId: number, approve: boolean) {
    const shift = await this.shiftsRepository.findOne({ where: { id: shiftId } });
    if (!shift) throw new BadRequestException('Shift not found');
    const request = shift.clockInChangeRequests.find(r => r.userId === userId && r.approved === undefined);
    if (!request) throw new BadRequestException('No pending clock-in change request');
    request.approved = approve;
    if (approve) {
      const record = shift.clockRecords.find(r => r.userId === userId && !r.clockOut);
      if (record) record.clockIn = request.requestedClockIn; // Update clock-in time
    }
    return this.shiftsRepository.save(shift);
  }

  // Simplified geofence check (use a library like turf.js for production)
  private isWithinRadius(lat1: number, lon1: number, lat2: number, lon2: number, radius: number): boolean {
    console.log(`Checking geofence: User(${lat1}, ${lon1}) Job(${lat2}, ${lon2}) Radius: ${radius}m`);
    return geolib.getDistance(
      { latitude: lat1, longitude: lon1 },
      { latitude: lat2, longitude: lon2 }
    ) <= radius;
  }

  // For production, use a library like turf.js for geospatial calculations
  // private isWithinRadius(userLat: number, userLon: number, jobLat: number, jobLon: number, radius: number): boolean {
  //   const userPoint = turf.point([userLon, userLat]); // [lon, lat] order
  //   const jobPoint = turf.point([jobLon, jobLat]);
  //   const distance = turf.distance(userPoint, jobPoint, { units: 'meters' }); // Distance in meters
  //   return distance <= radius;
  // }

  // Method to check and auto-clock-out after 8 hours
  @Cron(CronExpression.EVERY_10_MINUTES) // Runs every 10 minutes
  async autoClockOut() {
    const shifts = await this.shiftsRepository.find({ relations: ['users'] });
    const now = new Date();
    for (const shift of shifts) {
      for (const record of shift.clockRecords) {
        if (!record.clockOut) {
          const timeElapsed = (now.getTime() - record.clockIn.getTime()) / (1000 * 60 * 60); // Hours
          if (timeElapsed >= 8) {
            record.clockOut = new Date(record.clockIn.getTime() + 8 * 60 * 60 * 1000); // 8 hours after clock-in
            await this.shiftsRepository.save(shift);
            console.log(`Auto clocked out user ${record.userId} for shift ${shift.id}`);
          }
        }
      }
    }
  }

  async getTodayShifts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.shiftsRepository.find({
      where: {
        date: Between(today, tomorrow)
      },
      relations: ['users']
    });
  }

  async getCurrentClockInStatus(userId: number) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const shifts = await this.shiftsRepository.find({
        where: {
          date: Between(today, tomorrow),
          users: { id: userId }
        },
        relations: ['users']
      });

      for (const shift of shifts) {
        const currentRecord = shift.clockRecords.find(
          r => r.userId === userId && !r.clockOut
        );
        if (currentRecord) {
          return {
            shiftId: shift.id,
            clockInTime: currentRecord.clockIn,
            title: shift.title,
            type: shift.type
          };
        }
      }

      return null;
    } catch (error) {
      throw new BadRequestException('Failed to fetch clock-in status. Please try again.');
    }
  }

  async getTodayTimeSummary(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const shifts = await this.shiftsRepository.find({
      where: {
        date: Between(today, tomorrow),
        users: { id: userId }
      },
      relations: ['users']
    });

    let totalMinutes = 0;
    const entries: TimeEntry[] = [];

    for (const shift of shifts) {
      const userRecords = shift.clockRecords.filter(r => r.userId === userId);
      for (const record of userRecords) {
        const clockOut = record.clockOut || new Date();
        const minutes = Math.floor((clockOut.getTime() - record.clockIn.getTime()) / (1000 * 60));
        totalMinutes += minutes;
        entries.push({
          shiftId: shift.id,
          title: shift.title,
          type: shift.type,
          clockIn: record.clockIn,
          clockOut: record.clockOut,
          duration: minutes,
          note: record.note
        });
      }
    }

    return {
      totalHours: Math.floor(totalMinutes / 60),
      totalMinutes: totalMinutes % 60,
      entries
    };
  }

  async getRecentTimeEntries(userId: number, limit: number = 10) {
    const shifts = await this.shiftsRepository.find({
      where: {
        users: { id: userId }
      },
      relations: ['users'],
      order: {
        date: 'DESC'
      },
      take: limit
    });

    const entries: TimeEntry[] = [];
    for (const shift of shifts) {
      const userRecords = shift.clockRecords.filter(r => r.userId === userId);
      for (const record of userRecords) {
        if (record.clockOut) { // Only include completed entries
          const minutes = Math.floor((record.clockOut.getTime() - record.clockIn.getTime()) / (1000 * 60));
          entries.push({
            shiftId: shift.id,
            title: shift.title,
            type: shift.type,
            date: shift.date,
            clockIn: record.clockIn,
            clockOut: record.clockOut,
            duration: minutes,
            note: record.note
          });
        }
      }
    }

    return entries.sort((a, b) => b.clockIn.getTime() - a.clockIn.getTime()).slice(0, limit);
  }

  async getAvailableShifts(date?: Date, time?: Date) {
    try {
      const queryBuilder = this.shiftsRepository
        .createQueryBuilder('shift')
        .leftJoinAndSelect('shift.users', 'users')
        .where('shift.status = :status', { status: 'open' });

      if (date) {
        queryBuilder.andWhere('DATE(shift.date) = DATE(:date)', { date });
      }

      if (time) {
        queryBuilder.andWhere('shift.startTime >= :time', { time });
      }

      queryBuilder.andWhere(
        '(SELECT COUNT(*) FROM shift_users_user WHERE shiftId = shift.id) < shift.maxEmployees'
      );

      return await queryBuilder.getMany();
    } catch (error) {
      throw new BadRequestException('Failed to fetch available shifts. Please try again.');
    }
  }

  async getUserShifts(userId: number) {
    try {
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return await this.shiftsRepository.find({
        where: {
          users: { id: userId }
        },
        relations: ['users'],
        order: {
          date: 'DESC',
          startTime: 'ASC'
        }
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch user shifts. Please try again.');
    }
  }

  async dropShift(shiftId: number, userId: number) {
    try {
      const shift = await this.shiftsRepository.findOne({
        where: { id: shiftId },
        relations: ['users']
      });

      if (!shift) {
        throw new NotFoundException('Shift not found');
      }

      const userIndex = shift.users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new BadRequestException('You are not assigned to this shift');
      }

      // Check if shift hasn't started yet
      if (new Date() > shift.startTime) {
        throw new BadRequestException('Cannot drop a shift that has already started');
      }

      // Remove user from shift
      shift.users.splice(userIndex, 1);
      
      // Remove any clock records for this user
      shift.clockRecords = shift.clockRecords.filter(r => r.userId !== userId);
      
      // Remove any clock-in change requests for this user
      shift.clockInChangeRequests = shift.clockInChangeRequests.filter(r => r.userId !== userId);

      return await this.shiftsRepository.save(shift);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to drop shift. Please try again.');
    }
  }
}