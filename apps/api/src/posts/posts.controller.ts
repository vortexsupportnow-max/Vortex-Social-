import { Controller, Get, Post, Delete, Param, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get('feed/:communityId')
  getFeed(@Param('communityId') communityId: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.postsService.getFeed(communityId, Number(page ?? 1), Number(limit ?? 20));
  }

  @Get(':id')
  getPost(@Param('id') id: string) {
    return this.postsService.getPost(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  createPost(@Request() req: { user: { sub: string } }, @Body() body: { communityId: string; content: string; mediaUrls?: string[] }) {
    return this.postsService.createPost(req.user.sub, body.communityId, body.content, body.mediaUrls);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  deletePost(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.postsService.deletePost(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/like')
  likePost(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.postsService.likePost(id, req.user.sub);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id/like')
  unlikePost(@Param('id') id: string, @Request() req: { user: { sub: string } }) {
    return this.postsService.unlikePost(id, req.user.sub);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.postsService.getComments(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':id/comments')
  addComment(@Param('id') id: string, @Request() req: { user: { sub: string } }, @Body() body: { content: string; parentId?: string }) {
    return this.postsService.addComment(id, req.user.sub, body.content, body.parentId);
  }
}
