import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

/**
 * SchoolScopeGuard — enforces single-tenant access for school-scoped roles.
 *
 * Applies to: SCHOOL_ADMIN, TEACHER, STUDENT. These users have exactly one
 * schoolId in their JWT. If the request mentions a different schoolId
 * (in params/query/body), it is rejected with 403.
 *
 * PARENT is multi-school and skipped here — parent endpoints must validate
 * the parent has a relationship to the target school inside the service.
 *
 * CREATOR and MASTER are global; skipped.
 *
 * Use AFTER JwtAuthGuard so req.user is populated.
 */
@Injectable()
export class SchoolScopeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('Unauthenticated');
    }

    const type = String(user.type || '').toUpperCase();
    const isSingleSchoolRole = ['SCHOOL_ADMIN', 'TEACHER', 'STUDENT'].includes(
      type,
    );

    if (!isSingleSchoolRole) {
      return true;
    }

    if (!user.schoolId) {
      throw new ForbiddenException(
        'User has no school association; access denied',
      );
    }

    const requestedSchoolId =
      req.params?.schoolId ||
      req.query?.schoolId ||
      req.body?.schoolId ||
      undefined;

    if (requestedSchoolId && requestedSchoolId !== user.schoolId) {
      throw new ForbiddenException(
        'Cross-school access denied',
      );
    }

    return true;
  }
}
