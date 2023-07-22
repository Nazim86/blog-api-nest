import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommentLike } from '../like/commentLike.entity';
import { Users } from '../users/user.entity';
import { Posts } from '../posts/posts.entity';

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

  @ManyToOne(() => Users, (u) => u.comment, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Users;

  @ManyToOne(() => Posts, (p) => p.comment, { onDelete: 'CASCADE' })
  @JoinColumn()
  post: Posts;
}
