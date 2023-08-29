import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    console.log(payload);
    console.log('iat', new Date(payload.iat * 1000));
    console.log('exp', new Date(payload.exp * 1000));

    console.log('date now', new Date());
    if (!payload) {
      throw new UnauthorizedException();
    }
    return payload;

    // const user = await this.userService.findById(payload.sub)
    // return { userId: payload.sub, username: payload.username };
  }
}
