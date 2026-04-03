import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessageEntity } from './message.entity';

const mockRepo = {
  find: jest.fn(),
  query: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: getRepositoryToken(MessageEntity), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<MessagesService>(MessagesService);
  });

  describe('getChannelMessages', () => {
    it('should return messages for a channel ordered ASC', async () => {
      const messages = [{ id: 'm-1' }, { id: 'm-2' }];
      mockRepo.find.mockResolvedValue(messages);

      const result = await service.getChannelMessages('ch-1');

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { channelId: 'ch-1' },
        order: { createdAt: 'ASC' },
        take: 50,
      });
      expect(result).toEqual(messages);
    });

    it('should respect a custom limit', async () => {
      mockRepo.find.mockResolvedValue([]);

      await service.getChannelMessages('ch-1', 100);

      expect(mockRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });
  });

  describe('getDMs', () => {
    it('should execute a raw query to find DMs between two users', async () => {
      const messages = [{ id: 'm-1' }];
      mockRepo.query.mockResolvedValue(messages);

      const result = await service.getDMs('user-1', 'user-2');

      expect(mockRepo.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM messages'),
        ['user-1', 'user-2', 50],
      );
      expect(result).toEqual(messages);
    });

    it('should apply custom limit for DMs', async () => {
      mockRepo.query.mockResolvedValue([]);

      await service.getDMs('user-1', 'user-2', 25);

      expect(mockRepo.query).toHaveBeenCalledWith(expect.any(String), ['user-1', 'user-2', 25]);
    });
  });

  describe('saveMessage', () => {
    it('should create and save a message', async () => {
      const data = { content: 'Hello', authorId: 'user-1', channelId: 'ch-1' };
      const saved = { id: 'm-1', ...data };
      mockRepo.create.mockReturnValue(saved);
      mockRepo.save.mockResolvedValue(saved);

      const result = await service.saveMessage(data);

      expect(mockRepo.create).toHaveBeenCalledWith(data);
      expect(mockRepo.save).toHaveBeenCalledWith(saved);
      expect(result).toEqual(saved);
    });
  });
});
