import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostEntity } from './post.entity';
import { CommentEntity } from './comment.entity';
import { PostLikeEntity } from './post-like.entity';

const mockPostRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  increment: jest.fn(),
  decrement: jest.fn(),
};

const mockCommentRepo = {
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockLikeRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        { provide: getRepositoryToken(PostEntity), useValue: mockPostRepo },
        { provide: getRepositoryToken(CommentEntity), useValue: mockCommentRepo },
        { provide: getRepositoryToken(PostLikeEntity), useValue: mockLikeRepo },
      ],
    }).compile();
    service = module.get<PostsService>(PostsService);
  });

  describe('createPost', () => {
    it('should create and return a post', async () => {
      const post = { id: 'p-1', authorId: 'user-1', communityId: 'c-1', content: 'Hello' };
      mockPostRepo.create.mockReturnValue(post);
      mockPostRepo.save.mockResolvedValue(post);

      const result = await service.createPost('user-1', 'c-1', 'Hello');

      expect(mockPostRepo.create).toHaveBeenCalledWith({
        authorId: 'user-1',
        communityId: 'c-1',
        content: 'Hello',
        mediaUrls: [],
      });
      expect(result).toEqual(post);
    });

    it('should include mediaUrls when provided', async () => {
      const post = { id: 'p-1', mediaUrls: ['http://img'] };
      mockPostRepo.create.mockReturnValue(post);
      mockPostRepo.save.mockResolvedValue(post);

      await service.createPost('user-1', 'c-1', 'Hello', ['http://img']);

      expect(mockPostRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ mediaUrls: ['http://img'] }),
      );
    });
  });

  describe('getFeed', () => {
    it('should return paginated posts for a community', async () => {
      const posts = [{ id: 'p-1' }, { id: 'p-2' }];
      mockPostRepo.find.mockResolvedValue(posts);

      const result = await service.getFeed('c-1', 1, 20);

      expect(mockPostRepo.find).toHaveBeenCalledWith({
        where: { communityId: 'c-1' },
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 20,
      });
      expect(result).toEqual(posts);
    });

    it('should calculate correct skip for page 2', async () => {
      mockPostRepo.find.mockResolvedValue([]);

      await service.getFeed('c-1', 2, 10);

      expect(mockPostRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 }),
      );
    });
  });

  describe('getPost', () => {
    it('should return a post when found', async () => {
      const post = { id: 'p-1' };
      mockPostRepo.findOne.mockResolvedValue(post);

      const result = await service.getPost('p-1');

      expect(result).toEqual(post);
    });

    it('should throw NotFoundException when post does not exist', async () => {
      mockPostRepo.findOne.mockResolvedValue(null);

      await expect(service.getPost('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deletePost', () => {
    it('should delete a post when user is the author', async () => {
      const post = { id: 'p-1', authorId: 'user-1' };
      mockPostRepo.findOne.mockResolvedValue(post);
      mockPostRepo.delete.mockResolvedValue(undefined);

      await service.deletePost('p-1', 'user-1');

      expect(mockPostRepo.delete).toHaveBeenCalledWith('p-1');
    });

    it('should throw NotFoundException when user is not the author', async () => {
      const post = { id: 'p-1', authorId: 'user-1' };
      mockPostRepo.findOne.mockResolvedValue(post);

      await expect(service.deletePost('p-1', 'other-user')).rejects.toThrow(NotFoundException);
    });
  });

  describe('likePost', () => {
    it('should like a post when not already liked', async () => {
      mockLikeRepo.findOne.mockResolvedValue(null);
      mockLikeRepo.create.mockReturnValue({ postId: 'p-1', userId: 'user-1' });
      mockLikeRepo.save.mockResolvedValue({});
      mockPostRepo.increment.mockResolvedValue(undefined);

      await service.likePost('p-1', 'user-1');

      expect(mockLikeRepo.save).toHaveBeenCalled();
      expect(mockPostRepo.increment).toHaveBeenCalledWith({ id: 'p-1' }, 'likesCount', 1);
    });

    it('should not like a post that is already liked', async () => {
      mockLikeRepo.findOne.mockResolvedValue({ postId: 'p-1', userId: 'user-1' });

      await service.likePost('p-1', 'user-1');

      expect(mockLikeRepo.save).not.toHaveBeenCalled();
      expect(mockPostRepo.increment).not.toHaveBeenCalled();
    });
  });

  describe('unlikePost', () => {
    it('should unlike a post when currently liked', async () => {
      mockLikeRepo.findOne.mockResolvedValue({ postId: 'p-1', userId: 'user-1' });
      mockLikeRepo.delete.mockResolvedValue(undefined);
      mockPostRepo.decrement.mockResolvedValue(undefined);

      await service.unlikePost('p-1', 'user-1');

      expect(mockLikeRepo.delete).toHaveBeenCalledWith({ postId: 'p-1', userId: 'user-1' });
      expect(mockPostRepo.decrement).toHaveBeenCalledWith({ id: 'p-1' }, 'likesCount', 1);
    });

    it('should do nothing when post is not liked', async () => {
      mockLikeRepo.findOne.mockResolvedValue(null);

      await service.unlikePost('p-1', 'user-1');

      expect(mockLikeRepo.delete).not.toHaveBeenCalled();
      expect(mockPostRepo.decrement).not.toHaveBeenCalled();
    });
  });

  describe('addComment', () => {
    it('should add a comment and increment comments count', async () => {
      const comment = { id: 'cm-1', postId: 'p-1', content: 'Nice post' };
      mockCommentRepo.create.mockReturnValue(comment);
      mockCommentRepo.save.mockResolvedValue(comment);
      mockPostRepo.increment.mockResolvedValue(undefined);

      const result = await service.addComment('p-1', 'user-1', 'Nice post');

      expect(mockPostRepo.increment).toHaveBeenCalledWith({ id: 'p-1' }, 'commentsCount', 1);
      expect(result).toEqual(comment);
    });

    it('should support nested comments via parentId', async () => {
      const comment = { id: 'cm-2', parentId: 'cm-1' };
      mockCommentRepo.create.mockReturnValue(comment);
      mockCommentRepo.save.mockResolvedValue(comment);
      mockPostRepo.increment.mockResolvedValue(undefined);

      await service.addComment('p-1', 'user-1', 'Reply', 'cm-1');

      expect(mockCommentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ parentId: 'cm-1' }),
      );
    });
  });

  describe('getComments', () => {
    it('should return comments ordered by creation date', async () => {
      const comments = [{ id: 'cm-1' }, { id: 'cm-2' }];
      mockCommentRepo.find.mockResolvedValue(comments);

      const result = await service.getComments('p-1');

      expect(mockCommentRepo.find).toHaveBeenCalledWith({
        where: { postId: 'p-1' },
        order: { createdAt: 'ASC' },
      });
      expect(result).toEqual(comments);
    });
  });
});
