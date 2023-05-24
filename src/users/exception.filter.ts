// import {
//   ExceptionFilter,
//   Catch,
//   ArgumentsHost,
//   HttpException,
//   ValidationPipe,
// } from '@nestjs/common';
// import { Request, Response } from 'express';
// import * as process from 'process';
//
// @Catch(HttpException)
// export class ErrorExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//     const status = exception.getStatus();
//
//     if (process.env.environment !== 'production') {
//       response
//         .status(500)
//         .send({ error: exception.toString(), stack: exception.stack });
//     } else {
//       response.status(500).send('some error occurred');
//     }
//   }
// }
//
// @Catch(HttpException)
// export class HttpExceptionFilter implements ExceptionFilter {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//     const status = exception.getStatus();
//
//     if (status === 400) {
//       // const errorResponse = {
//       //   errorsMessages: [],
//       // };
//
//       const errorResponse = {
//         errors: {
//           message: 'Wrong Email',
//           field: 'email',
//         },
//       };
//
//       // console.log(exception.getResponse());
//       //
//       // const responseBody: any = exception.getResponse();
//       // responseBody.message.forEach((m) => errorResponse.errorsMessages.push(m));
//
//       response.status(status).json(errorResponse);
//     } else {
//       response.status(status).json({
//         statusCode: status,
//         timestamp: new Date().toISOString(),
//         path: request.url,
//       });
//     }
//   }
// }
