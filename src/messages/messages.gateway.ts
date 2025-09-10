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

    const receiverSocket = this.connectedUsers.get(payload.receiverId);
    if (receiverSocket) {
      receiverSocket.emit("message", {
        from: msg.sender.username,
        message: msg.text,
        timestamp: msg.createdAt
      });
    }
  }

  handleDisconnect(client: Socket) {
    const userId = (client as any).userId;
    if (userId) {
      this.connectedUsers.delete(userId);
    }
  }
}
