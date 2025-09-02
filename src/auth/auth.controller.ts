import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

class RegisterDto {
  username: string;
  password: string;
}
class LoginDto {
  username: string;
  password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь создан' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.username, dto.password);
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход пользователя' })
  @ApiResponse({ status: 200, description: 'JWT токен' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.username, dto.password);
  }
@Post('check')
@ApiOperation({ summary: 'Проверка валидности токена' })
@ApiResponse({ status: 200, description: 'Данные пользователя' })
checkToken(@Body('token') token: string) {
  return this.authService.checkToken(token);
}
}
