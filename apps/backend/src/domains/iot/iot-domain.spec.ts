import { describe, expect, it } from 'vitest';
import { SmartLockService } from './application/services/smart-lock.service.js';
import { ThermostatService } from './application/services/thermostat.service.js';
import { RoomQrService } from './application/services/room-qr.service.js';
import { ContactlessCheckInService } from './application/services/contactless-checkin.service.js';
import { IIotRepository } from './domain/repositories/iot.repository.interface.js';

describe('Chapter 15: IoT Smart Room & Contactless Hospitality Suite', () => {
  const mockLocks: any[] = [];
  const mockKeys: any[] = [];
  const mockLogs: any[] = [];
  const mockThermostats: any[] = [];
  const mockEnergy: any[] = [];
  const mockQrOrders: any[] = [];

  const mockRepo: IIotRepository = {
    async createLock(data) {
      const lock = { id: `lck-${Date.now()}`, ...data, updatedAt: new Date() };
      mockLocks.push(lock);
      return lock;
    },
    async findLockById(id) {
      return mockLocks.find((l) => l.id === id) || null;
    },
    async findLockByRoomId(roomId) {
      return mockLocks.find((l) => l.roomId === roomId) || null;
    },
    async findLockBySerial(deviceSerial) {
      return mockLocks.find((l) => l.deviceSerial === deviceSerial) || null;
    },
    async updateLock(id, data) {
      const lock = mockLocks.find((l) => l.id === id);
      if (lock) Object.assign(lock, data);
      return lock;
    },
    async listLocks() {
      return mockLocks;
    },
    async getLockTelemetry() {
      return {
        totalLocks: mockLocks.length,
        onlineCount: mockLocks.filter((l) => l.isOnline).length,
        onlinePercentage: 100,
        avgUnlockLatencyMs: 342,
        activeWalletKeys: mockKeys.length,
        batteryAlerts: mockLocks.filter((l) => l.batteryLevel < 25).length,
      };
    },
    async createLockKey(data) {
      const key = { id: `key-${Date.now()}`, ...data, isRevoked: false, createdAt: new Date() };
      mockKeys.push(key);
      return key;
    },
    async findLockKeyByToken(token) {
      return mockKeys.find((k) => k.keyToken === token && !k.isRevoked) || null;
    },
    async revokeLockKey(id) {
      const key = mockKeys.find((k) => k.id === id);
      if (key) key.isRevoked = true;
      return key;
    },
    async createAccessLog(data) {
      const log = { id: `log-${Date.now()}`, ...data, accessedAt: new Date() };
      mockLogs.push(log);
      return log;
    },
    async findAccessLogs(lockId) {
      return mockLogs.filter((l) => l.lockId === lockId);
    },
    async createThermostat(data) {
      const t = { id: `tstat-${Date.now()}`, ...data, updatedAt: new Date() };
      mockThermostats.push(t);
      return t;
    },
    async findThermostatById(id) {
      return mockThermostats.find((t) => t.id === id) || null;
    },
    async findThermostatByRoomId(roomId) {
      return mockThermostats.find((t) => t.roomId === roomId) || null;
    },
    async updateThermostat(id, data) {
      const t = mockThermostats.find((item) => item.id === id);
      if (t) Object.assign(t, data);
      return t;
    },
    async listThermostats() {
      return mockThermostats;
    },
    async createEnergyLog(data) {
      const e = { id: `energy-${Date.now()}`, ...data };
      mockEnergy.push(e);
      return e;
    },
    async findEnergyLogs(thermostatId) {
      return mockEnergy.filter((e) => e.thermostatId === thermostatId);
    },
    async getScenes() {
      return [
        { id: 'scene-welcome', name: 'Welcome Scene', targetTemp: 21.0, lighting: 'Ambient 100%', curtains: 'Open' },
        { id: 'scene-relax', name: 'Relax Scene', targetTemp: 22.0, lighting: 'Dim 40%', curtains: 'Sheer' },
        { id: 'scene-sleep', name: 'Sleep Scene', targetTemp: 20.0, lighting: 'Lights Off', curtains: 'Blackout' },
        { id: 'scene-eco-vacant', name: 'Eco Conservation Mode', targetTemp: 24.0, lighting: 'Off', curtains: 'Closed' },
      ];
    },
    async triggerScene(roomId, sceneId) {
      return { success: true, roomId, sceneTriggered: sceneId, appliedSettings: { targetTemp: 21.0 } };
    },
    async getPreArrivalQueue() {
      return [
        {
          id: 'q-1',
          bookingReference: 'PARIAN-8841',
          guestName: 'Alexandria Sterling',
          roomNumber: 'Room 101',
          notificationStatus: 'Delivered',
        },
      ];
    },
    async sendPreArrivalNotification(bookingId, channel) {
      return { success: true, bookingId, channel, dispatched: true };
    },
    async createRoomQrOrder(data) {
      const order = { id: `order-${Date.now()}`, ...data, createdAt: new Date() };
      mockQrOrders.push(order);
      return order;
    },
    async findRoomQrOrderById(id) {
      return mockQrOrders.find((o) => o.id === id) || null;
    },
    async findRoomQrOrdersByRoomId(roomId) {
      return mockQrOrders.filter((o) => o.roomId === roomId);
    },
    async updateRoomQrOrderStatus(id, status) {
      const o = mockQrOrders.find((order) => order.id === id);
      if (o) o.status = status;
      return o;
    },
    async getDiningMenu() {
      return [
        { id: 'd-1', title: 'Prime Wagyu Ribeye Steak (250g)', category: 'Mains', price: 68.0, dietary: ['Halal'] },
      ];
    },
    async getQrPlacards() {
      return [
        { roomId: 'r-101', roomNumber: 'Room 101', token: 'QR-ROOM-101-DISC', isActive: true },
      ];
    },
  };

  const lockService = new SmartLockService(mockRepo);
  const thermostatService = new ThermostatService(mockRepo);
  const qrService = new RoomQrService(mockRepo);
  const checkInService = new ContactlessCheckInService(mockRepo, lockService);

  it('15.1: should extract passport identity details via high-accuracy OCR parser', async () => {
    const ocr = await checkInService.parsePassportOcr({
      documentUrl: 'https://storage.omnistay.com/passports/scan_001.jpg',
    });
    expect(ocr.success).toBe(true);
    expect(ocr.extractedData.documentType).toBe('PASSPORT');
    expect(ocr.extractedData.fullName).toBe('SADMAN SAKIB');
    expect(ocr.extractedData.issuingCountry).toBe('BGD');
    expect(ocr.confidenceScore).toBeGreaterThanOrEqual(0.95);
  });

  it('15.1: should complete contactless self check-in and issue digital credentials', async () => {
    const res = await checkInService.processSelfCheckIn({
      bookingId: 'bk-uuid-9921',
      fullName: 'Sadman Sakib',
      idNumber: 'A01928391',
      digitalSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
    });
    expect(res.success).toBe(true);
    expect(res.digitalKeycard.bleToken).toMatch(/^BLE-NFC-/);
    expect(res.digitalKeycard.pinCode).toHaveLength(6);
    expect(res.digitalKeycard.appleWalletPassUrl).toContain('bk-uuid-9921.pkpass');
  });

  it('15.1: should retrieve 24-hour pre-arrival notification queue and dispatch notice', async () => {
    const queue = await checkInService.getPreArrivalQueue();
    expect(queue.length).toBeGreaterThanOrEqual(1);
    expect(queue[0].bookingReference).toBe('PARIAN-8841');

    const dispatch = await checkInService.sendPreArrivalNotification('bk-uuid-9921', 'WhatsApp');
    expect(dispatch.success).toBe(true);
  });

  it('15.2: should register smart door lock and issue encrypted BLE key', async () => {
    const lock = await lockService.registerLock({
      roomId: 'room-101',
      lockVendor: 'AssaAbloy',
      deviceSerial: 'LCK-ASSA-101',
    });
    expect(lock.deviceSerial).toBe('LCK-ASSA-101');
    expect(lock.batteryLevel).toBe(100);

    const key = await lockService.generateKey(lock.id, {
      guestId: 'usr-1',
      keyType: 'BLE',
      validFrom: new Date(Date.now() - 1000).toISOString(),
      validUntil: new Date(Date.now() + 86400000).toISOString(),
    });
    expect(key.keyToken).toMatch(/^BLE-/);

    // Test digital unlock handshake (<400ms)
    const unlockRes = await lockService.unlock(lock.id, {
      tokenOrPin: key.keyToken,
      authMethod: 'BLE',
    });
    expect(unlockRes.success).toBe(true);
    expect(unlockRes.handshakeLatencyMs).toBeLessThanOrEqual(400);

    const logs = await lockService.getAccessLogs(lock.id);
    expect(logs.length).toBeGreaterThanOrEqual(1);
    expect(logs[0].isGranted).toBe(true);
  });

  it('15.2: should calculate smart lock fleet telemetry and support staff remote unlock', async () => {
    const telemetry = await lockService.getTelemetry();
    expect(telemetry.totalLocks).toBeGreaterThanOrEqual(1);
    expect(telemetry.avgUnlockLatencyMs).toBeLessThanOrEqual(400);

    const remoteUnlock = await lockService.unlock(mockLocks[0].id, {
      tokenOrPin: 'REMOTE_ADMIN_OVERRIDE',
      authMethod: 'REMOTE_STAFF',
    });
    expect(remoteUnlock.success).toBe(true);
  });

  it('15.3: should manage thermostat climate control and log energy consumption', async () => {
    const tstat = await thermostatService.configureThermostat({
      roomId: 'room-101',
      deviceBrand: 'Honeywell',
      targetTemp: 21.0,
    });
    expect(tstat.targetTemp).toBe(21.0);

    const updated = await thermostatService.updateTemperature(tstat.id, {
      targetTemp: 24.0,
      ecoMode: true,
    });
    expect(updated.targetTemp).toBe(24.0);
    expect(updated.ecoMode).toBe(true);

    const energy = await thermostatService.logEnergy(tstat.id, {
      kwhConsumed: 12.4,
    });
    expect(energy.kwhConsumed).toBe(12.4);

    const logs = await thermostatService.getEnergyLogs(tstat.id);
    expect(logs.length).toBe(1);
  });

  it('15.3: should retrieve supported scenes and trigger ambient lighting / curtain presets', async () => {
    const scenes = await thermostatService.getScenes();
    expect(scenes.length).toBe(4);
    expect(scenes[0].name).toBe('Welcome Scene');

    const trigger = await thermostatService.triggerScene('room-101', 'scene-welcome');
    expect(trigger.success).toBe(true);
  });

  it('15.4: should process contactless in-room QR dining order with KDS dispatch', async () => {
    const menu = await qrService.getMenu();
    expect(menu.length).toBeGreaterThanOrEqual(1);

    const placards = await qrService.getPlacards();
    expect(placards.length).toBeGreaterThanOrEqual(1);

    const order = await qrService.createQrOrder({
      roomId: 'room-101',
      items: [
        { itemTitle: 'Avocado Tartine', quantity: 2, price: 14.0 },
        { itemTitle: 'Sparkling Mineral Water', quantity: 1, price: 6.0 },
      ],
    });
    expect(order.orderNumber).toMatch(/^QR-/);
    expect(order.totalAmount).toBe(34.0);
    expect(order.status).toBe('received_at_kitchen');
    expect(order.dispatchedToKds).toBe(true);
    expect(order.billedToFolio).toBe(true);

    const updated = await qrService.updateOrderStatus(order.id, 'delivering');
    expect(updated.status).toBe('delivering');
  });
});
