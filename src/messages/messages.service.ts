import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../users/user.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messagesRepo: Repository<Message>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async create(text: string, senderId: number, receiverId: number) {
    const sender = await this.usersRepo.findOne({ where: { id: senderId } });
    const receiver = await this.usersRepo.findOne({ where: { id: receiverId } });
    const msg = this.messagesRepo.create({ text, sender, receiver });
    return this.messagesRepo.save(msg);
  }

  async getConversation(user1: User, user2: User) {
    return this.messagesRepo.find({
      where: [
        { sender: { id: user1.id }, receiver: { id: user2.id } },
        { sender: { id: user2.id }, receiver: { id: user1.id } },
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'ASC' },
    });
  }
}