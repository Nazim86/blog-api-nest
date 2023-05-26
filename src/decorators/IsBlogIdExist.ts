import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogRepository } from '../blogs/infrastructure/blog.repository';

@ValidatorConstraint({ name: 'IsBlogAlreadyExist', async: true })
@Injectable()
export class IsBlogExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogRepository) {}
  async validate(blogId: string) {
    const blog = await this.blogsRepository.getBlogById(blogId);

    if (!blog) {
      return false;
    }
    return true;
  }
}

export const IsBlogAlreadyExist =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsBlogExistConstraint,
    });
  };
