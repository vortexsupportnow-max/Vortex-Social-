import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getAll(@Request() req: { user: { sub: string } }) {
    return this.notificationsService.getForUser(req.user.sub);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.notificationsService.markRead(id, req.user.sub);
  }

  @Patch('read-all')
  markAllRead(@Request() req: { user: { sub: string } }) {
    return this.notificationsService.markAllRead(req.user.sub);
  }
}
