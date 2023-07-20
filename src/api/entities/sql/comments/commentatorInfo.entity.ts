import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'commentator_info' })
export class CommentatorInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar' })
  userId: string;

  @Column({ unique: true, type: 'varchar' })
  userLogin: string;

  @Column({ type: 'boolean' })
  isBanned: boolean;
}
