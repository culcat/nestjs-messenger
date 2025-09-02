import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../users/user.entity";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    private jwtService: JwtService
  ) {}

  async register(username: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({ username, password: hashed });
    const savedUser = await this.usersRepo.save(user);
    const payload = { username: savedUser.username, sub: savedUser.id };
    return { access_token: this.jwtService.sign(payload) };
  }

  async login(username: string, password: string) {
    const user = await this.usersRepo.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }
    const payload = { username: user.username, sub: user.id };
    return { access_token: this.jwtService.sign(payload) };
  }
  async checkToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: "0e49967d13494e46bcdbcb460b24f308",
      });
      return { userId: payload.sub, username: payload.username };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: "0e49967d13494e46bcdbcb460b24f308",
      });
      const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        throw new UnauthorizedException();
      }
      const newPayload = { username: user.username, sub: user.id };
      return { access_token: this.jwtService.sign(newPayload) };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
