import { Test } from '@nestjs/testing';

import { AppModule } from '../../src/app.module';
import { AuthService } from '../../src/api/public/auth/auth.service';

import { INestApplication } from '@nestjs/common';
import mongoose from 'mongoose';
import { UsersRepository } from '../../src/api/superadmin/users/infrastructure/users.repository';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../src/mail/mail.service';
describe('integration tests for AuthService', () => {
  let authService: AuthService;
  let userRepository: UsersRepository;
  let jwtService: JwtService;
  let mailService: MailService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AuthService, UsersRepository, JwtService, MailService],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    userRepository = moduleRef.get<UsersRepository>(UsersRepository);
    jwtService = moduleRef.get<JwtService>(JwtService);
    mailService = moduleRef.get<MailService>(MailService);

    // authService = new AuthService();
  });

  // afterAll(async () => {
  //   await mongoose.close();
  // });

  describe('createUser', () => {
    it('should return created user', async () => {
      const result = await authService.createNewUser({
        login: 'leo',
        password: '123456',
        email: 'leo@mail.ru',
      });
      // jest.spyOn(authService, 'findUserById').mockImplementation(() => result);

      expect(result.accountData.login).toBe('leo');
    });
  });
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { MailService } from '../../src/mail/mail.service';
//
// describe('MailService', () => {
//   let service: MailService;
//
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [MailService],
//     }).compile();
//
//     service = module.get<MailService>(MailService);
//   });
//
//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });
