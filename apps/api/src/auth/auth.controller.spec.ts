import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  describe('register', () => {
    it('should call authService.register with correct arguments', async () => {
      const tokens = { accessToken: 'at', refreshToken: 'rt' };
      mockAuthService.register.mockResolvedValue(tokens);

      const result = await controller.register({ username: 'alice', email: 'a@b.com', password: 'pass1234' } as any);

      expect(mockAuthService.register).toHaveBeenCalledWith('alice', 'a@b.com', 'pass1234');
      expect(result).toEqual(tokens);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct arguments', async () => {
      const tokens = { accessToken: 'at', refreshToken: 'rt' };
      mockAuthService.login.mockResolvedValue(tokens);

      const result = await controller.login({ email: 'a@b.com', password: 'pass1234' } as any);

      expect(mockAuthService.login).toHaveBeenCalledWith('a@b.com', 'pass1234');
      expect(result).toEqual(tokens);
    });
  });
});
