import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity } from './message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly repo: Repository<MessageEntity>,
  ) {}

  async getChannelMessages(channelId: string, limit = 50): Promise<MessageEntity[]> {
    return this.repo.find({ where: { channelId }, order: { createdAt: 'ASC' }, take: limit });
  }

  async getDMs(userId1: string, userId2: string, limit = 50): Promise<MessageEntity[]> {
    return this.repo.query(
      `SELECT * FROM messages WHERE (author_id = $1 AND dm_recipient_id = $2) OR (author_id = $2 AND dm_recipient_id = $1) ORDER BY created_at ASC LIMIT $3`,
      [userId1, userId2, limit],
    );
  }

  async saveMessage(data: Partial<MessageEntity>): Promise<MessageEntity> {
    return this.repo.save(this.repo.create(data));
  }
}
