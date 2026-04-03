import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

const mockPostsService = {
  getFeed: jest.fn(),
  getPost: jest.fn(),
  createPost: jest.fn(),
  deletePost: jest.fn(),
  likePost: jest.fn(),
  unlikePost: jest.fn(),
  getComments: jest.fn(),
  addComment: jest.fn(),
};

describe('PostsController', () => {
  let controller: PostsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [{ provide: PostsService, useValue: mockPostsService }],
    }).compile();
    controller = module.get<PostsController>(PostsController);
  });

  describe('getFeed', () => {
    it('should return the community feed with default pagination', async () => {
      const posts = [{ id: 'p-1' }];
      mockPostsService.getFeed.mockResolvedValue(posts);

      const result = await controller.getFeed('c-1');

      expect(mockPostsService.getFeed).toHaveBeenCalledWith('c-1', 1, 20);
      expect(result).toEqual(posts);
    });

    it('should pass parsed pagination params', async () => {
      mockPostsService.getFeed.mockResolvedValue([]);

      await controller.getFeed('c-1', '2', '10');

      expect(mockPostsService.getFeed).toHaveBeenCalledWith('c-1', 2, 10);
    });
  });

  describe('getPost', () => {
    it('should return a post by id', async () => {
      const post = { id: 'p-1' };
      mockPostsService.getPost.mockResolvedValue(post);

      const result = await controller.getPost('p-1');

      expect(mockPostsService.getPost).toHaveBeenCalledWith('p-1');
      expect(result).toEqual(post);
    });
  });

  describe('createPost', () => {
    it('should create a post for the authenticated user', async () => {
      const post = { id: 'p-1', content: 'Hello' };
      mockPostsService.createPost.mockResolvedValue(post);

      const result = await controller.createPost(
        { user: { sub: 'user-1' } },
        { communityId: 'c-1', content: 'Hello' },
      );

      expect(mockPostsService.createPost).toHaveBeenCalledWith('user-1', 'c-1', 'Hello', undefined);
      expect(result).toEqual(post);
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      mockPostsService.deletePost.mockResolvedValue(undefined);

      await controller.deletePost('p-1', { user: { sub: 'user-1' } });

      expect(mockPostsService.deletePost).toHaveBeenCalledWith('p-1', 'user-1');
    });
  });

  describe('likePost', () => {
    it('should like a post', async () => {
      mockPostsService.likePost.mockResolvedValue(undefined);

      await controller.likePost('p-1', { user: { sub: 'user-1' } });

      expect(mockPostsService.likePost).toHaveBeenCalledWith('p-1', 'user-1');
    });
  });

  describe('unlikePost', () => {
    it('should unlike a post', async () => {
      mockPostsService.unlikePost.mockResolvedValue(undefined);

      await controller.unlikePost('p-1', { user: { sub: 'user-1' } });

      expect(mockPostsService.unlikePost).toHaveBeenCalledWith('p-1', 'user-1');
    });
  });

  describe('getComments', () => {
    it('should return post comments', async () => {
      const comments = [{ id: 'cm-1' }];
      mockPostsService.getComments.mockResolvedValue(comments);

      const result = await controller.getComments('p-1');

      expect(mockPostsService.getComments).toHaveBeenCalledWith('p-1');
      expect(result).toEqual(comments);
    });
  });

  describe('addComment', () => {
    it('should add a comment to a post', async () => {
      const comment = { id: 'cm-1', content: 'Nice' };
      mockPostsService.addComment.mockResolvedValue(comment);

      const result = await controller.addComment('p-1', { user: { sub: 'user-1' } }, { content: 'Nice' });

      expect(mockPostsService.addComment).toHaveBeenCalledWith('p-1', 'user-1', 'Nice', undefined);
      expect(result).toEqual(comment);
    });
  });
});
