import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToOne,
} from "typeorm";
import { User } from "../users/user.entity";

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

@ManyToOne(() => User, (user) => user.sentMessages, { eager: false })
sender: User;

@ManyToOne(() => User, (user) => user.receivedMessages, { eager: false })
receiver: User;

  @CreateDateColumn()
  createdAt: Date;
}
