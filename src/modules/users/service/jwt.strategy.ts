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
    
    console.log("JwtStrategy initialized with secret:", "JWT_SECRET");
  }

  async validate(payload: any) {
    console.log("Validating payload:", payload);
    return { id: payload.id };
  }
}
