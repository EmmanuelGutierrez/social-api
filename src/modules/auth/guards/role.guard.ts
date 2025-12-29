import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLES_KEY } from 'src/common/constants/app/rolesKey';
import { tokenInfoI } from 'src/common/interfaces/token.interface';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const rolesData: string[] = this.reflector.get(
      ROLES_KEY,
      context.getHandler(),
    );
    if (!rolesData) return true;
    const ctx = GqlExecutionContext.create(context);

    const request = ctx.getContext().req;
    const { user }: { user: tokenInfoI } = request;

    if (!user || !rolesData.includes(user.role)) return false;

    return true;
  }
}
