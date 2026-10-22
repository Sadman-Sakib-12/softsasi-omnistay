export const IOT_REPOSITORY_TOKEN = Symbol('IIotRepository');

export interface IIotRepository {
  // Smart Locks
  createLock(data: { roomId: string; lockVendor?: string; deviceSerial: string; batteryLevel?: number; isOnline?: boolean }): Promise<any>;
  findLockById(id: string): Promise<any | null>;
  findLockByRoomId(roomId: string): Promise<any | null>;
  findLockBySerial(deviceSerial: string): Promise<any | null>;
  updateLock(id: string, data: Record<string, any>): Promise<any>;
  listLocks(): Promise<any[]>;

  // Smart Lock Keys
  createLockKey(data: { lockId: string; guestId?: string; keyType: string; keyToken: string; validFrom: Date; validUntil: Date }): Promise<any>;
  findLockKeyByToken(token: string): Promise<any | null>;
  revokeLockKey(id: string): Promise<any>;

  // Access Logs
  createAccessLog(data: { lockId: string; authMethod: string; isGranted: boolean }): Promise<any>;
  findAccessLogs(lockId: string): Promise<any[]>;

  // Thermostats & Energy Logs
  createThermostat(data: { roomId: string; deviceBrand?: string; targetTemp?: number; currentTemp?: number; ecoMode?: boolean }): Promise<any>;
  findThermostatById(id: string): Promise<any | null>;
  findThermostatByRoomId(roomId: string): Promise<any | null>;
  updateThermostat(id: string, data: Record<string, any>): Promise<any>;
  listThermostats(): Promise<any[]>;
  createEnergyLog(data: { thermostatId: string; kwhConsumed: number; loggedDate: Date }): Promise<any>;
  findEnergyLogs(thermostatId: string): Promise<any[]>;

  // Room QR Orders
  createRoomQrOrder(data: { roomId: string; orderNumber: string; totalAmount: number; status?: string; items: { itemTitle: string; quantity: number; price: number }[] }): Promise<any>;
  findRoomQrOrderById(id: string): Promise<any | null>;
  findRoomQrOrdersByRoomId(roomId: string): Promise<any[]>;
  updateRoomQrOrderStatus(id: string, status: string): Promise<any>;
}
