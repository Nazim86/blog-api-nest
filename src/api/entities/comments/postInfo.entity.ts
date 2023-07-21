import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'post_info' })
export class PostInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ unique: true, type: 'varchar' })
  blogId: string;

  @Column({ type: 'varchar' })
  blogName: string;

  @Column({ unique: true, type: 'varchar' })
  blogOwnerId: string;
}
