import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityEntity } from './community.entity';
import { CommunityMemberEntity } from './community-member.entity';

@Injectable()
export class CommunitiesService {
  constructor(
    @InjectRepository(CommunityEntity)
    private readonly communityRepo: Repository<CommunityEntity>,
    @InjectRepository(CommunityMemberEntity)
    private readonly memberRepo: Repository<CommunityMemberEntity>,
  ) {}

  async create(data: Partial<CommunityEntity>, ownerId: string): Promise<CommunityEntity> {
    const community = this.communityRepo.create({ ...data, ownerId });
    const saved = await this.communityRepo.save(community);
    await this.memberRepo.save(this.memberRepo.create({ userId: ownerId, communityId: saved.id, role: 'admin' }));
    return saved;
  }

  async findAll(): Promise<CommunityEntity[]> {
    return this.communityRepo.find({ where: { isPrivate: false } });
  }

  async findById(id: string): Promise<CommunityEntity> {
    const c = await this.communityRepo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Community not found');
    return c;
  }

  async findBySlug(slug: string): Promise<CommunityEntity> {
    const c = await this.communityRepo.findOne({ where: { slug } });
    if (!c) throw new NotFoundException('Community not found');
    return c;
  }

  async join(communityId: string, userId: string): Promise<void> {
    const existing = await this.memberRepo.findOne({ where: { communityId, userId } });
    if (!existing) {
      await this.memberRepo.save(this.memberRepo.create({ communityId, userId, role: 'member' }));
    }
  }

  async leave(communityId: string, userId: string): Promise<void> {
    await this.memberRepo.delete({ communityId, userId });
  }

  async getMembers(communityId: string): Promise<CommunityMemberEntity[]> {
    return this.memberRepo.find({ where: { communityId } });
  }

  async getMemberRole(communityId: string, userId: string): Promise<string | null> {
    const m = await this.memberRepo.findOne({ where: { communityId, userId } });
    return m?.role ?? null;
  }

  async updateMemberRole(communityId: string, targetUserId: string, role: string, requesterId: string): Promise<void> {
    const requesterRole = await this.getMemberRole(communityId, requesterId);
    if (requesterRole !== 'admin') throw new ForbiddenException('Only admins can update roles');
    await this.memberRepo.update({ communityId, userId: targetUserId }, { role });
  }

  async kickMember(communityId: string, targetUserId: string, requesterId: string): Promise<void> {
    const requesterRole = await this.getMemberRole(communityId, requesterId);
    if (!['admin', 'moderator'].includes(requesterRole ?? '')) throw new ForbiddenException('Insufficient permissions');
    await this.memberRepo.delete({ communityId, userId: targetUserId });
  }

  async update(id: string, data: Partial<CommunityEntity>, requesterId: string): Promise<CommunityEntity> {
    const community = await this.findById(id);
    if (community.ownerId !== requesterId) throw new ForbiddenException('Only the owner can update this community');
    await this.communityRepo.update(id, data);
    return this.findById(id);
  }
}
