import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';
import { Guest360ApplicationService } from '../../application/services/guest360.application-service.js';
import {
  AddDietaryRestrictionDto,
  AddStayPreferenceDto,
  SubmitPostStaySurveyDto,
  UpdateGuestProfile360Dto,
} from '../dto/guest360.dto.js';

@ApiTags('CRM - Guest 360 & Personalization Ledger')
@Controller('api/v1/crm/guests')
export class Guest360Controller {
  constructor(private readonly guest360Service: Guest360ApplicationService) {}

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated guest 360 profile' })
  getMyProfile(@CurrentUser() user: AuthenticatedUserPayload) {
    return this.guest360Service.getOrCreateProfile(user.userId);
  }

  @Get(':userId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM', 'Front Desk Agent')
  @ApiOperation({ summary: 'Get guest 360 intelligence profile by User UUID' })
  getProfile(@Param('userId') userId: string) {
    return this.guest360Service.getOrCreateProfile(userId);
  }

  @Patch(':userId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SuperAdmin', 'Company Owner/GM', 'Front Desk Agent')
  @ApiOperation({ summary: 'Update VIP tier or profile notes' })
  updateProfile(
    @Param('userId') userId: string,
    @Body() dto: UpdateGuestProfile360Dto,
  ) {
    return this.guest360Service.updateProfile(userId, dto);
  }

  @Post(':userId/preferences')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add room/stay preference for guest' })
  addPreference(
    @Param('userId') userId: string,
    @Body() dto: AddStayPreferenceDto,
  ) {
    return this.guest360Service.addStayPreference(userId, dto);
  }

  @Post(':userId/dietary')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Add dietary restriction/allergy warning for guest' })
  addDietary(
    @Param('userId') userId: string,
    @Body() dto: AddDietaryRestrictionDto,
  ) {
    return this.guest360Service.addDietaryRestriction(userId, dto);
  }

  @Post('surveys')
  @ApiOperation({ summary: 'Submit post-stay guest survey and feedback' })
  submitSurvey(@Body() dto: SubmitPostStaySurveyDto) {
    return this.guest360Service.submitPostStaySurvey(dto);
  }
}
