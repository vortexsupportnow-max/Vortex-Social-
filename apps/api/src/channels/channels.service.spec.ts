import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChannelsService } from './channels.service';
import { ChannelEntity } from './channel.entity';
import { CommunitiesService } from '../communities/communities.service';

const mockRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockCommunitiesService = {
  getMemberRole: jest.fn(),
};

describe('ChannelsService', () => {
  let service: ChannelsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelsService,
        { provide: getRepositoryToken(ChannelEntity), useValue: mockRepo },
        { provide: CommunitiesService, useValue: mockCommunitiesService },
      ],
    }).compile();
    service = module.get<ChannelsService>(ChannelsService);
  });

  describe('findByCommunity', () => {
    it('should return channels for a community', async () => {
      const channels = [{ id: 'ch-1', communityId: 'c-1' }];
      mockRepo.find.mockResolvedValue(channels);

      const result = await service.findByCommunity('c-1');

      expect(mockRepo.find).toHaveBeenCalledWith({ where: { communityId: 'c-1' } });
      expect(result).toEqual(channels);
    });
  });

  describe('findById', () => {
    it('should return a channel when found', async () => {
      const channel = { id: 'ch-1', communityId: 'c-1' };
      mockRepo.findOne.mockResolvedValue(channel);

      const result = await service.findById('ch-1');

      expect(result).toEqual(channel);
    });

    it('should throw NotFoundException when channel does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a channel when requester is admin', async () => {
      mockCommunitiesService.getMemberRole.mockResolvedValue('admin');
      const channel = { id: 'ch-1', communityId: 'c-1', name: 'general' };
      mockRepo.create.mockReturnValue(channel);
      mockRepo.save.mockResolvedValue(channel);

      const result = await service.create('c-1', { name: 'general' }, 'user-1');

      expect(mockCommunitiesService.getMemberRole).toHaveBeenCalledWith('c-1', 'user-1');
      expect(result).toEqual(channel);
    });

    it('should create a channel when requester is moderator', async () => {
      mockCommunitiesService.getMemberRole.mockResolvedValue('moderator');
      const channel = { id: 'ch-1', communityId: 'c-1', name: 'announcements' };
      mockRepo.create.mockReturnValue(channel);
      mockRepo.save.mockResolvedValue(channel);

      const result = await service.create('c-1', { name: 'announcements' }, 'mod-1');

      expect(result).toEqual(channel);
    });

    it('should throw ForbiddenException when requester is a regular member', async () => {
      mockCommunitiesService.getMemberRole.mockResolvedValue('member');

      await expect(service.create('c-1', { name: 'general' }, 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when requester is not a member', async () => {
      mockCommunitiesService.getMemberRole.mockResolvedValue(null);

      await expect(service.create('c-1', { name: 'general' }, 'outsider')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a channel when requester is admin', async () => {
      const channel = { id: 'ch-1', communityId: 'c-1' };
      mockRepo.findOne.mockResolvedValue(channel);
      mockCommunitiesService.getMemberRole.mockResolvedValue('admin');
      mockRepo.delete.mockResolvedValue(undefined);

      await service.delete('ch-1', 'user-1');

      expect(mockRepo.delete).toHaveBeenCalledWith('ch-1');
    });

    it('should throw ForbiddenException when requester lacks permission', async () => {
      const channel = { id: 'ch-1', communityId: 'c-1' };
      mockRepo.findOne.mockResolvedValue(channel);
      mockCommunitiesService.getMemberRole.mockResolvedValue('member');

      await expect(service.delete('ch-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when channel does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.delete('nonexistent', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
