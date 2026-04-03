import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsService } from './notifications.service';
import { NotificationEntity } from './notification.entity';

const mockRepo = {
  find: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(NotificationEntity), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<NotificationsService>(NotificationsService);
  });

  describe('getForUser', () => {
    it('should return up to 50 notifications for a user ordered DESC', async () => {
      const notifications = [{ id: 'n-1', userId: 'user-1' }];
      mockRepo.find.mockResolvedValue(notifications);

      const result = await service.getForUser('user-1');

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { createdAt: 'DESC' },
        take: 50,
      });
      expect(result).toEqual(notifications);
    });
  });

  describe('markRead', () => {
    it('should mark a specific notification as read for the user', async () => {
      mockRepo.update.mockResolvedValue(undefined);

      await service.markRead('n-1', 'user-1');

      expect(mockRepo.update).toHaveBeenCalledWith({ id: 'n-1', userId: 'user-1' }, { read: true });
    });
  });

  describe('markAllRead', () => {
    it('should mark all unread notifications as read for a user', async () => {
      mockRepo.update.mockResolvedValue(undefined);

      await service.markAllRead('user-1');

      expect(mockRepo.update).toHaveBeenCalledWith(
        { userId: 'user-1', read: false },
        { read: true },
      );
    });
  });

  describe('create', () => {
    it('should create and return a new notification', async () => {
      const notification = { id: 'n-1', userId: 'user-1', type: 'like', payload: { postId: 'p-1' } };
      mockRepo.create.mockReturnValue(notification);
      mockRepo.save.mockResolvedValue(notification);

      const result = await service.create('user-1', 'like', { postId: 'p-1' });

      expect(mockRepo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        type: 'like',
        payload: { postId: 'p-1' },
      });
      expect(result).toEqual(notification);
    });
  });
});
