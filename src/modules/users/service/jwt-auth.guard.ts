import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
    console.log('JwtAuthGuard initialized');
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      console.log('JwtAuthGuard handleRequest error:', err, info);
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
