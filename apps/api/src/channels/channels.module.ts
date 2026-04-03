import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelEntity } from './channel.entity';
import { ChannelsService } from './channels.service';
import { ChannelsController } from './channels.controller';
import { CommunitiesModule } from '../communities/communities.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelEntity]), CommunitiesModule],
  providers: [ChannelsService],
  controllers: [ChannelsController],
  exports: [ChannelsService],
})
export class ChannelsModule {}
