import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UserEntity } from './user.entity';

const mockRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(UserEntity), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      const user = { id: 'user-1', email: 'a@b.com' };
      mockRepo.findOne.mockResolvedValue(user);

      const result = await service.findById('user-1');

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      const user = { id: 'user-1', email: 'a@b.com' };
      mockRepo.findOne.mockResolvedValue(user);

      const result = await service.findByEmail('a@b.com');

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
      expect(result).toEqual(user);
    });

    it('should return null when user does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('unknown@b.com');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return a user when found', async () => {
      const user = { id: 'user-1', username: 'alice' };
      mockRepo.findOne.mockResolvedValue(user);

      const result = await service.findByUsername('alice');

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { username: 'alice' } });
      expect(result).toEqual(user);
    });

    it('should return null when username does not exist', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.findByUsername('ghost');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const data = { username: 'alice', email: 'a@b.com', passwordHash: 'hashed' };
      const created = { id: 'user-1', ...data };
      mockRepo.create.mockReturnValue(created);
      mockRepo.save.mockResolvedValue(created);

      const result = await service.create(data);

      expect(mockRepo.create).toHaveBeenCalledWith(data);
      expect(mockRepo.save).toHaveBeenCalledWith(created);
      expect(result).toEqual(created);
    });
  });

  describe('update', () => {
    it('should update a user and return the updated entity', async () => {
      const updated = { id: 'user-1', email: 'a@b.com', bio: 'new bio' };
      mockRepo.update.mockResolvedValue(undefined);
      mockRepo.findOne.mockResolvedValue(updated);

      const result = await service.update('user-1', { bio: 'new bio' });

      expect(mockRepo.update).toHaveBeenCalledWith('user-1', { bio: 'new bio' });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when updated user cannot be found', async () => {
      mockRepo.update.mockResolvedValue(undefined);
      mockRepo.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent', { bio: 'bio' })).rejects.toThrow(NotFoundException);
    });
  });
});
