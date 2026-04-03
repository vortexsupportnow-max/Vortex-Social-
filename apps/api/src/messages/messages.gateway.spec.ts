import { Test, TestingModule } from '@nestjs/testing';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';

const mockMessagesService = {
  saveMessage: jest.fn(),
};

const mockServer = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
};

const mockClient = {
  join: jest.fn(),
  leave: jest.fn(),
  emit: jest.fn(),
};

describe('MessagesGateway', () => {
  let gateway: MessagesGateway;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesGateway,
        { provide: MessagesService, useValue: mockMessagesService },
      ],
    }).compile();
    gateway = module.get<MessagesGateway>(MessagesGateway);
    gateway.server = mockServer as any;
  });

  describe('handleJoinChannel', () => {
    it('should join the client to the channel room', () => {
      gateway.handleJoinChannel('ch-1', mockClient as any);

      expect(mockClient.join).toHaveBeenCalledWith('channel:ch-1');
    });
  });

  describe('handleLeaveChannel', () => {
    it('should remove the client from the channel room', () => {
      gateway.handleLeaveChannel('ch-1', mockClient as any);

      expect(mockClient.leave).toHaveBeenCalledWith('channel:ch-1');
    });
  });

  describe('handleMessage', () => {
    it('should save a channel message and broadcast it to the channel room', async () => {
      const message = { id: 'm-1', content: 'Hello', channelId: 'ch-1', authorId: 'user-1' };
      mockMessagesService.saveMessage.mockResolvedValue(message);

      const data = { content: 'Hello', channelId: 'ch-1', authorId: 'user-1' };
      const result = await gateway.handleMessage(data as any, mockClient as any);

      expect(mockMessagesService.saveMessage).toHaveBeenCalledWith(data);
      expect(mockServer.to).toHaveBeenCalledWith('channel:ch-1');
      expect(mockServer.emit).toHaveBeenCalledWith('newMessage', message);
      expect(result).toEqual(message);
    });

    it('should save a DM and emit to both sender and recipient', async () => {
      const message = { id: 'm-2', content: 'Hi', dmRecipientId: 'user-2', authorId: 'user-1' };
      mockMessagesService.saveMessage.mockResolvedValue(message);

      const data = { content: 'Hi', dmRecipientId: 'user-2', authorId: 'user-1' };
      await gateway.handleMessage(data as any, mockClient as any);

      expect(mockServer.to).toHaveBeenCalledWith('user:user-2');
      expect(mockServer.emit).toHaveBeenCalledWith('newDM', message);
      expect(mockClient.emit).toHaveBeenCalledWith('newDM', message);
    });

    it('should save message without emitting when no channelId or dmRecipientId', async () => {
      const message = { id: 'm-3', content: 'Orphan', authorId: 'user-1' };
      mockMessagesService.saveMessage.mockResolvedValue(message);

      const data = { content: 'Orphan', authorId: 'user-1' };
      const result = await gateway.handleMessage(data as any, mockClient as any);

      expect(result).toEqual(message);
      expect(mockServer.to).not.toHaveBeenCalled();
      expect(mockClient.emit).not.toHaveBeenCalled();
    });
  });

  describe('handleJoinUserRoom', () => {
    it('should join the client to the user room', () => {
      gateway.handleJoinUserRoom('user-1', mockClient as any);

      expect(mockClient.join).toHaveBeenCalledWith('user:user-1');
    });
  });
});
