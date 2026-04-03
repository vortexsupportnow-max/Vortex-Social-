import { Test, TestingModule } from '@nestjs/testing';
import { CommunitiesController } from './communities.controller';
import { CommunitiesService } from './communities.service';

const mockCommunitiesService = {
  findAll: jest.fn(),
  findBySlug: jest.fn(),
  create: jest.fn(),
  join: jest.fn(),
  leave: jest.fn(),
  getMembers: jest.fn(),
  updateMemberRole: jest.fn(),
  kickMember: jest.fn(),
  update: jest.fn(),
};

describe('CommunitiesController', () => {
  let controller: CommunitiesController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunitiesController],
      providers: [{ provide: CommunitiesService, useValue: mockCommunitiesService }],
    }).compile();
    controller = module.get<CommunitiesController>(CommunitiesController);
  });

  describe('findAll', () => {
    it('should return all communities', async () => {
      const communities = [{ id: 'c-1' }];
      mockCommunitiesService.findAll.mockResolvedValue(communities);

      const result = await controller.findAll();

      expect(mockCommunitiesService.findAll).toHaveBeenCalled();
      expect(result).toEqual(communities);
    });
  });

  describe('findOne', () => {
    it('should return a community by slug', async () => {
      const community = { id: 'c-1', slug: 'test' };
      mockCommunitiesService.findBySlug.mockResolvedValue(community);

      const result = await controller.findOne('test');

      expect(mockCommunitiesService.findBySlug).toHaveBeenCalledWith('test');
      expect(result).toEqual(community);
    });
  });

  describe('create', () => {
    it('should create a community with authenticated user as owner', async () => {
      const community = { id: 'c-1', name: 'Test', slug: 'test' };
      mockCommunitiesService.create.mockResolvedValue(community);

      const result = await controller.create(
        { user: { sub: 'user-1' } },
        { name: 'Test', slug: 'test' },
      );

      expect(mockCommunitiesService.create).toHaveBeenCalledWith({ name: 'Test', slug: 'test' }, 'user-1');
      expect(result).toEqual(community);
    });
  });

  describe('join', () => {
    it('should join a community', async () => {
      mockCommunitiesService.join.mockResolvedValue(undefined);

      await controller.join('c-1', { user: { sub: 'user-1' } });

      expect(mockCommunitiesService.join).toHaveBeenCalledWith('c-1', 'user-1');
    });
  });

  describe('leave', () => {
    it('should leave a community', async () => {
      mockCommunitiesService.leave.mockResolvedValue(undefined);

      await controller.leave('c-1', { user: { sub: 'user-1' } });

      expect(mockCommunitiesService.leave).toHaveBeenCalledWith('c-1', 'user-1');
    });
  });

  describe('getMembers', () => {
    it('should return community members', async () => {
      const members = [{ userId: 'user-1', role: 'admin' }];
      mockCommunitiesService.getMembers.mockResolvedValue(members);

      const result = await controller.getMembers('c-1');

      expect(mockCommunitiesService.getMembers).toHaveBeenCalledWith('c-1');
      expect(result).toEqual(members);
    });
  });

  describe('updateRole', () => {
    it('should update member role', async () => {
      mockCommunitiesService.updateMemberRole.mockResolvedValue(undefined);

      await controller.updateRole('c-1', 'user-2', { role: 'moderator' }, { user: { sub: 'user-1' } });

      expect(mockCommunitiesService.updateMemberRole).toHaveBeenCalledWith('c-1', 'user-2', 'moderator', 'user-1');
    });
  });

  describe('kickMember', () => {
    it('should kick a member from the community', async () => {
      mockCommunitiesService.kickMember.mockResolvedValue(undefined);

      await controller.kickMember('c-1', 'user-2', { user: { sub: 'user-1' } });

      expect(mockCommunitiesService.kickMember).toHaveBeenCalledWith('c-1', 'user-2', 'user-1');
    });
  });

  describe('update', () => {
    it('should update a community', async () => {
      const updated = { id: 'c-1', name: 'Updated' };
      mockCommunitiesService.update.mockResolvedValue(updated);

      const result = await controller.update('c-1', { name: 'Updated' }, { user: { sub: 'user-1' } });

      expect(mockCommunitiesService.update).toHaveBeenCalledWith('c-1', { name: 'Updated' }, 'user-1');
      expect(result).toEqual(updated);
    });
  });
});
