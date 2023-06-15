// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { MongoMemoryServer } from 'mongodb-memory-server';
//
// let mongod: MongoMemoryServer;
//
// @Module({
//   imports: [
//     MongooseModule.forRootAsync({
//       useFactory: async () => {
//         mongod = await MongoMemoryServer.create();
//         const mongoUri = mongod.getUri();
//
//         return {
//           uri: mongoUri,
//           useNewUrlParser: true,
//           useUnifiedTopology: true,
//           useCreateIndex: true,
//         };
//       },
//     }),
//   ],
// })
// export class TestDatabaseModule {}

import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export const rootMongooseTestModule = (options: MongooseModuleOptions = {}) =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      // mongoServer = await MongoMemoryServer.create();
      // const mongoUri = mongoServer.getUri();
      // await mongoose.connect(mongoUri);
      mongod = await MongoMemoryServer.create(); //new MongoMemoryServer();
      const mongoUri = mongod.getUri();
      return {
        uri: mongoUri,
        ...options,
      };
    },
  });

export const closeInMongodConnection = async () => {
  if (mongod) await mongod.stop();
};
