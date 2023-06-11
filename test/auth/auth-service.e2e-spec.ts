import { Test } from '@nestjs/testing';

import { AppModule } from '../../src/app.module';
import { AuthService } from '../../src/api/public/auth/auth.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { UsersService } from '../../src/api/superadmin/users/application,use-cases/users.service';
describe('integration tests for AuthService', () => {
  // let catsController: CatsController;
  let authService: AuthService;
  let userService: UsersService;
  let mongoServer: MongoMemoryServer;

  beforeEach(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    // catsController = moduleRef.get<CatsController>(CatsController);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    // await mongoServer.stop();
  });

  describe('createUser', () => {
    beforeAll(async () => {
      await mongoose.connection.db.dropDatabase();
    });
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
