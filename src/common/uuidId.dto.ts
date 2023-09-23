import { IsUUID } from 'class-validator';

export class UuidIdDto {
  @IsUUID()
  id: string;
}
