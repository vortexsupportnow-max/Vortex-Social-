import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column()
  authorId: string;

  @Column({ nullable: true })
  channelId?: string;

  @Column({ nullable: true })
  dmRecipientId?: string;

  @CreateDateColumn()
  createdAt: Date;
}
