import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { CreateHotelDto } from '../../presentation/dto/create-hotel.dto.js';
import { UpdateHotelDto } from '../../presentation/dto/update-hotel.dto.js';
import type { AuthenticatedUserPayload } from '@omnistay/backend-common';

@Injectable()
export class HotelService {
  constructor(private readonly prisma: PrismaService) {}

  private canManageProperties(caller?: AuthenticatedUserPayload): boolean {
    if (!caller) return false;
    return (
      caller.isSuperAdmin ||
      caller.role === 'SuperAdmin' ||
      caller.role === 'Platform SuperAdmin' ||
      caller.role === 'Company Owner/GM' ||
      caller.role === 'Company Owner / GM' ||
      caller.role === 'Company Owner / General Manager' ||
      caller.role === 'General Manager (GM)' ||
      caller.permissions?.includes('*') ||
      caller.permissions?.includes('properties:manage')
    );
  }

  /**
   * Ensures the 11 canonical hotels and 4 canonical rooms from Sakib_Project_Plan.pdf Figure 4.1 & Figure 3.1
   * exist in the PostgreSQL database.
   */
  async ensureCanonicalSeed() {
    try {
      let org = await this.prisma.organization.findFirst({
        where: { deletedAt: null },
      });
      if (!org) {
        org = await this.prisma.organization.create({
          data: {
            id: 'cb57c2f2-3810-4a0e-8af0-78ad02d69971',
            name: 'OmniStay Global HQ',
            slug: 'omnistay-hq',
          },
        });
      }
      const orgId = org.id;

      // 11 Canonical Hotels from Figure 4.1 in Sakib_Project_Plan.pdf
      const canonicalHotels = [
        {
          name: 'The May Fair Hotel',
          code: 'MAYFAIR-01',
          city: 'Paris',
          address: 'Stratton St, Mayfair, Paris',
          starRating: 5,
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        },
        {
          name: 'Dylan Hotel',
          code: 'DYLAN-01',
          city: 'New York, United States',
          address: '52 E 41st St, New York',
          starRating: 4,
          image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
        },
        {
          name: 'Parian Holiday Villas',
          code: 'PARIAN-01',
          city: 'Paris',
          address: 'Regal Cinemas Battery Park',
          starRating: 5,
          image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
        },
        {
          name: 'Stewart Hotel',
          code: 'STEWART-01',
          city: 'Los Angeles',
          address: '371 7th Ave, Los Angeles',
          starRating: 3,
          image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
        },
        {
          name: 'Crowne Plaza Hotel',
          code: 'CROWNE-01',
          city: 'New York, United States',
          address: '1605 Broadway, New York',
          starRating: 2,
          image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
        },
        {
          name: 'EnVision Hotel Boston',
          code: 'ENVISION-01',
          city: 'California',
          address: 'South Huntington Ave, Boston, California',
          starRating: 2,
          image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
        },
        {
          name: 'Studio Allston Hotel',
          code: 'ALLSTON-01',
          city: 'Los Angeles',
          address: '1234 Soldiers Field Rd, Los Angeles',
          starRating: 4,
          image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
        },
        {
          name: 'Redac Gateway Hotel',
          code: 'REDAC-01',
          city: 'Paris',
          address: '20801 S Western Ave, Torrance, Paris',
          starRating: 5,
          image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
        },
        {
          name: 'Castello Casole Hotel',
          code: 'CASOLE-01',
          city: 'Paris',
          address: "Localita Querceto, 53031 Casole d'Elsa, Paris",
          starRating: 4,
          image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
        },
        {
          name: 'Hotel WBF Hommachi',
          code: 'WBF-01',
          city: 'Paris',
          address: '4-4-10 Kitakyuhojimachi, Chuo Ward, Paris',
          starRating: 5,
          image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
        },
        {
          name: 'Hotel Stanford',
          code: 'STANFORD-01',
          city: 'Paris',
          address: '43 W 32nd St, Midtown Manhattan, Paris',
          starRating: 4,
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        },
      ];

      for (const h of canonicalHotels) {
        let hotel = await this.prisma.hotel.findFirst({
          where: {
            OR: [{ code: h.code }, { name: h.name }],
          },
        });

        if (!hotel) {
          hotel = await this.prisma.hotel.create({
            data: {
              organizationId: orgId,
              name: h.name,
              code: h.code,
              address: h.address,
              propertyType: 'Hotels',
              starRating: h.starRating,
              currency: 'USD',
              timezone: 'America/New_York',
            },
          });
        }

        // Ensure 6 canonical high-res gallery photos exist matching Figure 6.1
        const canonicalPhotos = [
          h.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
        ];

        const existingPhotos = await this.prisma.propertyPhoto.findMany({
          where: { propertyId: hotel.id },
          select: { url: true },
        });
        const existingUrls = new Set(existingPhotos.map((p) => p.url));

        for (let i = 0; i < canonicalPhotos.length; i++) {
          const photoUrl = canonicalPhotos[i];
          if (!existingUrls.has(photoUrl)) {
            await this.prisma.propertyPhoto.create({
              data: {
                propertyId: hotel.id,
                url: photoUrl,
                isFeatured: i === 0,
                displayOrder: i + 1,
              },
            });
            existingUrls.add(photoUrl);
          }
        }

        // For Hotel Stanford and Parian Holiday Villas: ensure the 4 Figure 3.1 & 4.3 canonical rooms exist
        if (h.code === 'STANFORD-01' || h.code === 'PARIAN-01') {
          const canonicalRooms = [
            {
              title: 'Standard Double Room',
              slug: 'standard-double-room',
              basePrice: 350,
              maxAdults: 2,
              squareMeters: 42,
              roomCount: 5,
            },
            {
              title: 'Double Room With Town View',
              slug: 'double-room-town-view',
              basePrice: 350,
              maxAdults: 4,
              squareMeters: 48,
              roomCount: 5,
            },
            {
              title: 'Room Sheraton Hotel',
              slug: 'room-sheraton-hotel',
              basePrice: 350,
              maxAdults: 2,
              squareMeters: 55,
              roomCount: 7,
            },
            {
              title: 'Room Kerama Islands',
              slug: 'room-kerama-islands',
              basePrice: 350,
              maxAdults: 4,
              squareMeters: 62,
              roomCount: 9,
            },
          ];

          for (const cr of canonicalRooms) {
            let rt = await this.prisma.roomType.findFirst({
              where: { propertyId: hotel.id, title: cr.title },
            });
            if (!rt) {
              rt = await this.prisma.roomType.create({
                data: {
                  propertyId: hotel.id,
                  title: cr.title,
                  slug: cr.slug,
                  basePrice: cr.basePrice,
                  maxAdults: cr.maxAdults,
                  squareMeters: cr.squareMeters,
                },
              });
            }

            const currentRoomsCount = await this.prisma.room.count({
              where: { roomTypeId: rt.id, deletedAt: null },
            });
            if (currentRoomsCount < cr.roomCount) {
              const toCreate = cr.roomCount - currentRoomsCount;
              for (let i = 1; i <= toCreate; i++) {
                const roomNum = `${rt.title.slice(0, 2).toUpperCase()}-${100 + currentRoomsCount + i}`;
                await this.prisma.room.upsert({
                  where: {
                    roomTypeId_roomNumber: {
                      roomTypeId: rt.id,
                      roomNumber: roomNum,
                    },
                  },
                  create: {
                    roomTypeId: rt.id,
                    roomNumber: roomNum,
                    floor: 1,
                    cleanlinessStatus: 'clean',
                    operationalStatus: 'available',
                  },
                  update: {},
                });
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('ensureCanonicalSeed error:', err);
    }
  }

  /**
   * Lists properties/hotels belonging to the authenticated tenant organization or public marketplace.
   */
  async listProperties(organizationId?: string, caller?: AuthenticatedUserPayload) {
    await this.ensureCanonicalSeed();

    const targetOrgId = organizationId || caller?.organizationId;
    const where: any = { deletedAt: null };
    if (targetOrgId) {
      where.organizationId = targetOrgId;
    }

    return this.prisma.hotel.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        organizationId: true,
        name: true,
        code: true,
        timezone: true,
        currency: true,
        propertyType: true,
        starRating: true,
        address: true,
        lat: true,
        lng: true,
        checkInTime: true,
        checkOutTime: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        photos: true,
        translations: true,
        facilities: {
          include: {
            facility: true,
          },
        },
        roomTypes: {
          where: { deletedAt: null },
          select: {
            id: true,
            title: true,
            slug: true,
            basePrice: true,
            maxAdults: true,
            maxChildren: true,
            squareMeters: true,
          },
        },
        _count: {
          select: {
            roomTypes: { where: { deletedAt: null } },
            bookings: { where: { deletedAt: null } },
          },
        },
      },
    });
  }

  /**
   * Retrieves a single property by ID or Code within the tenant or public view.
   */
  async getPropertyById(id: string, organizationId?: string) {
    await this.ensureCanonicalSeed();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const normalized = id.replace(/-/g, ' ').trim();
    const where: any = { deletedAt: null };
    if (isUuid) {
      where.OR = [{ id }, { code: id }];
    } else {
      where.OR = [
        { code: id },
        { code: id.toUpperCase() },
        { code: id.toLowerCase() },
        { name: { equals: normalized, mode: 'insensitive' } },
        { name: { contains: normalized, mode: 'insensitive' } },
        { translations: { some: { name: { contains: normalized, mode: 'insensitive' } } } },
      ];
    }

    const hotel = await this.prisma.hotel.findFirst({
      where,
      include: {
        photos: true,
        translations: true,
        facilities: {
          include: {
            facility: true,
          },
        },
        organization: {
          select: { id: true, name: true, slug: true },
        },
        roomTypes: {
          where: { deletedAt: null },
          include: {
            roomBeds: true,
            _count: {
              select: { rooms: { where: { deletedAt: null } } },
            },
          },
        },
        ratePlans: {
          where: { isActive: true },
        },
        seasonalRates: {
          where: { isActive: true },
        },
      },
    });

    if (!hotel) {
      throw new NotFoundException('Property not found');
    }

    if (organizationId && hotel.organizationId !== organizationId) {
      throw new ForbiddenException(
        'Cross-tenant data access denied: Property belongs to another organization',
      );
    }

    return hotel;
  }

  /**
   * Creates a new hotel property profile linked to the organization.
   */
  async createProperty(
    dto: CreateHotelDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    if (!organizationId) {
      throw new ForbiddenException('Organization context is required to create a property');
    }

    if (!this.canManageProperties(caller)) {
      throw new ForbiddenException('Insufficient permissions to create property profiles');
    }

    const existingCode = await this.prisma.hotel.findUnique({
      where: {
        organizationId_code: {
          organizationId,
          code: (dto.code || ('HTL-' + Math.floor(100 + Math.random() * 900))).trim().toUpperCase(),
        },
      },
    });

    if (existingCode) {
      throw new ConflictException(`Property code '${dto.code}' already exists in this organization`);
    }

    return this.prisma.hotel.create({
      data: {
        organizationId,
        name: dto.name.trim(),
        code: (dto.code || ('HTL-' + Math.floor(100 + Math.random() * 900))).trim().toUpperCase(),
        timezone: dto.timezone || 'Asia/Dhaka',
        currency: dto.currency || 'BDT',
      },
    });
  }

  /**
   * Updates an existing hotel property profile.
   */
  async updateProperty(
    id: string,
    dto: UpdateHotelDto,
    organizationId: string,
    caller: AuthenticatedUserPayload,
  ) {
    await this.getPropertyById(id, organizationId);

    if (!this.canManageProperties(caller)) {
      throw new ForbiddenException('Insufficient permissions to modify property profiles');
    }

    return this.prisma.hotel.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        timezone: dto.timezone,
        currency: dto.currency,
        propertyType: dto.propertyType,
        starRating: dto.starRating,
        address: dto.address?.trim(),
        lat: dto.lat,
        lng: dto.lng,
        checkInTime: dto.checkInTime,
        checkOutTime: dto.checkOutTime,
        status: dto.status,
      },
    });
  }

  /**
   * Soft deletes a hotel property.
   */
  async deleteProperty(id: string, organizationId: string, caller: AuthenticatedUserPayload) {
    await this.getPropertyById(id, organizationId);

    if (!this.canManageProperties(caller)) {
      throw new ForbiddenException('Insufficient permissions to delete property profiles');
    }

    return this.prisma.hotel.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'archived',
      },
    });
  }
}

export const HotelsService = HotelService;
