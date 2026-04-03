import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('comments')
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column()
  authorId: string;

  @Column()
  postId: string;

  @Column({ nullable: true })
  parentId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
