export interface TimeEntry {
  shiftId: number;
  title: string;
  type: string;
  clockIn: Date;
  clockOut?: Date;
  duration: number;
  note?: string;
  date?: Date;
}

export interface ShiftResponseDto {
  id: number;
  title: string;
  type: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: string;
  maxEmployees: number;
  currentEmployees: number;
}

export interface DetailedShiftResponseDto extends ShiftResponseDto {
  description?: string;
  requiredSkills: string;
  breakDuration: number;
  jobId: number;
} 