import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // You can throw an error based on either "info" or "err" arguments
    if (err || !user) {
      if (info?.message === 'jwt expired') {
        throw new UnauthorizedException('Your session has expired. Please sign in again.');
      } else if (info?.message === 'invalid token') {
        throw new UnauthorizedException('Invalid authentication token.');
      } else if (info?.message === 'jwt malformed') {
        throw new UnauthorizedException('Invalid token format.');
      } else if (info?.message === 'no auth token') {
        throw new UnauthorizedException('Authentication token is missing.');
      }
      throw new UnauthorizedException('You are not authorized to access this resource.');
    }
    return user;
  }
}