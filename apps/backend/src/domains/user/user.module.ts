import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller.js';
import { UserService } from './services/user.service.js';
import { PrismaModule } from '@omnistay/database';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }

export const UsersModule = UserModule;
