import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy();
  });

  describe('validate', () => {
    it('should return the sub and email from the JWT payload', () => {
      const payload = { sub: 'user-1', email: 'a@b.com' };
      const result = strategy.validate(payload);
      expect(result).toEqual({ sub: 'user-1', email: 'a@b.com' });
    });

    it('should handle different user ids', () => {
      const payload = { sub: 'user-99', email: 'other@example.com' };
      const result = strategy.validate(payload);
      expect(result).toEqual({ sub: 'user-99', email: 'other@example.com' });
    });
  });
});
