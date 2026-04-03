import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CommunitiesService } from './communities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('communities')
@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Get()
  findAll() {
    return this.communitiesService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.communitiesService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(@Request() req: { user: { sub: string } }, @Body() body: { name: string; slug: string; description?: string; isPrivate?: boolean }) {
    return this.communitiesService.create(body, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/join')
  join(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.communitiesService.join(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/leave')
  leave(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.communitiesService.leave(id, req.user.sub);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string) {
    return this.communitiesService.getMembers(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id/members/:userId/role')
  updateRole(@Param('id') id: string, @Param('userId') userId: string, @Body() body: { role: string }, @Request() req: { user: { sub: string } }) {
    return this.communitiesService.updateMemberRole(id, userId, body.role, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/members/:userId')
  kickMember(@Param('id') id: string, @Param('userId') userId: string, @Request() req: { user: { sub: string } }) {
    return this.communitiesService.kickMember(id, userId, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<{ name: string; description: string; iconUrl: string; bannerUrl: string; isPrivate: boolean }>, @Request() req: { user: { sub: string } }) {
    return this.communitiesService.update(id, body, req.user.sub);
  }
}
