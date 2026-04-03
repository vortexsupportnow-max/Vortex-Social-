import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from './post.entity';
import { CommentEntity } from './comment.entity';
import { PostLikeEntity } from './post-like.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(PostEntity) private readonly postRepo: Repository<PostEntity>,
    @InjectRepository(CommentEntity) private readonly commentRepo: Repository<CommentEntity>,
    @InjectRepository(PostLikeEntity) private readonly likeRepo: Repository<PostLikeEntity>,
  ) {}

  async createPost(authorId: string, communityId: string, content: string, mediaUrls?: string[]): Promise<PostEntity> {
    return this.postRepo.save(this.postRepo.create({ authorId, communityId, content, mediaUrls: mediaUrls ?? [] }));
  }

  async getFeed(communityId: string, page = 1, limit = 20): Promise<PostEntity[]> {
    return this.postRepo.find({
      where: { communityId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  async getPost(id: string): Promise<PostEntity> {
    const post = await this.postRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async deletePost(id: string, userId: string): Promise<void> {
    const post = await this.getPost(id);
    if (post.authorId !== userId) throw new NotFoundException('Post not found');
    await this.postRepo.delete(id);
  }

  async likePost(postId: string, userId: string): Promise<void> {
    const existing = await this.likeRepo.findOne({ where: { postId, userId } });
    if (!existing) {
      await this.likeRepo.save(this.likeRepo.create({ postId, userId }));
      await this.postRepo.increment({ id: postId }, 'likesCount', 1);
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const existing = await this.likeRepo.findOne({ where: { postId, userId } });
    if (existing) {
      await this.likeRepo.delete({ postId, userId });
      await this.postRepo.decrement({ id: postId }, 'likesCount', 1);
    }
  }

  async addComment(postId: string, authorId: string, content: string, parentId?: string): Promise<CommentEntity> {
    const comment = await this.commentRepo.save(this.commentRepo.create({ postId, authorId, content, parentId }));
    await this.postRepo.increment({ id: postId }, 'commentsCount', 1);
    return comment;
  }

  async getComments(postId: string): Promise<CommentEntity[]> {
    return this.commentRepo.find({ where: { postId }, order: { createdAt: 'ASC' } });
  }
}
