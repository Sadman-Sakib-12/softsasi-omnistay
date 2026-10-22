import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { SmsGatewayService } from '../../application/services/sms-gateway.service.js';

@ApiTags('Omnichannel - High-Delivery SMS Gateways')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/communications/sms')
export class SmsController {
  constructor(private readonly smsService: SmsGatewayService) {}

  @Post('send')
  @ApiOperation({ summary: 'Dispatch SMS alert or critical OTP across carrier gateways' })
  sendSms(@Body() body: {
    phoneTo: string;
    message: string;
    gateway?: string;
    isCriticalOtp?: boolean;
  }) {
    return this.smsService.sendSms(body);
  }

  @Post('gateways')
  @ApiOperation({ summary: 'Configure carrier SMS connector credentials (Twilio, Vonage, AWS SNS)' })
  configureGateway(@Body() body: {
    gatewayKey: 'twilio' | 'vonage' | 'aws_sns' | 'regional_aggregator';
    apiKey: string;
    apiSecret?: string;
    senderId?: string;
    isActive?: boolean;
  }) {
    return this.smsService.configureGateway(body);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Retrieve historical SMS delivery and audit logs' })
  getLogs(@Query('phoneTo') phoneTo?: string) {
    return this.smsService.getLogs(phoneTo);
  }
}
