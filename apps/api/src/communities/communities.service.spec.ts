import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CommunitiesService } from './communities.service';
import { CommunityEntity } from './community.entity';
import { CommunityMemberEntity } from './community-member.entity';

const mockCommunityRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockMemberRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('CommunitiesService', () => {
  let service: CommunitiesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunitiesService,
        { provide: getRepositoryToken(CommunityEntity), useValue: mockCommunityRepo },
        { provide: getRepositoryToken(CommunityMemberEntity), useValue: mockMemberRepo },
      ],
    }).compile();
    service = module.get<CommunitiesService>(CommunitiesService);
  });

  describe('create', () => {
    it('should create a community and add owner as admin member', async () => {
      const community = { id: 'c-1', name: 'Test', slug: 'test', ownerId: 'user-1' };
      mockCommunityRepo.create.mockReturnValue(community);
      mockCommunityRepo.save.mockResolvedValue(community);
      mockMemberRepo.create.mockReturnValue({ userId: 'user-1', communityId: 'c-1', role: 'admin' });
      mockMemberRepo.save.mockResolvedValue({});

      const result = await service.create({ name: 'Test', slug: 'test' }, 'user-1');

      expect(mockCommunityRepo.create).toHaveBeenCalledWith({ name: 'Test', slug: 'test', ownerId: 'user-1' });
      expect(mockMemberRepo.save).toHaveBeenCalled();
      expect(result).toEqual(community);
    });
  });

  describe('findAll', () => {
    it('should return all public communities', async () => {
      const communities = [{ id: 'c-1', isPrivate: false }];
      mockCommunityRepo.find.mockResolvedValue(communities);

      const result = await service.findAll();

      expect(mockCommunityRepo.find).toHaveBeenCalledWith({ where: { isPrivate: false } });
      expect(result).toEqual(communities);
    });
  });

  describe('findById', () => {
    it('should return a community when found', async () => {
      const community = { id: 'c-1' };
      mockCommunityRepo.findOne.mockResolvedValue(community);

      const result = await service.findById('c-1');

      expect(result).toEqual(community);
    });

    it('should throw NotFoundException when community does not exist', async () => {
      mockCommunityRepo.findOne.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBySlug', () => {
    it('should return a community by slug', async () => {
      const community = { id: 'c-1', slug: 'test' };
      mockCommunityRepo.findOne.mockResolvedValue(community);

      const result = await service.findBySlug('test');

      expect(mockCommunityRepo.findOne).toHaveBeenCalledWith({ where: { slug: 'test' } });
      expect(result).toEqual(community);
    });

    it('should throw NotFoundException when slug does not exist', async () => {
      mockCommunityRepo.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('ghost')).rejects.toThrow(NotFoundException);
    });
  });

  describe('join', () => {
    it('should add user as member when not already a member', async () => {
      mockMemberRepo.findOne.mockResolvedValue(null);
      const member = { userId: 'user-1', communityId: 'c-1', role: 'member' };
      mockMemberRepo.create.mockReturnValue(member);
      mockMemberRepo.save.mockResolvedValue(member);

      await service.join('c-1', 'user-1');

      expect(mockMemberRepo.save).toHaveBeenCalled();
    });

    it('should not add duplicate membership when user is already a member', async () => {
      mockMemberRepo.findOne.mockResolvedValue({ userId: 'user-1', communityId: 'c-1' });

      await service.join('c-1', 'user-1');

      expect(mockMemberRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('leave', () => {
    it('should remove the membership record', async () => {
      mockMemberRepo.delete.mockResolvedValue(undefined);

      await service.leave('c-1', 'user-1');

      expect(mockMemberRepo.delete).toHaveBeenCalledWith({ communityId: 'c-1', userId: 'user-1' });
    });
  });

  describe('getMembers', () => {
    it('should return all members of a community', async () => {
      const members = [{ userId: 'user-1', role: 'admin' }];
      mockMemberRepo.find.mockResolvedValue(members);

      const result = await service.getMembers('c-1');

      expect(mockMemberRepo.find).toHaveBeenCalledWith({ where: { communityId: 'c-1' } });
      expect(result).toEqual(members);
    });
  });

  describe('getMemberRole', () => {
    it('should return the role of a member', async () => {
      mockMemberRepo.findOne.mockResolvedValue({ role: 'admin' });

      const result = await service.getMemberRole('c-1', 'user-1');

      expect(result).toBe('admin');
    });

    it('should return null when user is not a member', async () => {
      mockMemberRepo.findOne.mockResolvedValue(null);

      const result = await service.getMemberRole('c-1', 'nonmember');

      expect(result).toBeNull();
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role when requester is admin', async () => {
      mockMemberRepo.findOne
        .mockResolvedValueOnce({ role: 'admin' })  // requester role lookup
        .mockResolvedValueOnce({ role: 'member' }); // target role lookup (if needed)
      mockMemberRepo.update.mockResolvedValue(undefined);

      await service.updateMemberRole('c-1', 'user-2', 'moderator', 'user-1');

      expect(mockMemberRepo.update).toHaveBeenCalledWith(
        { communityId: 'c-1', userId: 'user-2' },
        { role: 'moderator' },
      );
    });

    it('should throw ForbiddenException when requester is not admin', async () => {
      mockMemberRepo.findOne.mockResolvedValue({ role: 'member' });

      await expect(
        service.updateMemberRole('c-1', 'user-2', 'moderator', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('kickMember', () => {
    it('should kick a member when requester is admin', async () => {
      mockMemberRepo.findOne.mockResolvedValue({ role: 'admin' });
      mockMemberRepo.delete.mockResolvedValue(undefined);

      await service.kickMember('c-1', 'user-2', 'user-1');

      expect(mockMemberRepo.delete).toHaveBeenCalledWith({ communityId: 'c-1', userId: 'user-2' });
    });

    it('should kick a member when requester is moderator', async () => {
      mockMemberRepo.findOne.mockResolvedValue({ role: 'moderator' });
      mockMemberRepo.delete.mockResolvedValue(undefined);

      await service.kickMember('c-1', 'user-2', 'mod-1');

      expect(mockMemberRepo.delete).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when requester is a regular member', async () => {
      mockMemberRepo.findOne.mockResolvedValue({ role: 'member' });

      await expect(service.kickMember('c-1', 'user-2', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update community when requester is the owner', async () => {
      const community = { id: 'c-1', ownerId: 'user-1', name: 'Old' };
      const updated = { ...community, name: 'New' };
      mockCommunityRepo.findOne
        .mockResolvedValueOnce(community)
        .mockResolvedValueOnce(updated);
      mockCommunityRepo.update.mockResolvedValue(undefined);

      const result = await service.update('c-1', { name: 'New' }, 'user-1');

      expect(mockCommunityRepo.update).toHaveBeenCalledWith('c-1', { name: 'New' });
      expect(result).toEqual(updated);
    });

    it('should throw ForbiddenException when requester is not the owner', async () => {
      const community = { id: 'c-1', ownerId: 'user-1' };
      mockCommunityRepo.findOne.mockResolvedValue(community);

      await expect(service.update('c-1', { name: 'New' }, 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
