import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

const { JWT_SECRET } = process.env;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });

    console.log('JwtStrategy initialized with secret:', 'JWT_SECRET');
  }

  async validate(payload: any) {
    return { id: payload.id, role: payload.role };
  }
}
