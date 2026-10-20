import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BoatService } from '../services/boat.service.js';
import { BookBoatDto, CreateBoatDto, UpdateBoatDto } from '../dto/boat.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Boat & Yacht Charters')
@Controller('api/v1/boats')
export class BoatController {
  constructor(private readonly boatService: BoatService) {}

  @Get()
  @ApiOperation({ summary: 'List charter boats & yachts' })
  @ApiQuery({ name: 'vesselType', required: false })
  @ApiQuery({ name: 'charterType', required: false })
  async listBoats(
    @Query('vesselType') vesselType?: string,
    @Query('charterType') charterType?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.boatService.listBoats(tenantId, { vesselType, charterType });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get boat by ID' })
  @ApiParam({ name: 'id', description: 'Boat UUID' })
  async getBoat(@Param('id') id: string) {
    return this.boatService.getBoatById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new vessel' })
  async createBoat(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateBoatDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.boatService.createBoat(dto, user.organizationId || '', user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @ApiOperation({ summary: 'Update vessel configuration' })
  @ApiParam({ name: 'id', description: 'Boat UUID' })
  async updateBoat(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true })) dto: UpdateBoatDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.boatService.updateBoat(id, dto, user.organizationId || '', user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @ApiOperation({ summary: 'Archive vessel' })
  @ApiParam({ name: 'id', description: 'Boat UUID' })
  async deleteBoat(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.boatService.deleteBoat(id, user.organizationId || '', user);
  }

  @Post('book')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Book boat charter' })
  async bookBoat(
    @Body(new ValidationPipe({ whitelist: true })) dto: BookBoatDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.boatService.bookBoat(dto, user.userId);
  }
}
