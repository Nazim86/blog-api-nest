import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
