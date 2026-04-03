import { Test, TestingModule } from '@nestjs/testing';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

const mockMessagesService = {
  getChannelMessages: jest.fn(),
  getDMs: jest.fn(),
};

describe('MessagesController', () => {
  let controller: MessagesController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessagesController],
      providers: [{ provide: MessagesService, useValue: mockMessagesService }],
    }).compile();
    controller = module.get<MessagesController>(MessagesController);
  });

  describe('getChannelMessages', () => {
    it('should return channel messages with default limit', async () => {
      const messages = [{ id: 'm-1' }];
      mockMessagesService.getChannelMessages.mockResolvedValue(messages);

      const result = await controller.getChannelMessages('ch-1');

      expect(mockMessagesService.getChannelMessages).toHaveBeenCalledWith('ch-1', 50);
      expect(result).toEqual(messages);
    });

    it('should respect a custom limit', async () => {
      mockMessagesService.getChannelMessages.mockResolvedValue([]);

      await controller.getChannelMessages('ch-1', '25');

      expect(mockMessagesService.getChannelMessages).toHaveBeenCalledWith('ch-1', 25);
    });
  });

  describe('getDMs', () => {
    it('should return DMs between the authenticated user and another user', async () => {
      const messages = [{ id: 'm-2' }];
      mockMessagesService.getDMs.mockResolvedValue(messages);

      const result = await controller.getDMs('user-2', { user: { sub: 'user-1' } });

      expect(mockMessagesService.getDMs).toHaveBeenCalledWith('user-1', 'user-2', 50);
      expect(result).toEqual(messages);
    });

    it('should respect a custom DM limit', async () => {
      mockMessagesService.getDMs.mockResolvedValue([]);

      await controller.getDMs('user-2', { user: { sub: 'user-1' } }, '10');

      expect(mockMessagesService.getDMs).toHaveBeenCalledWith('user-1', 'user-2', 10);
    });
  });
});
