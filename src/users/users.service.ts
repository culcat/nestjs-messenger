import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Not, Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async findById(id: number) {
    return this.usersRepo.findOne({ where: { id } });
  }
  async findAllExecYou(username: string) {
    const user = await this.usersRepo.findOne({ where: { username } });
    const execYou = await this.usersRepo.find({
      where: { username: Not(user.username) },
      select: ["id", "username"],
    });

    return execYou;
  }
}
