import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import { settings } from '../settings';

@Injectable()
export class JwtService {
  async createJWT(
    userId: ObjectId,
    secretKey: string,
    expirationTime: string,
    deviceId: string | null = null,
  ) {
    let newDeviceId = uuid();
    if (deviceId !== null) {
      newDeviceId = deviceId;
    }

    return jwt.sign({ userId: userId, deviceId: newDeviceId }, secretKey, {
      expiresIn: expirationTime,
    });
  }

  async getTokenMetaData(
    refreshToken: string,
    secretKey: string = settings.REFRESH_TOKEN_SECRET,
  ): Promise<any> {
    try {
      const decoded: any = jwt.verify(refreshToken, secretKey);
      return {
        deviceId: decoded.deviceId,
        lastActiveDate: new Date(decoded.iat * 1000).toISOString(),
        userId: decoded.userId,
        expiration: decoded.exp,
      };
    } catch (e) {
      return null;
    }
  }
}
