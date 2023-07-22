import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostLike } from '../like/postLike.entity';
import { Comments } from '../comments/comments.entity';

@Entity({ name: 'posts' })
export class Posts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  shortDescription: string;

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'varchar' })
  blogId: string;

  @Column({ type: 'varchar' })
  blogName: string;

  @Column({ type: 'varchar' })
  createdAt: string;

  @OneToMany(() => PostLike, (pl) => pl.post)
  postLike: PostLike;

  @OneToMany(() => Comments, (c) => c.user)
  comment: Comments;
}
