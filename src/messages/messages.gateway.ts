import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayConnection,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { MessagesService } from "./messages.service";
import { JwtService } from "@nestjs/jwt";

@WebSocketGateway({ cors: true })
export class MessagesGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService
  ) {}

  connectedUsers = [];

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token;
      const payload = this.jwtService.verify(token, {
        secret: "0e49967d13494e46bcdbcb460b24f308",
      });
      (client as any).userId = payload.sub;
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
    this.server.emit("new_message", msg);
  }
}
