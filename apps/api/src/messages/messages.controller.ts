import { Controller, Get, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('channel/:channelId')
  getChannelMessages(@Param('channelId') channelId: string, @Query('limit') limit?: string) {
    return this.messagesService.getChannelMessages(channelId, Number(limit ?? 50));
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('dm/:userId')
  getDMs(@Param('userId') userId: string, @Request() req: { user: { sub: string } }, @Query('limit') limit?: string) {
    return this.messagesService.getDMs(req.user.sub, userId, Number(limit ?? 50));
  }
}
