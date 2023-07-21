import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CommentLike } from '../like/commentLike.entity';

@Entity({ name: 'comments' })
export class Comments {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar' })
  postId: string;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'varchar' })
  createdAt: string;

  @OneToMany(() => CommentLike, (cl) => cl.comment)
  commentLike: CommentLike;
}
