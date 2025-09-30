export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export class ApiResponseBuilder {
  static success<T>(data: T, message: string = 'Operation successful'): ApiResponse<T> {
    return {
      status: true,
      message,
      data,
    };
  }

  static error<T>(message: string = 'Operation failed', data?: T): ApiResponse<T> {
    return {
      status: false,
      message,
      data: data as T,
    };
  }
} 