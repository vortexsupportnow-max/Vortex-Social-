import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('community_members')
export class CommunityMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  communityId: string;

  @Column({ default: 'member' })
  role: string;

  @CreateDateColumn()
  joinedAt: Date;
}
