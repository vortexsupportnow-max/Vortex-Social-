import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

const mockUsersService = {
  findByEmail: jest.fn(),
  findByUsername: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.findByUsername.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: 'user-1', email: 'a@b.com' });

      const result = await service.register('alice', 'a@b.com', 'password123');

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith('a@b.com');
      expect(mockUsersService.findByUsername).toHaveBeenCalledWith('alice');
      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ username: 'alice', email: 'a@b.com' }),
      );
      expect(result).toEqual({ accessToken: 'mock-token', refreshToken: 'mock-token' });
    });

    it('should throw ConflictException when email is already in use', async () => {
      mockUsersService.findByEmail.mockResolvedValue({ id: 'existing' });

      await expect(service.register('alice', 'a@b.com', 'password123')).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when username is already taken', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.findByUsername.mockResolvedValue({ id: 'existing' });

      await expect(service.register('alice', 'a@b.com', 'password123')).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsersService.create).not.toHaveBeenCalled();
    });

    it('should hash the password before storing', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.findByUsername.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue({ id: 'user-1', email: 'a@b.com' });

      await service.register('alice', 'a@b.com', 'password123');

      const createCall = mockUsersService.create.mock.calls[0][0];
      expect(createCall.passwordHash).toBeDefined();
      expect(createCall.passwordHash).not.toBe('password123');
      const isHashed = await bcrypt.compare('password123', createCall.passwordHash);
      expect(isHashed).toBe(true);
    });
  });

  describe('login', () => {
    it('should return tokens for valid credentials', async () => {
      const hash = await bcrypt.hash('password123', 10);
      mockUsersService.findByEmail.mockResolvedValue({ id: 'user-1', email: 'a@b.com', passwordHash: hash });

      const result = await service.login('a@b.com', 'password123');

      expect(result).toEqual({ accessToken: 'mock-token', refreshToken: 'mock-token' });
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login('unknown@b.com', 'password123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      const hash = await bcrypt.hash('correct-password', 10);
      mockUsersService.findByEmail.mockResolvedValue({ id: 'user-1', email: 'a@b.com', passwordHash: hash });

      await expect(service.login('a@b.com', 'wrong-password')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should sign tokens with correct payload', async () => {
      const hash = await bcrypt.hash('password123', 10);
      mockUsersService.findByEmail.mockResolvedValue({ id: 'user-1', email: 'a@b.com', passwordHash: hash });

      await service.login('a@b.com', 'password123');

      expect(mockJwtService.sign).toHaveBeenCalledWith({ sub: 'user-1', email: 'a@b.com' });
    });
  });
});
