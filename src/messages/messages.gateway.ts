import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessagesService } from "./messages.service";
import { JwtService } from "@nestjs/jwt";

@WebSocketGateway({ cors: true })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService
  ) {}

  connectedUsers = new Map<number, Socket>();

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token, {
        secret: "0e49967d13494e46bcdbcb460b24f308",
      });
      const userId = payload.sub;
      (client as any).userId = userId;
      this.connectedUsers.set(userId, client);
    } catch (e) {
      client.disconnect();
    }
  }

  @SubscribeMessage("send_message")
  async handleMessage(
    client: Socket,
    payload: { text: string; receiverId: number }
  ) {
    const senderId = (client as any).userId;
    const msg = await this.messagesService.create(
      payload.text,
      senderId,
      payload.receiverId
    );

    // Отправляем сообщение получателю
    const receiverSocket = this.connectedUsers.get(payload.receiverId);
    if (receiverSocket) {
      receiverSocket.emit("message", {
        from: msg.sender.username,
        message: msg.text,
        timestamp: msg.createdAt
      });

      // Обновляем список сообщений в чате у получателя
      const conversation = await this.messagesService.getConversation(senderId, payload.receiverId);
      receiverSocket.emit("update_chat", {
        companionId: senderId,
        messages: conversation.messages
      });
    }

    // Обновляем список сообщений в чате у отправителя
    const senderSocket = this.connectedUsers.get(senderId);
    if (senderSocket) {
      const conversation = await this.messagesService.getConversation(senderId, payload.receiverId);
      senderSocket.emit("update_chat", {
        companionId: payload.receiverId,
        messages: conversation.messages
      });
    }
  }

  @SubscribeMessage("join_chat")
  async handleJoinChat(
    client: Socket,
    payload: { companionId: number }
  ) {
    const userId = (client as any).userId;
    const conversation = await this.messagesService.getConversation(userId, payload.companionId);
    client.emit("update_chat", {
      companionId: payload.companionId,
      messages: conversation.messages
    });
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId) {
      this.connectedUsers.delete(userId);
    }
  }
}
