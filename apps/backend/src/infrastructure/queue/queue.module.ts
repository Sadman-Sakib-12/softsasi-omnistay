import { Global, Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module.js';
import { NotificationProducer } from './notification.producer.js';
import { NotificationProcessor } from './notification.processor.js';

@Global()
@Module({
  imports: [RedisModule],
  providers: [NotificationProducer, NotificationProcessor],
  exports: [NotificationProducer, NotificationProcessor],
})
export class QueueModule {}
