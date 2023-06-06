import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { refreshTokenSecret } from '../constants';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor() {
    super({
      ignoreExpiration: false,
      secretOrKey: refreshTokenSecret.secret,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request.cookies['refreshToken'];
          if (!token) {
            return null;
          }
          return token;
        },
      ]),
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException();
    }
    return payload;
  }
}

// async validate(payload: any) {
//   // const user = await this.userService.findById(payload.sub)
//   // return { userId: payload.sub, username: payload.username };
//   // return { id: payload.sub };
//   return { payload: payload };
// }
