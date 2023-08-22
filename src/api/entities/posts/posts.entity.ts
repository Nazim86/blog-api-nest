import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostLike } from '../like/postLike.entity';
import { Comments } from '../comments/comments.entity';
import { Blogs } from '../blogs/blogs.entity';

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

  // @Column({ type: 'uuid' })
  // blogId: string;
  //
  // @Column({ type: 'varchar' })
  // blogName: string;

  @ManyToOne(() => Blogs, (b) => b.post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blog' })
  blog: Blogs;

  @Column({ type: 'varchar' })
  createdAt: string;

  @OneToMany(() => PostLike, (pl) => pl.post)
  postLike: PostLike;

  @OneToMany(() => Comments, (c) => c.post)
  comment: Comments;
}
