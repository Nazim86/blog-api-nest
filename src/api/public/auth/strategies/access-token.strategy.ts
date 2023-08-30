import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { accessTokenSecret } from '../constants';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access-token',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: accessTokenSecret.secret,
    });
  }

  async validate(payload: any) {
    return payload;

    // const user = await this.userService.findById(payload.sub)
    // return { userId: payload.sub, username: payload.username };
  }
}
