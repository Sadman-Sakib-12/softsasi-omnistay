import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { FlightService } from '../services/flight.service.js';
import {
  BookFlightDto,
  CreateAirlineDto,
  CreateAirportDto,
  CreateFlightDto,
} from '../dto/flight.dto.js';
import { JwtAuthGuard } from '@omnistay/backend-common';
import { CurrentUser } from '@omnistay/backend-common';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@ApiTags('Flight Charters & Aviation')
@Controller('api/v1/flights')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @Get('airports')
  @ApiOperation({ summary: 'List all commercial airports' })
  async listAirports() {
    return this.flightService.listAirports();
  }

  @Post('airports')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register airport' })
  async createAirport(@Body(new ValidationPipe({ whitelist: true })) dto: CreateAirportDto) {
    return this.flightService.createAirport(dto);
  }

  @Get('airlines')
  @ApiOperation({ summary: 'List airlines' })
  async listAirlines() {
    return this.flightService.listAirlines();
  }

  @Post('airlines')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register airline' })
  async createAirline(@Body(new ValidationPipe({ whitelist: true })) dto: CreateAirlineDto) {
    return this.flightService.createAirline(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Search flight schedules' })
  @ApiQuery({ name: 'originAirportId', required: false })
  @ApiQuery({ name: 'destAirportId', required: false })
  async listFlights(
    @Query('originAirportId') originAirportId?: string,
    @Query('destAirportId') destAirportId?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.flightService.listFlights(tenantId, { originAirportId, destAirportId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get flight details by ID' })
  @ApiParam({ name: 'id', description: 'Flight UUID' })
  async getFlight(@Param('id') id: string) {
    return this.flightService.getFlightById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create scheduled or charter flight' })
  async createFlight(
    @Body(new ValidationPipe({ whitelist: true })) dto: CreateFlightDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.flightService.createFlight(dto, user.organizationId || '', user);
  }

  @Post('book')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-Auth')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Book flight and submit passenger manifest (TSA compliant)' })
  async bookFlight(
    @Body(new ValidationPipe({ whitelist: true })) dto: BookFlightDto,
    @CurrentUser() user: AuthenticatedUserPayload,
  ) {
    return this.flightService.bookFlight(dto, user.userId);
  }
}
