import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUserPayload {
  userId: string;
  email: string;
  name: string;
  organizationId?: string;
  role?: string;
  permissions: string[];
  isSuperAdmin: boolean;
  is2faVerified: boolean;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUserPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthenticatedUserPayload }>();
    return request.user;
  },
);
