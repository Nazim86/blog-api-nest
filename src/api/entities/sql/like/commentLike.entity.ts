import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'comment_like' })
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar' })
  commentId: string;

  @Column({ unique: true, type: 'varchar' })
  userId: string;

  @Column({ type: 'timestamp without time zone' })
  addedAt: Date;

  @Column({ type: 'varchar' })
  status: string;

  @Column('boolean')
  banStatus: boolean;
}
