import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityEntity } from './community.entity';
import { CommunityMemberEntity } from './community-member.entity';
import { CommunitiesService } from './communities.service';
import { CommunitiesController } from './communities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityEntity, CommunityMemberEntity])],
  providers: [CommunitiesService],
  controllers: [CommunitiesController],
  exports: [CommunitiesService],
})
export class CommunitiesModule {}
