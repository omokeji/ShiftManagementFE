import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User authentication required');
    }

    if (!user.role) {
      throw new ForbiddenException('User role not assigned');
    }

    const hasRole = roles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Required role: ${roles.join(' or ')}. Your role: ${user.role}`
      );
    }

    return true;
  }
}