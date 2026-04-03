import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

const mockNotificationsService = {
  getForUser: jest.fn(),
  markRead: jest.fn(),
  markAllRead: jest.fn(),
};

describe('NotificationsController', () => {
  let controller: NotificationsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [{ provide: NotificationsService, useValue: mockNotificationsService }],
    }).compile();
    controller = module.get<NotificationsController>(NotificationsController);
  });

  describe('getAll', () => {
    it('should return notifications for the authenticated user', async () => {
      const notifications = [{ id: 'n-1' }];
      mockNotificationsService.getForUser.mockResolvedValue(notifications);

      const result = await controller.getAll({ user: { sub: 'user-1' } });

      expect(mockNotificationsService.getForUser).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(notifications);
    });
  });

  describe('markRead', () => {
    it('should mark a specific notification as read', async () => {
      mockNotificationsService.markRead.mockResolvedValue(undefined);

      await controller.markRead('n-1', { user: { sub: 'user-1' } });

      expect(mockNotificationsService.markRead).toHaveBeenCalledWith('n-1', 'user-1');
    });
  });

  describe('markAllRead', () => {
    it('should mark all notifications as read for the authenticated user', async () => {
      mockNotificationsService.markAllRead.mockResolvedValue(undefined);

      await controller.markAllRead({ user: { sub: 'user-1' } });

      expect(mockNotificationsService.markAllRead).toHaveBeenCalledWith('user-1');
    });
  });
});
