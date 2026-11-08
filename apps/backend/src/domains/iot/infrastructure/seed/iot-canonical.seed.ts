import { Logger } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';

export function normalizeUuid(val?: string | null): string {
  if (!val) return '00000000-0000-4000-a000-000000000001';
  const clean = val.replace(/[^a-fA-F0-9]/g, '');
  if (clean.length === 32) {
    return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
  }
  const hex = Buffer.from(val).toString('hex').padEnd(32, '0').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4000-a000-${hex.slice(20)}`;
}

/**
 * Idempotently seeds PostgreSQL with live operational data for IoT Smart Hospitality,
 * Rooms, Locks, Thermostats, In-Room Dining Menus, and Room Control Scenes.
 */
export async function ensureIotCanonicalSeed(prisma: PrismaService, logger: Logger): Promise<void> {
  try {
    const lockCount = await prisma.iotSmartLock.count();
    if (lockCount > 0) return;

    logger.log('Seeding PostgreSQL database with live Hospitality, IoT Locks, Thermostats and Dining records...');

    // 1. Ensure Organization exists in PostgreSQL
    let org = await prisma.organization.findFirst();
    if (!org) {
      org = await prisma.organization.create({
        data: {
          id: '00000000-0000-4000-a000-000000000001',
          name: 'Grand Azure Resort & Sky Villas',
          slug: 'grand-azure-resort',
        },
      });
    }

    // 2. Ensure Hotel Property exists in PostgreSQL
    let hotel = await prisma.hotel.findFirst();
    if (!hotel) {
      hotel = await prisma.hotel.create({
        data: {
          id: 'cb57c2f2-3810-4a0e-8af0-78ad02d69971',
          organizationId: org.id,
          name: 'Grand Azure Resort & Sky Villas',
          code: 'GRAND-AZURE',
          currency: 'USD',
          address: '100 Marina Bay Boulevard, Miami',
          status: 'active',
        },
      });
    }

    // 3. Ensure Physical Room Inventory exists in PostgreSQL
    let dbRooms = await prisma.room.findMany({
      include: { roomType: true },
      orderBy: { roomNumber: 'asc' },
    });

    if (dbRooms.length === 0) {
      const rt1 = await prisma.roomType.create({
        data: {
          id: '00000000-0000-4000-a000-000000000011',
          propertyId: hotel.id,
          title: 'Deluxe Oceanfront Suite',
          slug: 'deluxe-oceanfront-suite',
          basePrice: 350.0,
          maxAdults: 2,
          maxChildren: 1,
        },
      });
      const rt2 = await prisma.roomType.create({
        data: {
          id: '00000000-0000-4000-a000-000000000012',
          propertyId: hotel.id,
          title: 'Executive Palm Villa',
          slug: 'executive-palm-villa',
          basePrice: 550.0,
          maxAdults: 4,
          maxChildren: 2,
        },
      });
      const rt3 = await prisma.roomType.create({
        data: {
          id: '00000000-0000-4000-a000-000000000013',
          propertyId: hotel.id,
          title: 'Lagoon Garden Suite',
          slug: 'lagoon-garden-suite',
          basePrice: 420.0,
          maxAdults: 2,
          maxChildren: 1,
        },
      });
      const rt4 = await prisma.roomType.create({
        data: {
          id: '00000000-0000-4000-a000-000000000014',
          propertyId: hotel.id,
          title: 'Presidential Panorama Suite',
          slug: 'presidential-panorama-suite',
          basePrice: 980.0,
          maxAdults: 6,
          maxChildren: 2,
        },
      });
      const rt5 = await prisma.roomType.create({
        data: {
          id: '00000000-0000-4000-a000-000000000015',
          propertyId: hotel.id,
          title: 'Royal Sunset Sky Penthouse',
          slug: 'royal-sunset-sky-penthouse',
          basePrice: 2200.0,
          maxAdults: 8,
          maxChildren: 4,
        },
      });

      await prisma.room.createMany({
        data: [
          { id: '00000000-0000-4000-a000-000000000101', roomTypeId: rt1.id, roomNumber: '101', floor: 1 },
          { id: '00000000-0000-4000-a000-000000000102', roomTypeId: rt2.id, roomNumber: '102', floor: 1 },
          { id: '00000000-0000-4000-a000-000000000201', roomTypeId: rt3.id, roomNumber: '201', floor: 2 },
          { id: '00000000-0000-4000-a000-000000000304', roomTypeId: rt4.id, roomNumber: '304', floor: 3 },
          { id: '00000000-0000-4000-a000-000000000801', roomTypeId: rt5.id, roomNumber: '801', floor: 8 },
        ],
      });

      dbRooms = await prisma.room.findMany({
        include: { roomType: true },
        orderBy: { roomNumber: 'asc' },
      });
    }

    // 4. Seed Smart Locks bound to real database room IDs
    const locksData = [
      {
        id: normalizeUuid('lock-room-101'),
        roomId: dbRooms[0].id,
        lockVendor: 'Assa Abloy (VingCard BLE)',
        deviceSerial: 'LCK-ASSA-101',
        batteryLevel: 94,
        isOnline: true,
        pin: '849201',
      },
      {
        id: normalizeUuid('lock-room-102'),
        roomId: dbRooms[1].id,
        lockVendor: 'Salto Systems NFC',
        deviceSerial: 'LCK-SALTO-102',
        batteryLevel: 88,
        isOnline: true,
        pin: '551920',
      },
      {
        id: normalizeUuid('lock-room-201'),
        roomId: dbRooms[2].id,
        lockVendor: 'Assa Abloy (VingCard BLE)',
        deviceSerial: 'LCK-ASSA-201',
        batteryLevel: 91,
        isOnline: true,
        pin: '392810',
      },
      {
        id: normalizeUuid('lock-room-304'),
        roomId: dbRooms[3].id,
        lockVendor: 'Dormakaba BLE Commercial',
        deviceSerial: 'LCK-DORMA-304',
        batteryLevel: 72,
        isOnline: true,
        pin: '710492',
      },
      {
        id: normalizeUuid('lock-room-801'),
        roomId: dbRooms[4]?.id || dbRooms[0].id,
        lockVendor: 'Yale Commercial Cloud API',
        deviceSerial: 'LCK-YALE-801',
        batteryLevel: 98,
        isOnline: true,
        pin: '109284',
      },
    ];

    for (const item of locksData) {
      const createdLock = await prisma.iotSmartLock.create({
        data: {
          id: item.id,
          roomId: item.roomId,
          lockVendor: item.lockVendor,
          deviceSerial: item.deviceSerial,
          batteryLevel: item.batteryLevel,
          isOnline: item.isOnline,
        },
      });

      await prisma.iotSmartLockKey.createMany({
        data: [
          {
            id: normalizeUuid(`key-ble-${item.id}`),
            lockId: createdLock.id,
            keyType: 'BLE',
            keyToken: `BLE-SEC-${item.deviceSerial.slice(-3)}-9941`,
            validFrom: new Date(Date.now() - 86400000 * 2),
            validUntil: new Date(Date.now() + 86400000 * 5),
            isRevoked: false,
          },
          {
            id: normalizeUuid(`key-pin-${item.id}`),
            lockId: createdLock.id,
            keyType: 'PIN',
            keyToken: `PIN-${item.pin}`,
            validFrom: new Date(Date.now() - 86400000 * 2),
            validUntil: new Date(Date.now() + 86400000 * 5),
            isRevoked: false,
          },
          {
            id: normalizeUuid(`key-nfc-${item.id}`),
            lockId: createdLock.id,
            keyType: 'NFC_APPLE_WALLET',
            keyToken: `PASS.OMNISTAY.${item.deviceSerial.slice(-3)}`,
            validFrom: new Date(Date.now() - 86400000 * 2),
            validUntil: new Date(Date.now() + 86400000 * 5),
            isRevoked: false,
          },
        ],
      });

      await prisma.iotLockAccessLog.createMany({
        data: [
          {
            id: normalizeUuid(`log-ble-${item.id}`),
            lockId: createdLock.id,
            authMethod: 'BLE_HANDSHAKE',
            isGranted: true,
            accessedAt: new Date(Date.now() - 3600000 * 3),
          },
          {
            id: normalizeUuid(`log-apple-${item.id}`),
            lockId: createdLock.id,
            authMethod: 'APPLE_WALLET_NFC',
            isGranted: true,
            accessedAt: new Date(Date.now() - 3600000 * 8),
          },
          {
            id: normalizeUuid(`log-pin-${item.id}`),
            lockId: createdLock.id,
            authMethod: 'KEYPAD_PIN',
            isGranted: true,
            accessedAt: new Date(Date.now() - 3600000 * 18),
          },
        ],
      });
    }

    // 5. Seed Smart Thermostats bound to real database room IDs
    const thermostatsData = [
      {
        id: normalizeUuid('tstat-room-101'),
        roomId: dbRooms[0].id,
        deviceBrand: 'Honeywell Home Pro',
        targetTemp: 21.0,
        currentTemp: 21.4,
        ecoMode: false,
      },
      {
        id: normalizeUuid('tstat-room-102'),
        roomId: dbRooms[1].id,
        deviceBrand: 'Schneider Electric SE8000',
        targetTemp: 22.0,
        currentTemp: 22.0,
        ecoMode: false,
      },
      {
        id: normalizeUuid('tstat-room-201'),
        roomId: dbRooms[2].id,
        deviceBrand: 'Honeywell Home Pro',
        targetTemp: 24.0,
        currentTemp: 24.2,
        ecoMode: true,
      },
      {
        id: normalizeUuid('tstat-room-304'),
        roomId: dbRooms[3].id,
        deviceBrand: 'Google Nest Hospitality',
        targetTemp: 20.5,
        currentTemp: 20.8,
        ecoMode: false,
      },
      {
        id: normalizeUuid('tstat-room-801'),
        roomId: dbRooms[4]?.id || dbRooms[0].id,
        deviceBrand: 'Schneider Electric SE8000',
        targetTemp: 21.0,
        currentTemp: 21.0,
        ecoMode: false,
      },
    ];

    for (const t of thermostatsData) {
      const createdTstat = await prisma.iotThermostat.create({
        data: {
          id: t.id,
          roomId: t.roomId,
          deviceBrand: t.deviceBrand,
          targetTemp: t.targetTemp,
          currentTemp: t.currentTemp,
          ecoMode: t.ecoMode,
        },
      });

      const energyData = [];
      for (let i = 13; i >= 0; i--) {
        const logDate = new Date();
        logDate.setDate(logDate.getDate() - i);
        const isEco = t.ecoMode || i % 3 === 0;
        const kwh = isEco ? 11.4 + (i % 5) * 0.3 : 17.8 + (i % 4) * 0.4;
        energyData.push({
          id: normalizeUuid(`energy-${t.id}-${i}`),
          thermostatId: createdTstat.id,
          kwhConsumed: kwh,
          loggedDate: logDate,
        });
      }
      await prisma.iotEnergyLog.createMany({ data: energyData });
    }

    // 6. Seed Smart Room Scenes into PostgreSQL SystemSetting table
    const existingScenesSetting = await prisma.systemSetting.findUnique({
      where: { key: 'iot_room_scenes' },
    });
    if (!existingScenesSetting) {
      const canonicalScenes = [
        {
          id: 'scene-welcome',
          name: 'Welcome Scene',
          description: 'Turns on ambient lighting at 100% and opens motorized curtains when guest first unlocks room.',
          targetTemp: 21.0,
          lighting: 'Warm Ambient 100% (3000K)',
          curtains: '100% Fully Open',
          hvacState: 'Comfort Active',
        },
        {
          id: 'scene-relax',
          name: 'Relax Scene',
          description: 'Dims room to intimate warm mood lighting with sheer privacy curtains drawn.',
          targetTemp: 22.0,
          lighting: 'Cove Dim 40% (2700K)',
          curtains: 'Sheer Curtains Closed',
          hvacState: 'Whisper Quiet',
        },
        {
          id: 'scene-sleep',
          name: 'Sleep Scene',
          description: 'Blackout curtains sealed, all lighting turned off, thermostat set to optimal 20.0°C sleeping climate.',
          targetTemp: 20.0,
          lighting: 'All Lights OFF (Nightlight 5%)',
          curtains: 'Blackout 100% Sealed',
          hvacState: 'Deep Sleep 20°C',
        },
        {
          id: 'scene-eco-vacant',
          name: 'Eco Conservation Mode',
          description: 'Motion sensors detect guest departure; shifts HVAC to 24.0°C Eco Mode to reduce power consumption by 30%.',
          targetTemp: 24.0,
          lighting: 'All Lights OFF',
          curtains: 'Sun Blocker Drawn',
          hvacState: 'Eco Standby (30% Energy Savings)',
        },
      ];

      await prisma.systemSetting.create({
        data: {
          key: 'iot_room_scenes',
          value: JSON.stringify(canonicalScenes),
        },
      });
    }

    // 7. Seed Real In-Room Dining Menu Items into PostgreSQL POS tables
    const menuItemCount = await prisma.posMenuItem.count();
    if (menuItemCount === 0) {
      let outlet = await prisma.posOutlet.findFirst();
      if (!outlet) {
        outlet = await prisma.posOutlet.create({
          data: {
            tenantId: org.id,
            outletName: 'In-Room Dining Kitchen',
            outletType: 'in_room_dining',
            isActive: true,
          },
        });
      }

      let menu = await prisma.posMenu.findFirst({ where: { outletId: outlet.id } });
      if (!menu) {
        menu = await prisma.posMenu.create({
          data: {
            outletId: outlet.id,
            menuName: 'In-Room Dining Master Menu',
            isActive: true,
          },
        });
      }

      const catMains = await prisma.posMenuCategory.create({
        data: { menuId: menu.id, categoryName: 'Mains & Grill', displayOrder: 1 },
      });
      const catPasta = await prisma.posMenuCategory.create({
        data: { menuId: menu.id, categoryName: 'Pasta & Risotto', displayOrder: 2 },
      });
      const catSeafood = await prisma.posMenuCategory.create({
        data: { menuId: menu.id, categoryName: 'Seafood', displayOrder: 3 },
      });
      const catApps = await prisma.posMenuCategory.create({
        data: { menuId: menu.id, categoryName: 'Appetizers', displayOrder: 4 },
      });
      const catDesserts = await prisma.posMenuCategory.create({
        data: { menuId: menu.id, categoryName: 'Desserts', displayOrder: 5 },
      });

      await prisma.posMenuItem.createMany({
        data: [
          { categoryId: catMains.id, itemName: 'Prime Wagyu Ribeye Steak (250g)', price: 68.0, allergens: ['Halal', 'Gluten-Free'] },
          { categoryId: catPasta.id, itemName: 'Artisan Wild Mushroom & Black Truffle Risotto', price: 38.0, allergens: ['Vegetarian', 'Gluten-Free'] },
          { categoryId: catSeafood.id, itemName: 'Grand Seafood Bouillabaisse Platter', price: 84.0, allergens: ['Halal', 'Pescatarian'] },
          { categoryId: catApps.id, itemName: 'Organic Burrata & Heirloom Tomato Tartare', price: 26.0, allergens: ['Vegetarian'] },
          { categoryId: catDesserts.id, itemName: 'Valrhona Dark Chocolate Lava Souffle', price: 22.0, allergens: ['Vegetarian'] },
        ],
      });

      await prisma.systemSetting.upsert({
        where: { key: 'in_room_dining_catalog' },
        create: {
          key: 'in_room_dining_catalog',
          value: JSON.stringify([
            {
              id: 'dish-001',
              title: 'Prime Wagyu Ribeye Steak (250g)',
              category: 'Mains & Grill',
              price: 68.0,
              dietary: ['Halal', 'Gluten-Free'],
              description: 'Charcoal-grilled Australian MB7 Wagyu, truffle potato mousseline, asparagus, and red wine jus.',
              winePairing: 'Cabernet Sauvignon Reserve (Napa Valley)',
              image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
              preparationTimeMin: 25,
            },
            {
              id: 'dish-002',
              title: 'Artisan Wild Mushroom & Black Truffle Risotto',
              category: 'Pasta & Risotto',
              price: 38.0,
              dietary: ['Vegetarian', 'Gluten-Free'],
              description: 'Acquerello carnaroli rice, aged Parmigiano Reggiano 24-month, fresh black Périgord truffles.',
              winePairing: 'Pinot Noir (Burgundy)',
              image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=800&q=80',
              preparationTimeMin: 20,
            },
            {
              id: 'dish-003',
              title: 'Grand Seafood Bouillabaisse Platter',
              category: 'Seafood',
              price: 84.0,
              dietary: ['Halal', 'Pescatarian'],
              description: 'Tiger prawns, fresh diver scallops, blue crab, saffron broth, and toasted garlic sourdough.',
              winePairing: 'Crisp Chablis Premier Cru',
              image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
              preparationTimeMin: 30,
            },
            {
              id: 'dish-004',
              title: 'Organic Burrata & Heirloom Tomato Tartare',
              category: 'Appetizers',
              price: 26.0,
              dietary: ['Vegetarian'],
              description: 'Pugliese creamy burrata, basil pesto, balsamic pearl caviar, microgreens.',
              winePairing: 'Sauvignon Blanc (Marlborough)',
              image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985c?auto=format&fit=crop&w=800&q=80',
              preparationTimeMin: 12,
            },
            {
              id: 'dish-005',
              title: 'Valrhona Dark Chocolate Lava Souffle',
              category: 'Desserts',
              price: 22.0,
              dietary: ['Vegetarian'],
              description: '70% Guanaja single-origin chocolate core, Madagascar bourbon vanilla gelato, gold leaf.',
              winePairing: 'Tawny Port 20-Year',
              image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
              preparationTimeMin: 15,
            },
          ]),
        },
        update: {},
      });
    }

    // 8. Ensure test guest booking for Alexandria Sterling
    const bookingCount = await prisma.booking.count();
    if (bookingCount === 0) {
      let guestUser = await prisma.user.findFirst({ where: { email: 'alexandria.sterling@guest.com' } });
      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            id: '00000000-0000-4000-a000-000000000091',
            email: 'alexandria.sterling@guest.com',
            name: 'Alexandria Sterling',
            passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$dummyhash',
            status: 'ACTIVE',
            tenantId: org.id,
          },
        });
      }

      const now = new Date();
      const checkOut = new Date(now.getTime() + 86400000 * 3);
      await prisma.booking.create({
        data: {
          id: '00000000-0000-4000-a000-000000008841',
          tenantId: org.id,
          bookingCode: 'PARIAN-8841',
          guestId: guestUser.id,
          propertyId: hotel.id,
          checkInDate: now,
          checkOutDate: checkOut,
          adults: 2,
          children: 0,
          totalAmount: 1050.0,
          bookingStatus: 'confirmed',
          paymentStatus: 'paid',
        },
      });
    }

    logger.log('PostgreSQL database records initialized successfully for IoT & Hospitality.');
  } catch (err: any) {
    logger.warn(`PostgreSQL database seed check note: ${err?.message || err}`);
  }
}
