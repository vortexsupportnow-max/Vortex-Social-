import { Test, TestingModule } from '@nestjs/testing';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';

const mockChannelsService = {
  findByCommunity: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};

describe('ChannelsController', () => {
  let controller: ChannelsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChannelsController],
      providers: [{ provide: ChannelsService, useValue: mockChannelsService }],
    }).compile();
    controller = module.get<ChannelsController>(ChannelsController);
  });

  describe('findAll', () => {
    it('should return channels for a community', async () => {
      const channels = [{ id: 'ch-1' }];
      mockChannelsService.findByCommunity.mockResolvedValue(channels);

      const result = await controller.findAll('c-1');

      expect(mockChannelsService.findByCommunity).toHaveBeenCalledWith('c-1');
      expect(result).toEqual(channels);
    });
  });

  describe('create', () => {
    it('should create a channel in the community', async () => {
      const channel = { id: 'ch-1', name: 'general', communityId: 'c-1' };
      mockChannelsService.create.mockResolvedValue(channel);

      const result = await controller.create('c-1', { name: 'general' }, { user: { sub: 'user-1' } });

      expect(mockChannelsService.create).toHaveBeenCalledWith('c-1', { name: 'general' }, 'user-1');
      expect(result).toEqual(channel);
    });
  });

  describe('delete', () => {
    it('should delete a channel', async () => {
      mockChannelsService.delete.mockResolvedValue(undefined);

      await controller.delete('ch-1', { user: { sub: 'user-1' } });

      expect(mockChannelsService.delete).toHaveBeenCalledWith('ch-1', 'user-1');
    });
  });
});
