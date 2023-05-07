// import { ObjectId } from 'mongodb';
// import { HydratedDocument } from 'mongoose';
// import { UserAccountDbMethodsType } from '../../../domain/UsersEntity';
//
// export class EmailConfirmation {
//   constructor(
//     public confirmationCode: string,
//     public emailExpiration: Date,
//     public isConfirmed: boolean,
//   ) {}
// }
//
// export class AccountData {
//   constructor(
//     public login: string,
//     public passwordHash: string,
//     public email: string,
//     public createdAt: string,
//     public recoveryCode: string,
//     public recoveryCodeExpiration: Date,
//   ) {}
// }
//
// // export class UserAccountDbType  {
// //     canBeConfirmed(code: string) {
// //         throw new Error("Method not implemented.");
// //     }
// //     constructor(
// //         public _id: ObjectId,
// //         public accountData: AccountDataType,
// //         public emailConfirmation: EmailConfirmationType) {}
// // }
//
// export class UserAccount {
//   constructor(
//     public _id: ObjectId,
//     public accountData: AccountData,
//     public emailConfirmation: EmailConfirmation,
//   ) {}
//
//   // canBeConfirmed(code: string): boolean {
//   //     return this.emailConfirmation.confirmationCode !== code &&
//   //         this.emailConfirmation.emailExpiration < new Date()
//   // }
//   //
//   // confirm(code: string): void {
//   //     if(this.canBeConfirmed(code)) throw new Error("Account can't be confirm")
//   //     if (this.emailConfirmation.isConfirmed) throw new Error("Already confirmed account can't be confirmed again")
//   //     this.emailConfirmation.isConfirmed = true;
//   // }
// }
//
// //
// //
// // export type EmailConfirmationType= {
// //
// //         confirmationCode: string
// //         emailExpiration: Date
// //         isConfirmed: boolean
// // }
// //
// //
// // export type AccountDataType = {
// //          login: string
// //          passwordHash: string
// //          email: string
// //          createdAt: string
// //          recoveryCode: string
// //          recoveryCodeExpiration: Date
// // }
// //
// // export type UserAccountDbType =   {
// //          _id: ObjectId
// //          accountData: AccountDataType
// //          emailConfirmation: EmailConfirmationType
// //     canBeConfirmed(code: string): Boolean;
// //     confirm(code: string): void;
// // }
// //
//
// export type HydratedUser = HydratedDocument<
//   UserAccount,
//   UserAccountDbMethodsType
// >;
