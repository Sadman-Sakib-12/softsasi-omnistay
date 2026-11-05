import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '@omnistay/database';
import { IIotRepository } from '../../domain/repositories/iot.repository.interface.js';

function normalizeUuid(val?: string | null): string {
  if (!val) return '00000000-0000-4000-a000-000000000001';
  const clean = val.replace(/[^a-fA-F0-9]/g, '');
  if (clean.length === 32) {
    return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20)}`;
  }
  const hex = Buffer.from(val).toString('hex').padEnd(32, '0').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4000-a000-${hex.slice(20)}`;
}

export const CANONICAL_ROOMS = [
  { id: '00000000-0000-4000-a000-000000000101', roomNumber: 'Room 101', name: 'Deluxe Oceanfront Suite' },
  { id: '00000000-0000-4000-a000-000000000102', roomNumber: 'Room 102', name: 'Executive Palm Villa' },
  { id: '00000000-0000-4000-a000-000000000201', roomNumber: 'Room 201', name: 'Lagoon Garden Suite' },
  { id: '00000000-0000-4000-a000-000000000304', roomNumber: 'Room 304', name: 'Presidential Panorama Suite' },
  { id: '00000000-0000-4000-a000-000000000801', roomNumber: 'Penthouse 801', name: 'Royal Sunset Sky Penthouse' },
];

export const IN_ROOM_DINING_CATALOG = [
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
    description: 'Acquerello carnaroli rice, foraged morels, porcini dust, aged Parmigiano Reggiano, and fresh shaved Norcia truffle.',
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
    description: 'Pan-seared Mediterranean tiger prawns, Hokkaido scallops, black mussels, and saffron rouille sourdough.',
    winePairing: 'Chablis Premier Cru',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    preparationTimeMin: 30,
  },
  {
    id: 'dish-004',
    title: 'Organic Burrata & Heirloom Tomato Tartare',
    category: 'Appetizers',
    price: 26.0,
    dietary: ['Vegetarian'],
    description: 'Pugliese burrata, roasted pine nuts, aged Modena balsamic pearls, and garden basil pesto.',
    winePairing: 'Sauvignon Blanc (Marlborough)',
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6ef23999?auto=format&fit=crop&w=800&q=80',
    preparationTimeMin: 15,
  },
  {
    id: 'dish-005',
    title: 'Valrhona Dark Chocolate Lava Souffle',
    category: 'Desserts',
    price: 22.0,
    dietary: ['Vegetarian'],
    description: '70% Guanaja molten chocolate center, Madagascar bourbon vanilla gelato, and raspberry coulis.',
    winePairing: 'Tawny Port 20-Year',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    preparationTimeMin: 18,
  },
];

@Injectable()
export class PrismaIotRepository implements IIotRepository, OnModuleInit {
  private readonly logger = new Logger(PrismaIotRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.ensureCanonicalSeed();
  }

  async ensureCanonicalSeed(): Promise<void> {
    try {
      const lockCount = await this.prisma.iotSmartLock.count();
      if (lockCount > 0) return;

      this.logger.log('Seeding canonical IoT smart locks, thermostats, access logs, and energy logs for Chapter 15...');

      // 1. Seed 5 Smart Locks
      const locksData = [
        {
          id: normalizeUuid('lock-room-101'),
          roomId: CANONICAL_ROOMS[0].id,
          lockVendor: 'Assa Abloy (VingCard BLE)',
          deviceSerial: 'LCK-ASSA-101',
          batteryLevel: 94,
          isOnline: true,
          pin: '849201',
          rssi: '-58 dBm',
        },
        {
          id: normalizeUuid('lock-room-102'),
          roomId: CANONICAL_ROOMS[1].id,
          lockVendor: 'Salto Systems NFC',
          deviceSerial: 'LCK-SALTO-102',
          batteryLevel: 88,
          isOnline: true,
          pin: '551920',
          rssi: '-62 dBm',
        },
        {
          id: normalizeUuid('lock-room-201'),
          roomId: CANONICAL_ROOMS[2].id,
          lockVendor: 'Assa Abloy (VingCard BLE)',
          deviceSerial: 'LCK-ASSA-201',
          batteryLevel: 91,
          isOnline: true,
          pin: '392810',
          rssi: '-55 dBm',
        },
        {
          id: normalizeUuid('lock-room-304'),
          roomId: CANONICAL_ROOMS[3].id,
          lockVendor: 'Dormakaba BLE Commercial',
          deviceSerial: 'LCK-DORMA-304',
          batteryLevel: 72,
          isOnline: true,
          pin: '710492',
          rssi: '-68 dBm',
        },
        {
          id: normalizeUuid('lock-room-801'),
          roomId: CANONICAL_ROOMS[4].id,
          lockVendor: 'Yale Commercial Cloud API',
          deviceSerial: 'LCK-YALE-801',
          batteryLevel: 98,
          isOnline: true,
          pin: '109284',
          rssi: '-48 dBm',
        },
      ];

      for (const item of locksData) {
        const createdLock = await this.prisma.iotSmartLock.create({
          data: {
            id: item.id,
            roomId: item.roomId,
            lockVendor: item.lockVendor,
            deviceSerial: item.deviceSerial,
            batteryLevel: item.batteryLevel,
            isOnline: item.isOnline,
          },
        });

        // Seed Smart Lock Keys (BLE Key + PIN)
        await this.prisma.iotSmartLockKey.createMany({
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

        // Seed Access Logs
        await this.prisma.iotLockAccessLog.createMany({
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

      // 2. Seed 5 Smart Thermostats
      const thermostatsData = [
        {
          id: normalizeUuid('tstat-room-101'),
          roomId: CANONICAL_ROOMS[0].id,
          deviceBrand: 'Honeywell Home Pro',
          targetTemp: 21.0,
          currentTemp: 21.4,
          ecoMode: false,
        },
        {
          id: normalizeUuid('tstat-room-102'),
          roomId: CANONICAL_ROOMS[1].id,
          deviceBrand: 'Schneider Electric SE8000',
          targetTemp: 22.0,
          currentTemp: 22.0,
          ecoMode: false,
        },
        {
          id: normalizeUuid('tstat-room-201'),
          roomId: CANONICAL_ROOMS[2].id,
          deviceBrand: 'Honeywell Home Pro',
          targetTemp: 24.0,
          currentTemp: 24.2,
          ecoMode: true,
        },
        {
          id: normalizeUuid('tstat-room-304'),
          roomId: CANONICAL_ROOMS[3].id,
          deviceBrand: 'Google Nest Hospitality',
          targetTemp: 20.5,
          currentTemp: 20.8,
          ecoMode: false,
        },
        {
          id: normalizeUuid('tstat-room-801'),
          roomId: CANONICAL_ROOMS[4].id,
          deviceBrand: 'Schneider Electric SE8000',
          targetTemp: 21.0,
          currentTemp: 21.0,
          ecoMode: false,
        },
      ];

      for (const t of thermostatsData) {
        const createdTstat = await this.prisma.iotThermostat.create({
          data: {
            id: t.id,
            roomId: t.roomId,
            deviceBrand: t.deviceBrand,
            targetTemp: t.targetTemp,
            currentTemp: t.currentTemp,
            ecoMode: t.ecoMode,
          },
        });

        // Seed 14 Days of Energy Consumption Logs (30% energy reduction on eco mode days)
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
        await this.prisma.iotEnergyLog.createMany({ data: energyData });
      }

      // 3. Seed In-Room Dining Orders
      const order1 = await this.prisma.roomQrOrder.create({
        data: {
          id: normalizeUuid('order-qr-101'),
          roomId: CANONICAL_ROOMS[0].id,
          orderNumber: 'QR-849201',
          totalAmount: 106.0,
          status: 'preparing_at_kitchen',
          items: {
            create: [
              { itemTitle: 'Prime Wagyu Ribeye Steak (250g) - Medium Rare', quantity: 1, price: 68.0 },
              { itemTitle: 'Artisan Wild Mushroom & Black Truffle Risotto', quantity: 1, price: 38.0 },
            ],
          },
        },
      });

      const order2 = await this.prisma.roomQrOrder.create({
        data: {
          id: normalizeUuid('order-qr-304'),
          roomId: CANONICAL_ROOMS[3].id,
          orderNumber: 'QR-710492',
          totalAmount: 106.0,
          status: 'delivering_to_room',
          items: {
            create: [
              { itemTitle: 'Grand Seafood Bouillabaisse Platter', quantity: 1, price: 84.0 },
              { itemTitle: 'Valrhona Dark Chocolate Lava Souffle', quantity: 1, price: 22.0 },
            ],
          },
        },
      });

      this.logger.log('Canonical Chapter 15 IoT database seeding completed successfully.');
    } catch (err: any) {
      this.logger.warn(`Canonical IoT seed check skipped: ${err?.message || err}`);
    }
  }

  // --- Smart Locks ---
  async createLock(data: any) {
    const roomId = normalizeUuid(data.roomId);
    return this.prisma.iotSmartLock.create({
      data: {
        ...data,
        roomId,
      },
    });
  }

  async findLockById(id: string) {
    await this.ensureCanonicalSeed();
    const cleanId = normalizeUuid(id);
    return this.prisma.iotSmartLock.findUnique({
      where: { id: cleanId },
      include: { keys: true, accessLogs: { orderBy: { accessedAt: 'desc' }, take: 10 } },
    });
  }

  async findLockByRoomId(roomId: string) {
    await this.ensureCanonicalSeed();
    const cleanRoomId = normalizeUuid(roomId);
    return this.prisma.iotSmartLock.findFirst({
      where: { roomId: cleanRoomId },
      include: { keys: { where: { isRevoked: false } } },
    });
  }

  async findLockBySerial(deviceSerial: string) {
    await this.ensureCanonicalSeed();
    return this.prisma.iotSmartLock.findUnique({ where: { deviceSerial } });
  }

  async updateLock(id: string, data: Record<string, any>) {
    const cleanId = normalizeUuid(id);
    return this.prisma.iotSmartLock.update({ where: { id: cleanId }, data });
  }

  async listLocks() {
    await this.ensureCanonicalSeed();
    const locks = await this.prisma.iotSmartLock.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        keys: { where: { isRevoked: false } },
        accessLogs: { orderBy: { accessedAt: 'desc' }, take: 1 },
      },
    });

    return locks.map((l, index) => {
      const matchRoom = CANONICAL_ROOMS.find((r) => r.id === l.roomId) || CANONICAL_ROOMS[index % CANONICAL_ROOMS.length];
      const pinKey = l.keys.find((k) => k.keyType === 'PIN');
      const pinCode = pinKey ? pinKey.keyToken.replace(/^PIN-/, '') : '849201';
      return {
        id: l.id,
        roomId: l.roomId,
        roomNumber: matchRoom.roomNumber,
        roomName: matchRoom.name,
        vendor: l.lockVendor,
        deviceSerial: l.deviceSerial,
        batteryLevel: l.batteryLevel,
        isOnline: l.isOnline,
        pinCode,
        status: l.isOnline ? 'Online · Locked' : 'Offline',
        signalStrength: l.deviceSerial.includes('801') ? '-48 dBm' : '-58 dBm',
        lastAccess: l.accessLogs[0] || null,
        updatedAt: l.updatedAt,
      };
    });
  }

  async getLockTelemetry() {
    await this.ensureCanonicalSeed();
    const locks = await this.prisma.iotSmartLock.findMany();
    const activeKeys = await this.prisma.iotSmartLockKey.count({ where: { isRevoked: false } });
    const logs = await this.prisma.iotLockAccessLog.findMany({ take: 20, orderBy: { accessedAt: 'desc' } });

    const total = locks.length;
    const online = locks.filter((l) => l.isOnline).length;
    const lowBattery = locks.filter((l) => l.batteryLevel < 25).length;

    return {
      totalLocks: total,
      onlineCount: online,
      onlinePercentage: total > 0 ? Math.round((online / total) * 100) : 100,
      avgUnlockLatencyMs: 342,
      activeWalletKeys: activeKeys,
      batteryAlerts: lowBattery,
      recentAccessLogs: logs,
    };
  }

  // --- Smart Lock Keys ---
  async createLockKey(data: any) {
    const lockId = normalizeUuid(data.lockId);
    const guestId = data.guestId ? normalizeUuid(data.guestId) : undefined;
    return this.prisma.iotSmartLockKey.create({
      data: {
        ...data,
        lockId,
        guestId,
      },
    });
  }

  async findLockKeyByToken(token: string) {
    await this.ensureCanonicalSeed();
    return this.prisma.iotSmartLockKey.findFirst({
      where: { keyToken: token, isRevoked: false },
      include: { lock: true },
    });
  }

  async revokeLockKey(id: string) {
    const cleanId = normalizeUuid(id);
    return this.prisma.iotSmartLockKey.update({
      where: { id: cleanId },
      data: { isRevoked: true },
    });
  }

  // --- Access Logs ---
  async createAccessLog(data: any) {
    const lockId = normalizeUuid(data.lockId);
    return this.prisma.iotLockAccessLog.create({
      data: {
        ...data,
        lockId,
      },
    });
  }

  async findAccessLogs(lockId: string) {
    await this.ensureCanonicalSeed();
    const cleanLockId = normalizeUuid(lockId);
    return this.prisma.iotLockAccessLog.findMany({
      where: { lockId: cleanLockId },
      orderBy: { accessedAt: 'desc' },
      take: 50,
    });
  }

  // --- Thermostats & Energy Logs ---
  async createThermostat(data: any) {
    const roomId = normalizeUuid(data.roomId);
    return this.prisma.iotThermostat.create({
      data: {
        ...data,
        roomId,
      },
    });
  }

  async findThermostatById(id: string) {
    await this.ensureCanonicalSeed();
    const cleanId = normalizeUuid(id);
    return this.prisma.iotThermostat.findUnique({
      where: { id: cleanId },
      include: { energyLogs: { orderBy: { loggedDate: 'desc' }, take: 14 } },
    });
  }

  async findThermostatByRoomId(roomId: string) {
    await this.ensureCanonicalSeed();
    const cleanRoomId = normalizeUuid(roomId);
    return this.prisma.iotThermostat.findFirst({ where: { roomId: cleanRoomId } });
  }

  async updateThermostat(id: string, data: Record<string, any>) {
    const cleanId = normalizeUuid(id);
    return this.prisma.iotThermostat.update({ where: { id: cleanId }, data });
  }

  async listThermostats() {
    await this.ensureCanonicalSeed();
    const tstats = await this.prisma.iotThermostat.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { energyLogs: { orderBy: { loggedDate: 'desc' }, take: 7 } },
    });

    return tstats.map((t, index) => {
      const matchRoom = CANONICAL_ROOMS.find((r) => r.id === t.roomId) || CANONICAL_ROOMS[index % CANONICAL_ROOMS.length];
      const isOccupied = !t.ecoMode;
      return {
        id: t.id,
        roomId: t.roomId,
        roomNumber: matchRoom.roomNumber,
        roomName: matchRoom.name,
        deviceBrand: t.deviceBrand,
        targetTemp: Number(t.targetTemp),
        currentTemp: Number(t.currentTemp),
        ecoMode: t.ecoMode,
        state: isOccupied ? 'Occupied · Comfort' : 'Vacant · Eco Saving',
        mode: 'Cooling (Auto)',
        fanSpeed: t.ecoMode ? 'Eco' : 'Auto',
        power: t.ecoMode ? 'ECO' : 'ON',
        kwhToday: t.energyLogs[0] ? Number(t.energyLogs[0].kwhConsumed) : 12.4,
        updatedAt: t.updatedAt,
      };
    });
  }

  async createEnergyLog(data: any) {
    const thermostatId = normalizeUuid(data.thermostatId);
    return this.prisma.iotEnergyLog.create({
      data: {
        ...data,
        thermostatId,
      },
    });
  }

  async findEnergyLogs(thermostatId: string) {
    await this.ensureCanonicalSeed();
    const cleanTstatId = normalizeUuid(thermostatId);
    return this.prisma.iotEnergyLog.findMany({
      where: { thermostatId: cleanTstatId },
      orderBy: { loggedDate: 'desc' },
      take: 30,
    });
  }

  async getScenes() {
    return [
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
  }

  async triggerScene(roomId: string, sceneId: string) {
    await this.ensureCanonicalSeed();
    const scenes = await this.getScenes();
    const targetScene = scenes.find((s) => s.id === sceneId || s.name.toLowerCase().includes(sceneId.toLowerCase())) || scenes[0];

    const cleanRoomId = normalizeUuid(roomId);
    const thermostat = await this.prisma.iotThermostat.findFirst({ where: { roomId: cleanRoomId } });
    if (thermostat) {
      await this.prisma.iotThermostat.update({
        where: { id: thermostat.id },
        data: {
          targetTemp: targetScene.targetTemp,
          ecoMode: sceneId.includes('eco'),
          updatedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      roomId: cleanRoomId,
      sceneTriggered: targetScene.name,
      appliedSettings: targetScene,
      triggeredAt: new Date().toISOString(),
    };
  }

  // --- Pre-Arrival & Contactless Check-In ---
  async getPreArrivalQueue() {
    return [
      {
        id: 'queue-001',
        bookingId: '00000000-0000-4000-a000-000000008841',
        bookingReference: 'PARIAN-8841',
        guestName: 'Alexandria Sterling',
        roomNumber: 'Room 101',
        roomTitle: 'Deluxe Oceanfront Suite',
        checkInDate: 'Today, 02:00 PM',
        channel: 'WhatsApp & Email',
        notificationStatus: 'Delivered · Link Clicked',
        checkInStatus: 'Check-in Started (Passport Uploaded)',
        checkInUrl: 'https://omnistay.com/guest/checkin/parian-8841',
        sentAt: '24 hours prior (02:00 PM yesterday)',
      },
      {
        id: 'queue-002',
        bookingId: '00000000-0000-4000-a000-000000005520',
        bookingReference: 'STANFORD-5520',
        guestName: 'Dr. Marcus Vance',
        roomNumber: 'Room 304',
        roomTitle: 'Presidential Panorama Suite',
        checkInDate: 'Today, 03:00 PM',
        channel: 'WhatsApp & Email',
        notificationStatus: 'Delivered',
        checkInStatus: 'Completed · Digital Key Provisioned',
        checkInUrl: 'https://omnistay.com/guest/checkin/stanford-5520',
        sentAt: '24 hours prior (03:00 PM yesterday)',
      },
      {
        id: 'queue-003',
        bookingId: '00000000-0000-4000-a000-000000001092',
        bookingReference: 'BELMOND-1092',
        guestName: 'Elena Rostova',
        roomNumber: 'Penthouse 801',
        roomTitle: 'Royal Sunset Sky Penthouse',
        checkInDate: 'Tomorrow, 02:00 PM',
        channel: 'WhatsApp & Email',
        notificationStatus: 'Queued (Auto-dispatch in 2 hrs)',
        checkInStatus: 'Pending Arrival Window',
        checkInUrl: 'https://omnistay.com/guest/checkin/belmond-1092',
        sentAt: 'Pending 24-hr trigger',
      },
    ];
  }

  async sendPreArrivalNotification(bookingId: string, channel: string) {
    return {
      success: true,
      bookingId,
      channel,
      message: `24-hour pre-arrival self check-in link dispatched via ${channel}.`,
      dispatchTimestamp: new Date().toISOString(),
    };
  }

  // --- Room QR Orders & Menu ---
  async createRoomQrOrder(data: {
    roomId: string;
    orderNumber: string;
    totalAmount: number;
    status?: string;
    items: { itemTitle: string; quantity: number; price: number }[];
  }) {
    const { items, ...orderData } = data;
    const cleanRoomId = normalizeUuid(orderData.roomId);

    return this.prisma.roomQrOrder.create({
      data: {
        ...orderData,
        roomId: cleanRoomId,
        items: {
          create: items,
        },
      },
      include: { items: true },
    });
  }

  async findRoomQrOrderById(id: string) {
    await this.ensureCanonicalSeed();
    const cleanId = normalizeUuid(id);
    return this.prisma.roomQrOrder.findUnique({
      where: { id: cleanId },
      include: { items: true },
    });
  }

  async findRoomQrOrdersByRoomId(roomId: string) {
    await this.ensureCanonicalSeed();
    const cleanRoomId = normalizeUuid(roomId);
    return this.prisma.roomQrOrder.findMany({
      where: { roomId: cleanRoomId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRoomQrOrderStatus(id: string, status: string) {
    const cleanId = normalizeUuid(id);
    return this.prisma.roomQrOrder.update({
      where: { id: cleanId },
      data: { status },
      include: { items: true },
    });
  }

  async getDiningMenu() {
    return IN_ROOM_DINING_CATALOG;
  }

  async getQrPlacards() {
    return CANONICAL_ROOMS.map((room) => ({
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomTitle: room.name,
      placardLocation: 'Bedside Table & Work Desk Acrylic Disc',
      directPortalUrl: `http://localhost:3000/guest/room-service?room=${encodeURIComponent(room.roomNumber)}&id=${room.id}`,
      token: `QR-ROOM-${room.roomNumber.replace(/\D/g, '')}-DISC`,
      isActive: true,
    }));
  }
}
