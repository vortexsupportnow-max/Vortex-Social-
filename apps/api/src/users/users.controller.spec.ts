import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const mockUsersService = {
  findById: jest.fn(),
  update: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();
    controller = module.get<UsersController>(UsersController);
  });

  describe('getMe', () => {
    it('should return the authenticated user profile', async () => {
      const user = { id: 'user-1', email: 'a@b.com' };
      mockUsersService.findById.mockResolvedValue(user);

      const result = await controller.getMe({ user: { sub: 'user-1' } });

      expect(mockUsersService.findById).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(user);
    });
  });

  describe('getUser', () => {
    it('should return a user by id', async () => {
      const user = { id: 'user-2', email: 'b@b.com' };
      mockUsersService.findById.mockResolvedValue(user);

      const result = await controller.getUser('user-2');

      expect(mockUsersService.findById).toHaveBeenCalledWith('user-2');
      expect(result).toEqual(user);
    });
  });

  describe('updateMe', () => {
    it('should update and return the authenticated user', async () => {
      const updated = { id: 'user-1', bio: 'hello', avatarUrl: 'http://img' };
      mockUsersService.update.mockResolvedValue(updated);

      const result = await controller.updateMe(
        { user: { sub: 'user-1' } },
        { bio: 'hello', avatarUrl: 'http://img' },
      );

      expect(mockUsersService.update).toHaveBeenCalledWith('user-1', { bio: 'hello', avatarUrl: 'http://img' });
      expect(result).toEqual(updated);
    });
  });
});
