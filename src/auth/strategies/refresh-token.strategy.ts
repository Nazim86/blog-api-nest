import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { refreshTokenSecret } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      ignoreExpiration: false,
      secretOrKey: refreshTokenSecret.secret,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request?.cookies['refreshToken'];
          if (!data) {
            return null;
          }
          return data.token;
        },
      ]),
    });
  }

  async validate(payload: any) {
    // const user = await this.userService.findById(payload.sub)
    // return { userId: payload.sub, username: payload.username };
    // return { id: payload.sub };
    return { payload: payload };
  }
}
//   async validate(payload:any){
//     if(payload === null){
//       throw new UnauthorizedException();
//     }
//     return payload;
//   }
