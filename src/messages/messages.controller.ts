import { Controller, Post, Body, UseGuards, Request } from "@nestjs/common";
import { MessagesService } from "./messages.service";
import { JwtAuthGuard } from "../shared/jwt-auth.guard";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiProperty,
} from "@nestjs/swagger";

class ConversationDto {
  @ApiProperty()
  userId: number;

  @ApiProperty({ required: false, default: 20 })
  limit?: number;

  @ApiProperty({ required: false, default: 1 })
  page?: number;
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
    const limit = dto.limit || 20;
    const page = dto.page || 1;

    return this.messagesService.getConversationPaginated(
      req.user.userId,
      dto.userId,
      limit,
      page
    );
  }
  @UseGuards(JwtAuthGuard)
  @Post("dialogs")
  @ApiOperation({ summary: "Получить список диалогов" })
  @ApiResponse({ status: 200, description: "Список диалогов" })
  dialogs(@Body() dto: { limit?: number; page?: number }, @Request() req) {
    const limit = dto.limit || 20;
    const page = dto.page || 1;

    return this.messagesService.getDialogsPaginated(
      req.user.userId,
      limit,
      page
    );
  }
}
