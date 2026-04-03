import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('channels')
export class ChannelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: 'text' })
  type: string;

  @Column()
  communityId: string;

  @Column({ nullable: true })
  topic?: string;

  @CreateDateColumn()
  createdAt: Date;
}
