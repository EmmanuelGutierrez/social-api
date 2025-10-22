import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') implements IAuthGuard {
  constructor(private reflector: Reflector) {
    super();
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;

    return request;
  }

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get(IS_PUBLIC_KEY, context.getHandler());

    // console.log('1', context.getArgs());

    if (isPublic) return true;
    await super.canActivate(context);
    const ctx = GqlExecutionContext.create(context);

    const request = ctx.getContext().req;
    const { user } = request;
    if (!user) throw new UnauthorizedException('no auth');

    return user ? true : false;
  }
}
