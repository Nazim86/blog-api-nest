import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserService } from './users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(protected userService: UserService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // return validateRequest(request);
    console.log(this.userService);
    console.log(request.headers.authorization);
    // throw new UnauthorizedException();
    return true;
  }
}
