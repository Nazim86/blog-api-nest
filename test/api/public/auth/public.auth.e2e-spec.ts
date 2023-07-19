import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { appSettings } from '../../../../src/app.settings';
import { AppModule } from '../../../../src/app.module';
import {
  loginUser,
  newRefreshToken,
  registrationConfirmation,
  resendRegistrationEmail,
  userRegistration,
} from '../../../functions/user_functions';
import { createUserDto, emailDto, loginDto } from '../../../data/user-data';
import { UsersRepository } from '../../../../src/api/infrastructure/users/users.repository';

describe('Auth controller testing', () => {
  let app: INestApplication;
  let httpServer;
  const countOfUsers = 5;
  const users = [];
  let usersRepository: UsersRepository;
  let confirmationCode;
  let refreshToken;
  let userSignIn;

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
        let user = await usersRepository.findUserByLoginOrEmail(`leo`);
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

      it(`should sign in user; status 200; content: JWT token;;`, async () => {
        userSignIn = await loginUser(httpServer, loginDto);
        //refreshToken = result.body;
        expect(userSignIn.status).toBe(200);
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
    },
  );
});