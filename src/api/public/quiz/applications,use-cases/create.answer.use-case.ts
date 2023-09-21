import { CommandHandler } from '@nestjs/cqrs';
import { AnswersEntity } from '../../../entities/quiz/answers.entity';
import { QuizRepository } from '../../../infrastructure/quiz/quiz.repository';
import { CreateAnswerDto } from '../dto/create-answer.dto';
import { GameStatusEnum } from '../../../../enums/game-status-enum';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { AnswersEnum } from '../../../../enums/answers-enum';

export class CreateAnswerCommand {
  constructor(public userId: string, public createAnswerDto: CreateAnswerDto) {}
}

@CommandHandler(CreateAnswerCommand)
export class CreateAnswerUseCase {
  constructor(
    private readonly quizRepository: QuizRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateAnswerCommand) {
    // const player: PlayersEntity = await this.quizRepository.getPlayerByUserId(
    //   command.userId,
    // );

    // console.log(
    //   command.createAnswerDto.answer,
    //   typeof command.createAnswerDto.answer,
    // );

    const player = await this.usersRepository.findUserById(command.userId);

    const gamePair = await this.quizRepository.getGamePairByUserId(
      command.userId,
    );

    //console.log(gamePair.id);

    const answers: AnswersEntity[] =
      await this.quizRepository.getAnswerByUserIdAndGamePairId(
        command.userId,
        gamePair.id,
      );

    if (
      (gamePair && gamePair.status !== GameStatusEnum.Active) ||
      (gamePair.status === GameStatusEnum.Active && answers.length === 5)
    )
      return { code: ResultCode.Forbidden };

    let gameStatus = GameStatusEnum.Active;

    if (answers.length === 4 && gamePair.answers.length === 9) {
      gameStatus = GameStatusEnum.Finished;
    }

    let answerStatus;

    console.log('userid', player.id);
    console.log('answersLength', answers.length);
    console.log('questions', gamePair.questions[answers.length]);
    console.log('playerAnswer', command.createAnswerDto.answer);

    if (
      gamePair.questions[answers.length].correctAnswers.includes(
        command.createAnswerDto.answer,
      )
    ) {
      answerStatus = AnswersEnum.Correct;
    } else {
      answerStatus = AnswersEnum.Incorrect;
    }

    const answer: AnswersEntity = new AnswersEntity();
    answer.player = player;
    answer.question = gamePair.questions[answers.length];
    answer.addedAt = new Date().toISOString();
    answer.answerStatus = answerStatus;
    answer.gamePairs = gamePair;

    const newAnswer = await this.quizRepository.saveAnswer(answer);

    console.log(newAnswer);

    gamePair.status = gameStatus;
    gamePair.answers.push(newAnswer);

    await this.quizRepository.saveGamePair(gamePair);

    return answer;
  }
}

// if (answers.length === 4) {
//   gamePair.status = GameStatusEnum.Finished;
// }

// const questions: QuestionsEntity[] =
//   await this.questionsRepository.getQuestionsByGamePairAndUserId(
//     gamePair.id,
//     command.userId,
//   );

// for(let i=0; i<questions.length; i++) {
//   if(  questions[i].playerAnswer.id === answers[i].id)
// }

// outerLoop:for(let i = 0; i<gamePair.questions.length;i++){
//   for(let y = 0; y<gamePair.answers.length;y++){
//   if(gamePair.questions[i].id !== answers[i].question.id){
//     const answer = new AnswersEntity();
//
//     break outerLoop
//
//   }
//   }
// }

//return user;
