import { Controller, Post, Body, Get, UseGuards, Query, Param, ParseIntPipe } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/role-decorator';
import { ApproveClockInChangeDTO, ClockInShiftDTO, ClockOutShiftDTO, CreateShiftDto, FilterShiftDto, RequestClockInChangeDTO, AvailableShiftsFilterDto } from './shift-dto';
import { TimeEntry, ShiftResponseDto, DetailedShiftResponseDto } from './shift.types';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { ApiResponse, ApiResponseBuilder } from '../common/interfaces/api-response.interface';
import { Shift } from './shift.entity';

@ApiTags('shifts')
@Controller('api/shifts')
export class ShiftsController {
  constructor(private shiftsService: ShiftsService) {}

  private transformToShiftResponse(shift: Shift): ShiftResponseDto {
    return {
      id: shift.id,
      title: shift.title,
      type: shift.type,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      status: shift.status,
      maxEmployees: shift.maxEmployees,
      currentEmployees: shift.users?.length || 0
    };
  }

  private transformToDetailedShiftResponse(shift: Shift): DetailedShiftResponseDto {
    return {
      ...this.transformToShiftResponse(shift),
      description: shift.description,
      requiredSkills: shift.requiredSkills,
      breakDuration: shift.breakDuration,
      jobId: shift.jobId
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new shift (Admin only)' })
  @SwaggerResponse({ status: 201, description: 'Shift created successfully' })
  async create(@Body() createShiftDto: CreateShiftDto): Promise<ApiResponse<DetailedShiftResponseDto>> {
    const shift = await this.shiftsService.createShift(
      createShiftDto.title,
      createShiftDto.type,
      createShiftDto.date,
      createShiftDto.startDate,
      createShiftDto.endDate,
      createShiftDto.startTime,
      createShiftDto.endTime,
      createShiftDto.jobId,
      createShiftDto.requiredSkills,
      createShiftDto.description,
      createShiftDto.maxEmployees,
      createShiftDto.breakDuration,
    );
    return ApiResponseBuilder.success(this.transformToDetailedShiftResponse(shift), 'Shift created successfully');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all shifts with optional filters' })
  async findAll(@Query() filters?: FilterShiftDto): Promise<ApiResponse<ShiftResponseDto[]>> {
    const shifts = await this.shiftsService.findAll(filters);
    return ApiResponseBuilder.success(
      shifts.map(shift => this.transformToShiftResponse(shift)),
      'Shifts retrieved successfully'
    );
  }

  @Post('pickup/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pick up a shift' })
  async pickUpShift(
    @Param('id', ParseIntPipe) shiftId: number,
    @GetUser() user: JwtPayload,
  ): Promise<ApiResponse<ShiftResponseDto>> {
    const shift = await this.shiftsService.pickUpShift(shiftId, user.userId);
    return ApiResponseBuilder.success(this.transformToShiftResponse(shift), 'Shift picked up successfully');
  }

  @Post('clockin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clock in to a shift' })
  async clockIn(
    @Body() clockInDto: ClockInShiftDTO,
    @GetUser() user: JwtPayload,
  ): Promise<ApiResponse<ShiftResponseDto>> {
    const shift = await this.shiftsService.clockIn(
      clockInDto.shiftId,
      user.userId,
      clockInDto.lat,
      clockInDto.lon,
    );
    return ApiResponseBuilder.success(this.transformToShiftResponse(shift), 'Clocked in successfully');
  }

  @Post('clockout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clock out from a shift' })
  async clockOut(
    @Body() clockOutDto: ClockOutShiftDTO,
    @GetUser() user: JwtPayload,
  ): Promise<ApiResponse<ShiftResponseDto>> {
    const shift = await this.shiftsService.clockOut(
      clockOutDto.shiftId,
      user.userId,
      clockOutDto.note,
    );
    return ApiResponseBuilder.success(this.transformToShiftResponse(shift), 'Clocked out successfully');
  }

  @Post('request-clockin-change')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request a clock-in time change' })
  async requestClockInChange(
    @Body() requestDto: RequestClockInChangeDTO,
    @GetUser() user: JwtPayload,
  ): Promise<ApiResponse<Shift>> {
    const shift = await this.shiftsService.requestClockInChange(
      requestDto.shiftId,
      user.userId,
      requestDto.requestedClockIn,
    );
    return ApiResponseBuilder.success(shift, 'Clock-in change requested successfully');
  }

  @Post('approve-clockin-change')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles('admin')
  @ApiOperation({ summary: 'Approve or reject a clock-in time change request (Admin only)' })
  async approveClockInChange(@Body() approveDto: ApproveClockInChangeDTO): Promise<ApiResponse<Shift>> {
    const shift = await this.shiftsService.approveClockInChange(
      approveDto.shiftId,
      approveDto.userId,
      approveDto.approve,
    );
    return ApiResponseBuilder.success(shift, approveDto.approve ? 'Clock-in change approved' : 'Clock-in change rejected');
  }

  @Get('today')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all shifts for today' })
  async getTodayShifts(): Promise<ApiResponse<ShiftResponseDto[]>> {
    const shifts = await this.shiftsService.getTodayShifts();
    return ApiResponseBuilder.success(
      shifts.map(shift => this.transformToShiftResponse(shift)),
      'Today\'s shifts retrieved successfully'
    );
  }

  @Get('clock-in-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current clock-in status' })
  async getCurrentClockInStatus(@GetUser() user: JwtPayload): Promise<ApiResponse<any>> {
    const status = await this.shiftsService.getCurrentClockInStatus(user.userId);
    return ApiResponseBuilder.success(status, 'Clock-in status retrieved successfully');
  }

  @Get('time-summary')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get time summary for today' })
  async getTodayTimeSummary(@GetUser() user: JwtPayload): Promise<ApiResponse<any>> {
    const summary = await this.shiftsService.getTodayTimeSummary(user.userId);
    return ApiResponseBuilder.success(summary, 'Time summary retrieved successfully');
  }

  @Get('recent-entries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get recent time entries' })
  async getRecentTimeEntries(@GetUser() user: JwtPayload): Promise<ApiResponse<any>> {
    const entries = await this.shiftsService.getRecentTimeEntries(user.userId);
    return ApiResponseBuilder.success(entries, 'Recent entries retrieved successfully');
  }

  @Get('available')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get available shifts' })
  async getAvailableShifts(
    @Query('date') date?: Date,
    @Query('time') time?: Date,
  ): Promise<ApiResponse<ShiftResponseDto[]>> {
    const shifts = await this.shiftsService.getAvailableShifts(date, time);
    return ApiResponseBuilder.success(
      shifts.map(shift => this.transformToShiftResponse(shift)),
      'Available shifts retrieved successfully'
    );
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shifts for the current user' })
  async getUserShifts(@GetUser() user: JwtPayload): Promise<ApiResponse<ShiftResponseDto[]>> {
    const shifts = await this.shiftsService.getUserShifts(user.userId);
    return ApiResponseBuilder.success(
      shifts.map(shift => this.transformToShiftResponse(shift)),
      'User shifts retrieved successfully'
    );
  }

  @Post('drop/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Drop a shift' })
  async dropShift(
    @Param('id', ParseIntPipe) shiftId: number,
    @GetUser() user: JwtPayload,
  ): Promise<ApiResponse<ShiftResponseDto>> {
    const shift = await this.shiftsService.dropShift(shiftId, user.userId);
    return ApiResponseBuilder.success(this.transformToShiftResponse(shift), 'Shift dropped successfully');
  }
}