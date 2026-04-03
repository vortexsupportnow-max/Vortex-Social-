import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChannelsService } from './channels.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('channels')
@Controller('communities/:communityId/channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  findAll(@Param('communityId') communityId: string) {
    return this.channelsService.findByCommunity(communityId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(@Param('communityId') communityId: string, @Body() body: { name: string; type?: string; topic?: string }, @Request() req: { user: { sub: string } }) {
    return this.channelsService.create(communityId, body, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.channelsService.delete(id, req.user.sub);
  }
}
