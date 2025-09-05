import { Controller, Get, Param } from "@nestjs/common";
import { UsersService } from "./users.service";
import { User } from "./user.entity";

@Controller("users")
export class UserController {
  constructor(private readonly usersService: UsersService) {}

  @Get("test")
  async test() {
    return { message: "Users controller is working!" };
  }

  @Get(":username")
  async find(@Param("username") username: string): Promise<User[]> {
    return this.usersService.findAllExecYou(username);
  }
}
