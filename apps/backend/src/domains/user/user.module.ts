import { Module } from '@nestjs/common';
import { PrismaModule } from '@omnistay/database';

// Repositories
import { USER_REPOSITORY_TOKEN } from './domain/repositories/user.repository.interface.js';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository.js';

// Controllers
import { UserController } from './presentation/controllers/user.controller.js';

// Services
import { UserService } from './application/services/user.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: PrismaUserRepository,
    },
    PrismaUserRepository,
    UserService,
  ],
  exports: [
    USER_REPOSITORY_TOKEN,
    PrismaUserRepository,
    UserService,
  ],
})
export class UserModule {}
