import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { JwtAuthGuard } from "../shared/jwt-auth.guard";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";

class ConversationDto {
  userId: number;
}

@ApiTags("messages")
@ApiBearerAuth()
@Controller("messages")
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @UseGuards(JwtAuthGuard)
  @Post("conversation")
  @ApiOperation({ summary: "Получить историю переписки с пользователем" })
  @ApiResponse({ status: 200, description: "Список сообщений" })
  conversation(@Body() dto: ConversationDto, @Request() req) {
    return this.messagesService.getConversation(
      { id: req.user.userId } as any,
      { id: dto.userId } as any
    );
  }
}
