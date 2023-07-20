import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  // _id: ObjectId,
  @Column({ unique: true, type: 'varchar' })
  postId: string;

  @Column({ type: 'varchar' })
  content: string;

  @Column({
    type: 'varchar',
  })
  createdAt: string;
}
