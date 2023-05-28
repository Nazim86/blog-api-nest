import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import { v4 as uuid } from 'uuid';
import jwt from 'jsonwebtoken';
import { settings } from '../settings';
import { DeviceRepository } from '../securityDevices/device.repository';

@Injectable()
export class JwtService {
  constructor(
    private readonly deviceRepository: DeviceRepository, //private readonly jwtService: JwtService,
  ) {}
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
  ) {
    try {
      const decoded: any = jwt.verify(refreshToken, secretKey);
      // console.log('decoded', decoded);
      // console.log(
      //   decoded.deviceId,
      //   new Date(decoded.iat * 1000).toISOString(),
      //   decoded.userId,
      //   decoded.exp,
      // );
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

  // async testingThis() {
  //   try {
  //     return 'helloThis';
  //   } catch (e) {
  //     return 'notWelcome';
  //   }
  // }

  async checkTokenVersion(token: string) {
    // const testing = await this.testingThis();
    // console.log(testing);

    // console.log(token);
    const result = await this.getTokenMetaData(token);
    const isTokenValid: boolean = await this.deviceRepository.checkTokenVersion(
      result.deviceId,
      result.lastActiveDate,
    );
    return isTokenValid;
  }

  // async checkTokenVersion(deviceId: string, iat: number): Promise<any> {
  //   // const testing = await this.testingThis();
  //   // console.log(testing);
  //
  //   const isTokenValid: boolean = await this.deviceRepository.checkTokenVersion(
  //     deviceId,
  //     iat,
  //   );
  //   return isTokenValid;
  // }
}
