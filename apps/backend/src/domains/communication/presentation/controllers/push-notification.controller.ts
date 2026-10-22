import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { PushNotificationService } from '../../application/services/push-notification.service.js';

@ApiTags('Omnichannel - Push Notifications (FCM / Web Push)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/communications/push')
export class PushNotificationController {
  constructor(private readonly pushService: PushNotificationService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Register Web Push or mobile FCM subscription credentials' })
  subscribe(
    @CurrentUser() user: AuthenticatedUserPayload,
    @Body() body: { endpoint: string; authKey: string; p256dhKey: string },
  ) {
    return this.pushService.subscribe(user.userId, body);
  }

  @Post('send')
  @ApiOperation({ summary: 'Deliver real-time push notification to user device' })
  sendNotification(@Body() body: { userId: string; title: string; body: string }) {
    return this.pushService.sendNotification(body);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'List recent push notifications for authenticated user' })
  getNotifications(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.pushService.getUserNotifications(user.userId);
  }

  @Post('notifications/:id/read')
  @ApiOperation({ summary: 'Mark push notification as read' })
  markAsRead(@Param('id') id: string) {
    return this.pushService.markAsRead(id);
  }
}
