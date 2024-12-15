import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<number[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().req.user;

    console.log('User in RolesGuard:', user);
    console.log('Required roles:', roles);

    if (!user || !roles.includes(Number(user.role_id))) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}