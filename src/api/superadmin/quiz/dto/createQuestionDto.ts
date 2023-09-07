import { IsNotEmpty, Length } from 'class-validator';

export class CreateQuestionDto {
  @IsNotEmpty()
  @Length(10, 500)
  body: string;

  @IsNotEmpty()
  correctAnswers: string[];
}
