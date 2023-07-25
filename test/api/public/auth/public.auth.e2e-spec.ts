import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { appSettings } from '../../../../src/app.settings';
import { AppModule } from '../../../../src/app.module';
import {
  banUserBySA,
  creatingUser,
  getCurrentUser,
  loginUser,
  logout,
  newRefreshToken,
  passwordRecovery,
  registrationConfirmation,
  resendRegistrationEmail,
  setNewPassword,
  userRegistration,
} from '../../../functions/user_functions';
import {
  createUserDto,
  emailDto,
  loginDto,
  userBanDto,
} from '../../../data/user-data';
import { UsersRepository } from '../../../../src/api/infrastructure/users/users.repository';
import { JwtService } from '../../../../src/jwt/jwt.service';

describe('Auth controller testing', () => {
  let app: INestApplication;
  let httpServer;
  let usersRepository: UsersRepository;
  let confirmationCode;
  let refreshToken;
  let userSignIn;
  let user;
  let accessToken;
  let jwtService: JwtService;

  jest.setTimeout(60 * 1000);
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app = appSettings(app);

    await app.init();

    httpServer = app.getHttpServer();

    usersRepository = app.get(UsersRepository);
    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe(
    'User registration,registration confirmation,resend registration email,' +
      'password recovery,set new password,logout, get current user ',
    () => {
      it('should wipe all data in db', async () => {
        const response = await request(httpServer).delete('/testing/all-data');
        expect(response.status).toBe(204);
      });

      it(`should create new user and send confirmation email with code; status 204;`, async () => {
        const result = await userRegistration(httpServer, createUserDto);
        expect(result.status).toBe(204);
      });

      it(`should send email with new code if user exists 
      but not confirmed yet; status 204`, async () => {
        user = await usersRepository.findUserByLoginOrEmail(`leo`);

        const confirmationCodeBefore = user.confirmationCode;

        const result = await resendRegistrationEmail(httpServer, emailDto);
        expect(result.status).toBe(204);

        user = await usersRepository.findUserByLoginOrEmail(`leo`);
        confirmationCode = user.confirmationCode;

        expect(confirmationCodeBefore).not.toEqual(confirmationCode);
      });

      it(`should confirm registration by email; status 204;`, async () => {
        const result = await registrationConfirmation(httpServer, {
          code: confirmationCode,
        });
        expect(result.status).toBe(204);

        const user = await usersRepository.findUserByLoginOrEmail(`leo`);

        expect(user.isConfirmed).toBe(true);
      });

      it(`should return error if code already confirmed; status 400;`, async () => {
        const result = await registrationConfirmation(httpServer, {
          code: confirmationCode,
        });
        expect(result.status).toBe(400);
      });

      it(`should return error if email already confirmed; status 400;`, async () => {
        const result = await resendRegistrationEmail(httpServer, emailDto);
        expect(result.status).toBe(400);
      });

      it(`should login user; status 200; content: JWT token;;`, async () => {
        userSignIn = await loginUser(httpServer, loginDto);
        refreshToken = userSignIn.headers['set-cookie'][0];
        accessToken = userSignIn.body.accessToken;

        expect(userSignIn.status).toBe(200);
        expect(accessToken).toBeDefined();
        expect(refreshToken).toContain('refreshToken=');
      });

      it(`should refresh JWT token and return 200;`, async () => {
        const oldRefreshToken = userSignIn.headers['set-cookie'][0];

        const getNewRefreshToken = await newRefreshToken(
          httpServer,
          oldRefreshToken,
        );
        //refreshToken = result.body;
        refreshToken = getNewRefreshToken.headers['set-cookie'][0];
        expect(userSignIn.status).toBe(200);
        expect(getNewRefreshToken).not.toEqual(oldRefreshToken);
      });

      it(`should send email with password recovery code and link and return 204;`, async () => {
        const result = await passwordRecovery(httpServer, emailDto);
        expect(result.status).toBe(204);
      });

      it(`should set new password and return 204;`, async () => {
        user = await usersRepository.findUserByLoginOrEmail(`leo`);
        const recoveryCode = user.recoveryCode;

        const result = await setNewPassword(httpServer, {
          newPassword: '1234567',
          recoveryCode: recoveryCode,
        });
        expect(result.status).toBe(204);

        userSignIn = await loginUser(httpServer, {
          ...loginDto,
          password: '1234567',
        });

        refreshToken = userSignIn.headers['set-cookie'][0];
        const accessToken = userSignIn.body;

        expect(userSignIn.status).toBe(200);
        expect(accessToken).toBeDefined();
        expect(refreshToken).toContain('refreshToken=');
      });

      it(`should not login with old password and return 400;`, async () => {
        const userSignIn = await loginUser(httpServer, {
          ...loginDto,
          password: '123456',
        });
        expect(userSignIn.status).toBe(401);
        expect(userSignIn.body.accessToken).not.toBeDefined();
      });

      it(`should not login banned user;`, async () => {
        await banUserBySA(httpServer, user.id, userBanDto);

        const userSignIn = await loginUser(httpServer, {
          ...loginDto,
          password: '1234567',
        });
        expect(userSignIn.status).toBe(401);
        expect(userSignIn.body.accessToken).not.toBeDefined();
      });

      it(`should get current user and return 200 ;`, async () => {
        const currentUser = await getCurrentUser(httpServer, accessToken);
        expect(currentUser.status).toBe(200);
        expect(currentUser.body.login).toEqual('leo');
        expect(currentUser.body.email).toEqual('nazim86mammadov@yandex.ru');
      });

      it(`should logout and return 200 ;`, async () => {
        await creatingUser(httpServer, {
          ...createUserDto,
          login: 'leonid',
          email: 'nazim86mammadovsdfsd@yandex.ru',
        });

        userSignIn = await loginUser(httpServer, {
          ...loginDto,
          loginOrEmail: 'leonid',
        });

        refreshToken = userSignIn.headers['set-cookie'][0];

        const result = await logout(httpServer, refreshToken);
        const isTokenValid = await jwtService.getTokenMetaData(refreshToken);
        expect(result.status).toBe(204);
        expect(isTokenValid).toBe(null);
      });
    },
  );
});
