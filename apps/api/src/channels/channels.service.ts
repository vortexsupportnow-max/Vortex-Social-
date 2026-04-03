import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelEntity } from './channel.entity';
import { CommunitiesService } from '../communities/communities.service';

@Injectable()
export class ChannelsService {
  constructor(
    @InjectRepository(ChannelEntity)
    private readonly repo: Repository<ChannelEntity>,
    private readonly communitiesService: CommunitiesService,
  ) {}

  async findByCommunity(communityId: string): Promise<ChannelEntity[]> {
    return this.repo.find({ where: { communityId } });
  }

  async findById(id: string): Promise<ChannelEntity> {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Channel not found');
    return c;
  }

  async create(communityId: string, data: Partial<ChannelEntity>, requesterId: string): Promise<ChannelEntity> {
    const role = await this.communitiesService.getMemberRole(communityId, requesterId);
    if (!['admin', 'moderator'].includes(role ?? '')) throw new ForbiddenException('Insufficient permissions');
    return this.repo.save(this.repo.create({ ...data, communityId }));
  }

  async delete(id: string, requesterId: string): Promise<void> {
    const channel = await this.findById(id);
    const role = await this.communitiesService.getMemberRole(channel.communityId, requesterId);
    if (!['admin', 'moderator'].includes(role ?? '')) throw new ForbiddenException('Insufficient permissions');
    await this.repo.delete(id);
  }
}
