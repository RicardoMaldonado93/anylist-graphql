import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/entities/user.entity';
import { ValidRoles } from '../enums/valid-roles.enums';

export const CurrentUser = createParamDecorator(
  (roles: (keyof typeof ValidRoles)[] = [], context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const user: User = ctx.getContext().req.user;

    if (!user) throw new InternalServerErrorException('No user inside request');

    if (roles.length === 0) return user;

    for (const role of user.roles) {
      if (roles.includes(role as keyof typeof ValidRoles)) return user;
    }

    throw new ForbiddenException('insufficient permissions.');
  },
);
