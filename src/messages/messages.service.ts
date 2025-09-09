import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Raw, Repository } from "typeorm";
import { Message } from "./message.entity";
import { User } from "../users/user.entity";

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message) private messagesRepo: Repository<Message>,
    @InjectRepository(User) private usersRepo: Repository<User>
  ) {}

  async create(text: string, senderId: number, receiverId: number) {
    const sender = await this.usersRepo.findOne({
      where: { id: senderId },
      select: ["id", "username"],
    });
    const receiver = await this.usersRepo.findOne({
      where: { id: receiverId },
      select: ["id", "username"],
    });
    const msg = this.messagesRepo.create({ text, sender, receiver });
    return this.messagesRepo.save(msg);
  }

  async getConversation(userId1: number, userId2: number) {
    return this.getConversationPaginated(userId1, userId2, 0, 1);
  }
  async getConversationPaginated(
    userId1: number,
    userId2: number,
    limit: number,
    page: number
  ) {
    const skip = (page - 1) * limit;

    const [messages, total] = await this.messagesRepo.findAndCount({
      where: [
        { sender: { id: userId1 }, receiver: { id: userId2 } },
        { sender: { id: userId2 }, receiver: { id: userId1 } },
      ],
      relations: ["sender", "receiver"],
      order: { createdAt: "ASC" },
      skip,
      take: limit,
    });

    return {
      messages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDialogs(userId: number) {
    return this.getDialogsPaginated(userId, 0, 1);
  }

  async getDialogsPaginated(userId: number, limit: number, page: number) {
    const skip = (page - 1) * limit;
    const messages = await this.messagesRepo.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
      relations: ["sender", "receiver"],
      order: { createdAt: "DESC" },
      skip,
      take: limit,
    });

    // Собираем уникальные диалоги с последним сообщением
    const dialogsMap = new Map<number, any>();
    for (const msg of messages) {
      const companionId =
        msg.sender.id === userId ? msg.receiver.id : msg.sender.id;
      if (!dialogsMap.has(companionId)) {
        dialogsMap.set(companionId, msg);
      }
    }
    // Возвращаем массив последних сообщений по каждому диалогу
    return Array.from(dialogsMap.values());
  }

  async getUserMessages(userId: number) {
    return this.messagesRepo.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
      relations: ["sender", "receiver"],

      order: { createdAt: "ASC" },
    });
  }
}
