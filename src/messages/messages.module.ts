import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message]),
    UsersModule, // 👈 тут подключаем UsersModule
    JwtModule.register({
      secret: process.env.JWT_SECRET || '0e49967d13494e46bcdbcb460b24f308',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  providers: [MessagesService, MessagesGateway],
})
export class MessagesModule {}
