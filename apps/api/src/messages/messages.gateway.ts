import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';

@WebSocketGateway({ cors: { origin: '*' } })
export class MessagesGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly messagesService: MessagesService) {}

  @SubscribeMessage('joinChannel')
  handleJoinChannel(@MessageBody() channelId: string, @ConnectedSocket() client: Socket) {
    client.join(`channel:${channelId}`);
  }

  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(@MessageBody() channelId: string, @ConnectedSocket() client: Socket) {
    client.leave(`channel:${channelId}`);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { content: string; channelId?: string; dmRecipientId?: string; authorId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.messagesService.saveMessage(data);
    if (data.channelId) {
      this.server.to(`channel:${data.channelId}`).emit('newMessage', message);
    } else if (data.dmRecipientId) {
      this.server.to(`user:${data.dmRecipientId}`).emit('newDM', message);
      client.emit('newDM', message);
    }
    return message;
  }

  @SubscribeMessage('joinUserRoom')
  handleJoinUserRoom(@MessageBody() userId: string, @ConnectedSocket() client: Socket) {
    client.join(`user:${userId}`);
  }
}
