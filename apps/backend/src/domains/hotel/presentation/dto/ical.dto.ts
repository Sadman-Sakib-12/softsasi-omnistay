import { IsIn, IsNotEmpty, IsString, IsUrl, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIcalFeedDto {
  @ApiProperty({
    example: 'https://www.airbnb.com/calendar/ical/1234567.ics?s=abcdef123456',
    description: 'External or dynamic iCal feed URL',
  })
  @IsUrl()
  @IsNotEmpty()
  feedUrl!: string;

  @ApiProperty({
    example: 'airbnb',
    description: 'OTA channel name: airbnb, booking_com, vrbo, tripadvisor, other',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['airbnb', 'booking_com', 'vrbo', 'tripadvisor', 'other'])
  channelName!: string;

  @ApiProperty({
    example: 'bidirectional',
    description: 'Sync direction: inbound, outbound, bidirectional',
    default: 'bidirectional',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['inbound', 'outbound', 'bidirectional'])
  syncDirection!: string;
}
