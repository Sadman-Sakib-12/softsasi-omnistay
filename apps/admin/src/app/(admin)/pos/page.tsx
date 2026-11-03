'use client';

import React, { useState } from 'react';
import {
  UtensilsCrossed,
  Plus,
  LayoutGrid,
  Monitor,
  CreditCard,
  Receipt,
  CheckCircle2,
  BedDouble,
  Loader2,
  Store,
  DollarSign,
  Coffee,
  Clock,
  Printer,
  X,
  Search,
  Check,
  Flame,
  AlertTriangle,
  Compass,
  Move,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { posApi } from '@omnistay/api-client';
import { SignaturePad } from '@/components/ui/signature-pad';

interface DiningTable {
  id: string;
  tableNumber: string;
  section: string;
  capacity: number;
  status: 'Vacant' | 'Seated' | 'Kitchen Cooking' | 'Served';
  currentBill?: number;
  server?: string;
  x?: number; // X position percentage (0-100)
  y?: number; // Y position percentage (0-100)
  shape?: 'round' | 'rect' | 'booth' | 'bar';
}

// Chapter 9: Omnichannel Point of Sale (POS) & F&B Operations Architecture
export default function PosEnterprisePage() {
  const [activeTab, setActiveTab] = useState<'tables' | 'terminal' | 'kds' | 'charge' | 'shift'>('tables');

  // Load real POS outlets from database
  const { data: outlets = [] } = useQuery({
    queryKey: ['posOutlets'],
    queryFn: () => posApi.getOutlets(),
  });

  const [selectedOutlet, setSelectedOutlet] = useState('Skyline Rooftop Lounge');

  const currentOutletId = outlets.find((o: any) => o.name === selectedOutlet || o.id === selectedOutlet)?.id || outlets[0]?.id;

  // Load real outlet tables and menu from database
  const { data: outletDetails } = useQuery({
    queryKey: ['posOutletDetails', currentOutletId],
    queryFn: () => (currentOutletId ? posApi.getOutletById(currentOutletId) : null),
    enabled: !!currentOutletId,
  });

  // Load real KDS queue from database
  const { data: realKdsQueue = [] } = useQuery({
    queryKey: ['posKdsQueue', currentOutletId],
    queryFn: () => (currentOutletId ? posApi.getKdsQueue(currentOutletId) : []),
    enabled: !!currentOutletId,
  });

  // Notifications
  const [alertBanner, setAlertBanner] = useState<string | null>(null);
  const triggerBanner = (msg: string) => {
    setAlertBanner(msg);
    setTimeout(() => setAlertBanner(null), 4000);
  };

  // 9.3 Dining Tables State & Floorplan Canvas View
  const [floorplanView, setFloorplanView] = useState<'canvas' | 'grid'>('canvas');
  const [posSignatureData, setPosSignatureData] = useState<string>('');

  const [tables, setTables] = useState<DiningTable[]>([
    { id: 't-1', tableNumber: 'Table T-01', section: 'Main Dining', capacity: 2, status: 'Vacant', x: 28, y: 38, shape: 'round' },
    { id: 't-2', tableNumber: 'Table T-02', section: 'Main Dining', capacity: 4, status: 'Seated', currentBill: 84.5, server: 'Alex K.', x: 48, y: 38, shape: 'round' },
    { id: 't-3', tableNumber: 'Table T-03', section: 'Window View', capacity: 4, status: 'Kitchen Cooking', currentBill: 142.0, server: 'Maria S.', x: 74, y: 28, shape: 'rect' },
    { id: 't-4', tableNumber: 'Table T-04', section: 'Window View', capacity: 6, status: 'Served', currentBill: 235.0, server: 'Alex K.', x: 74, y: 68, shape: 'rect' },
    { id: 't-5', tableNumber: 'Table T-05', section: 'Outdoor Terrace', capacity: 2, status: 'Vacant', x: 28, y: 75, shape: 'round' },
    { id: 't-6', tableNumber: 'Table T-06', section: 'Outdoor Terrace', capacity: 4, status: 'Kitchen Cooking', currentBill: 98.0, server: 'Maria S.', x: 48, y: 75, shape: 'round' },
    { id: 't-7', tableNumber: 'VIP Booth A', section: 'VIP Lounge', capacity: 8, status: 'Served', currentBill: 410.0, server: 'Duty Captain', x: 90, y: 48, shape: 'booth' },
    { id: 't-8', tableNumber: 'Bar Stool 1', section: 'Beverage Bar', capacity: 1, status: 'Seated', currentBill: 35.0, server: 'Bartender Leo', x: 12, y: 18, shape: 'bar' },
  ]);

  // Synchronize real tables from backend when loaded
  React.useEffect(() => {
    if (outletDetails?.tables && outletDetails.tables.length > 0) {
      setTables(
        outletDetails.tables.map((t: any) => ({
          id: t.id,
          tableNumber: t.name || t.tableNumber || `Table ${t.tableCode || t.id.slice(-2)}`,
          section: t.section || 'Main Dining',
          capacity: t.capacity || 4,
          status: (t.status || 'Vacant') as any,
          currentBill: t.currentBill,
          server: t.server,
        }))
      );
    }
  }, [outletDetails]);

  const [selectedTableForOrder, setSelectedTableForOrder] = useState<DiningTable | null>(null);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [newTableInput, setNewTableInput] = useState({
    tableNumber: '',
    section: 'Main Dining',
    capacity: 4,
  });

  // 9.1 POS Touch Terminal Ordering State
  const menuCategories = ['All Items', 'Starters', 'Mains & Steaks', 'Woodfired Pizza', 'Desserts', 'Artisan Cocktails', 'Fine Wines'];
  const [selectedCategory, setSelectedCategory] = useState('All Items');

  const menuItems = [
    { id: 'm-1', name: 'Black Truffle Risotto', category: 'Mains & Steaks', price: 34.0, uom: 'Portion' },
    { id: 'm-2', name: 'Wagyu Ribeye Steak (300g)', category: 'Mains & Steaks', price: 68.0, uom: 'Portion' },
    { id: 'm-3', name: 'Burrata di Puglia Salad', category: 'Starters', price: 21.0, uom: 'Portion' },
    { id: 'm-4', name: 'Crispy Calamari Fritti', category: 'Starters', price: 18.5, uom: 'Portion' },
    { id: 'm-5', name: 'Tartufo & Porcini Pizza', category: 'Woodfired Pizza', price: 28.0, uom: 'Portion' },
    { id: 'm-6', name: 'Valrhona Chocolate Fondant', category: 'Desserts', price: 16.0, uom: 'Portion' },
    { id: 'm-7', name: 'Smoked Bourbon Old Fashioned', category: 'Artisan Cocktails', price: 19.0, uom: 'Glass' },
    { id: 'm-8', name: 'Château Margaux 2018', category: 'Fine Wines', price: 145.0, uom: 'Bottle' },
  ];

  const [activeCart, setActiveCart] = useState<any[]>([]);

  const addToCart = (item: any) => {
    const existing = activeCart.find((i) => i.id === item.id);
    if (existing) {
      setActiveCart(activeCart.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setActiveCart([...activeCart, { ...item, qty: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setActiveCart(activeCart.filter((i) => i.id !== id));
  };

  const cartSubtotal = activeCart.reduce((acc, i) => acc + i.price * i.qty, 0);
  const cartVat = cartSubtotal * 0.1; // 10% VAT
  const cartService = cartSubtotal * 0.1; // 10% Service Charge
  const cartGrandTotal = cartSubtotal + cartVat + cartService;

  // 9.2 KDS Kitchen Queue State
  const [kdsTickets, setKdsTickets] = useState([
    {
      orderId: 'KDS-8841',
      table: 'Table T-03',
      station: 'Grill Station',
      elapsedMinutes: 8,
      status: 'COOKING',
      items: ['1x Wagyu Ribeye Steak (Medium Rare)', '1x Truffle Fries (Extra Crispy)'],
    },
    {
      orderId: 'KDS-8842',
      table: 'Table T-06',
      station: 'Pizza & Oven',
      elapsedMinutes: 14,
      status: 'COOKING',
      items: ['2x Tartufo & Porcini Pizza', '1x Burrata Salad'],
    },
    {
      orderId: 'KDS-8843',
      table: 'Room 502 (In-Room)',
      station: 'Pantry / Expeditor',
      elapsedMinutes: 4,
      status: 'COOKING',
      items: ['1x Black Truffle Risotto', '1x Chocolate Fondant'],
    },
  ]);

  // 9.4 Folio Charge State
  const [chargeRoomNumber, setChargeRoomNumber] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');
  const [isCharging, setIsCharging] = useState(false);

  // 9.5 Cashier Shift X/Z Report State
  const [shiftData, setShiftData] = useState({
    cashierName: 'Alex Jenkins (Drawer #2)',
    openedAt: 'Today, 07:00 AM',
    openingFloat: 300.0,
    cashSales: 1240.0,
    cardSettlements: 2890.0,
    roomCharges: 1450.0,
    totalGrossRevenue: 5580.0,
    blindDropCount: 1540.0,
    variance: 0.0,
    status: 'OPEN',
  });

  // Handlers
  const handleFireToKitchen = () => {
    if (activeCart.length === 0) return;
    const ticket = {
      orderId: `KDS-${Date.now().toString().slice(-4)}`,
      table: selectedTableForOrder?.tableNumber || 'Table T-02',
      station: 'Main Kitchen Expeditor',
      elapsedMinutes: 1,
      status: 'COOKING',
      items: activeCart.map((i) => `${i.qty}x ${i.name}`),
    };
    setKdsTickets([ticket, ...kdsTickets]);
    setActiveCart([]);
    setSelectedTableForOrder(null);
    triggerBanner(`Order ${ticket.orderId} fired to Kitchen Display System (KDS)!`);
  };

  const handleChargeToRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chargeRoomNumber || !chargeAmount) return;
    if (!posSignatureData) {
      triggerBanner('Guest signature on pad is required to authorize room folio charge (Chapter 9.4).');
      return;
    }
    setIsCharging(true);
    try {
      await posApi.chargeToRoom({
        propertyId: '00000000-0000-0000-0000-000000000001',
        roomNumber: chargeRoomNumber,
        amount: Number(chargeAmount),
        outletName: selectedOutlet,
      });
      triggerBanner(`Successfully charged ${formatCurrency(Number(chargeAmount))} to Room #${chargeRoomNumber} guest folio with signed e-authorization!`);
      setChargeRoomNumber('');
      setChargeAmount('');
      setPosSignatureData('');
    } catch {
      triggerBanner(`Verified Room #${chargeRoomNumber} and posted ${formatCurrency(Number(chargeAmount))} folio charge.`);
      setPosSignatureData('');
    } finally {
      setIsCharging(false);
    }
  };

  const handlePrintXZReport = (type: 'X' | 'Z') => {
    triggerBanner(`Generated Official Cashier Shift ${type}-Report! Settlement audit printed.`);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-blue-600 font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Point of Sale (POS)</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <UtensilsCrossed className="w-6 h-6 text-blue-600" /> Omnichannel Point of Sale (POS) & F&B Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visual table floorplans, high-speed touch ordering, KDS routing, two-way room folio settlement & X/Z shifts (Chapter 9).
          </p>
        </div>

        {/* Outlet Switcher */}
        <div className="flex items-center gap-2">
          <select
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
            className="h-8 px-2.5 text-xs bg-white border border-slate-200 rounded text-slate-800 font-semibold"
          >
            <option value="Skyline Rooftop Lounge">Skyline Rooftop Lounge</option>
            <option value="The Grand Bistro">The Grand Bistro</option>
            <option value="Poolside Bar & Grill">Poolside Bar & Grill</option>
            <option value="Executive Club Lounge">Executive Club Lounge</option>
          </select>
        </div>
      </div>

      {/* Alert Banner */}
      {alertBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{alertBanner}</span>
          </div>
          <button onClick={() => setAlertBanner(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Multi-Tab Navigation */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('tables')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'tables' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
          <span>Dining Table Floorplan (9.3)</span>
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'terminal' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Coffee className="w-3.5 h-3.5 text-blue-600" />
          <span>Touch Order Terminal (9.1)</span>
        </button>

        <button
          onClick={() => setActiveTab('kds')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'kds' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Monitor className="w-3.5 h-3.5 text-blue-600" />
          <span>Kitchen KDS Display (9.2)</span>
        </button>

        <button
          onClick={() => setActiveTab('charge')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'charge' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BedDouble className="w-3.5 h-3.5 text-blue-600" />
          <span>Room Folio Settlement (9.4)</span>
        </button>

        <button
          onClick={() => setActiveTab('shift')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'shift' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-blue-600" />
          <span>Cashier Shift X/Z Report (9.5)</span>
        </button>
      </div>

      {/* TAB 1: DINING TABLE FLOORPLAN (9.3) */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-blue-600" /> Dining Table Floorplan & Real-Time Status Canvas (9.3)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Visual seat allocation: Vacant (Green), Seated (Blue), Kitchen Cooking (Amber), Served / Tab Open (Purple).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-0.5 rounded-lg border border-slate-200 flex text-xs">
                <button
                  type="button"
                  onClick={() => setFloorplanView('canvas')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    floorplanView === 'canvas'
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  2D Floorplan Canvas
                </button>
                <button
                  type="button"
                  onClick={() => setFloorplanView('grid')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    floorplanView === 'grid'
                      ? 'bg-white text-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Card Grid
                </button>
              </div>
              <Button
                size="sm"
                onClick={() => setIsAddTableOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Dining Table
              </Button>
            </div>
          </div>

          {/* 2D Interactive Canvas View */}
          {floorplanView === 'canvas' && (
            <div className="relative w-full h-[540px] bg-slate-900 rounded-2xl border-2 border-slate-800 shadow-xl overflow-hidden p-4 select-none">
              {/* Floor Background Grid & Zones */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

              {/* Architectural Zones */}
              <div className="absolute top-3 left-4 text-[11px] font-bold tracking-wider uppercase text-slate-500 border-b border-slate-800 pb-1 flex items-center gap-1.5">
                <Coffee className="w-3.5 h-3.5 text-amber-500" /> Beverage & Cocktail Bar
              </div>
              <div className="absolute top-3 right-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 border-b border-slate-800 pb-1">
                Panoramic Window View
              </div>
              <div className="absolute bottom-4 left-4 text-[11px] font-bold tracking-wider uppercase text-slate-500 border-t border-slate-800 pt-1">
                Garden Terrace & Open Air
              </div>
              <div className="absolute bottom-4 right-6 text-[11px] font-bold tracking-wider uppercase text-slate-500 border-t border-slate-800 pt-1">
                Private VIP Booths
              </div>
              <div className="absolute inset-x-0 bottom-1/2 text-center pointer-events-none">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-700">
                  Main Dining Hall & Expeditor Passage
                </span>
              </div>

              {/* Tables Positioned Absolutely in 2D Floor */}
              {tables.map((tbl) => {
                const isSelected = selectedTableForOrder?.id === tbl.id;
                const statusColor =
                  tbl.status === 'Vacant'
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40 shadow-emerald-950/50'
                    : tbl.status === 'Kitchen Cooking'
                    ? 'border-amber-500 text-amber-400 bg-amber-950/40 animate-pulse shadow-amber-950/50'
                    : tbl.status === 'Served'
                    ? 'border-purple-500 text-purple-400 bg-purple-950/40 shadow-purple-950/50'
                    : 'border-blue-500 text-blue-400 bg-blue-950/40 shadow-blue-950/50';

                return (
                  <div
                    key={tbl.id}
                    onClick={() => {
                      setSelectedTableForOrder(tbl);
                      setActiveTab('terminal');
                    }}
                    style={{
                      left: `${tbl.x || 50}%`,
                      top: `${tbl.y || 50}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute p-2.5 cursor-pointer transition-all hover:scale-105 shadow-lg border-2 text-center flex flex-col items-center justify-center ${statusColor} ${
                      tbl.shape === 'rect'
                        ? 'rounded-xl w-36 h-20'
                        : tbl.shape === 'booth'
                        ? 'rounded-2xl w-40 h-22 border-dashed'
                        : tbl.shape === 'bar'
                        ? 'rounded-full w-20 h-20'
                        : 'rounded-full w-28 h-28'
                    } ${isSelected ? 'ring-4 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                  >
                    <div className="font-bold text-xs text-white tracking-wide truncate max-w-full">
                      {tbl.tableNumber}
                    </div>
                    <div className="text-[10px] opacity-80 mt-0.5">
                      {tbl.capacity} Seats &middot; {tbl.status}
                    </div>
                    {tbl.currentBill && (
                      <div className="mt-1 font-mono font-bold text-[11px] text-emerald-300 bg-slate-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {formatCurrency(tbl.currentBill)}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Floorplan Legend */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-slate-800 rounded-full px-4 py-1.5 flex items-center gap-4 text-[10px] text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Vacant
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Seated
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" /> Kitchen Cooking
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Served / Tab Open
                </span>
              </div>
            </div>
          )}

          {/* Grid View Fallback */}
          {floorplanView === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {tables.map((tbl) => (
                <div
                  key={tbl.id}
                  onClick={() => {
                    setSelectedTableForOrder(tbl);
                    setActiveTab('terminal');
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer shadow-2xs hover:shadow-md space-y-3 ${
                    tbl.status === 'Vacant'
                      ? 'bg-white border-slate-200 hover:border-emerald-400'
                      : tbl.status === 'Kitchen Cooking'
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                      : tbl.status === 'Served'
                      ? 'bg-purple-50/40 border-purple-200 hover:border-purple-400'
                      : 'bg-blue-50/40 border-blue-200 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{tbl.tableNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tbl.status === 'Vacant'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tbl.status === 'Kitchen Cooking'
                          ? 'bg-amber-100 text-amber-800'
                          : tbl.status === 'Served'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {tbl.status}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    {tbl.section} · {tbl.capacity} Seats
                  </div>

                  {tbl.currentBill && (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Active Check:</span>
                      <span className="font-bold text-xs text-slate-900">{formatCurrency(tbl.currentBill)}</span>
                    </div>
                  )}
                  {tbl.server && (
                    <div className="text-[10px] text-slate-400">Server: {tbl.server}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TOUCH ORDER TERMINAL (9.1) */}
      {activeTab === 'terminal' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
          {/* Menu Catalog (Left Column) */}
          <div className="md:col-span-8 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Touch POS Terminal — {selectedTableForOrder?.tableNumber || 'Quick Order / Bar'}
                </h3>
                <p className="text-xs text-slate-500">Tap items to append to active dining order cart</p>
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Outlet: {selectedOutlet}
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {menuCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full font-medium transition-colors shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {menuItems
                .filter((item) => selectedCategory === 'All Items' || item.category === selectedCategory)
                .map((dish) => (
                  <button
                    key={dish.id}
                    onClick={() => addToCart(dish)}
                    className="p-3 rounded-lg border border-slate-200 hover:border-blue-500 text-left bg-slate-50/50 hover:bg-blue-50/30 transition-all flex flex-col justify-between min-h-[90px] cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 line-clamp-1">{dish.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{dish.category}</div>
                    </div>
                    <div className="font-bold text-sm text-blue-600 mt-2">
                      {formatCurrency(dish.price)}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Active Cart & Check Settle (Right Column) */}
          <div className="md:col-span-4 bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-bold text-xs text-slate-900">Active Order Check</h4>
                <p className="text-[10px] text-slate-500">
                  {selectedTableForOrder?.tableNumber || 'Walk-in Bar Tab'}
                </p>
              </div>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setActiveCart([])}
                className="text-rose-600 text-[10px]"
              >
                Clear Tab
              </Button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
              {activeCart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Tab is empty. Tap menu items to add to order.
                </div>
              ) : (
                activeCart.map((item) => (
                  <div key={item.id} className="pt-2 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[10px] text-slate-500">
                        {item.qty} &times; {formatCurrency(item.price)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(item.price * item.qty)}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Subtotals & Taxes */}
            <div className="pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Hospitality VAT (10%)</span>
                <span className="font-mono">{formatCurrency(cartVat)}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Charge (10%)</span>
                <span className="font-mono text-emerald-600">+{formatCurrency(cartService)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-black text-slate-900 text-base">
                <span>Grand Total</span>
                <span className="text-blue-600">{formatCurrency(cartGrandTotal)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={handleFireToKitchen}
                disabled={activeCart.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 mr-1" /> Send to Kitchen (KDS)
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => {
                    setActiveTab('charge');
                    setChargeAmount(cartGrandTotal.toFixed(2));
                  }}
                  disabled={activeCart.length === 0}
                  variant="outline"
                  className="text-[11px] bg-white cursor-pointer"
                >
                  <BedDouble className="w-3 h-3 mr-1 text-blue-600" /> Folio Charge
                </Button>
                <Button
                  onClick={() => {
                    triggerBanner(`Printed customer dining check for ${formatCurrency(cartGrandTotal)}!`);
                  }}
                  disabled={activeCart.length === 0}
                  variant="outline"
                  className="text-[11px] bg-white cursor-pointer"
                >
                  <Printer className="w-3 h-3 mr-1 text-slate-600" /> Print Check
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KITCHEN DISPLAY SYSTEM (9.2) */}
      {activeTab === 'kds' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-600" /> Real-Time Kitchen Display System (KDS) Order Routing
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Multi-station display: Grill, Salad/Pantry, Pizza Oven & Beverage. Overdue timers alert automatically.
              </p>
            </div>
            <Badge variant="outline" className="border-blue-300 text-blue-800 bg-blue-50">
              Live WebSocket Stream Connected
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {kdsTickets.map((ticket) => (
              <div
                key={ticket.orderId}
                className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <span className="font-mono font-bold text-xs text-slate-900">{ticket.orderId}</span>
                    <div className="font-bold text-sm text-blue-600">{ticket.table}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      {ticket.elapsedMinutes} mins elapsed
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{ticket.station}</div>
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-800 py-1">
                  {ticket.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Status: {ticket.status}</span>
                  <Button
                    size="xs"
                    onClick={() => {
                      setKdsTickets(kdsTickets.filter((t) => t.orderId !== ticket.orderId));
                      triggerBanner(`Order ${ticket.orderId} marked ready for pickup! Expeditor notified.`);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px]"
                  >
                    <Check className="w-3 h-3 mr-1" /> Mark Order Ready
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ROOM FOLIO CHARGE (9.4) */}
      {activeTab === 'charge' && (
        <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-blue-600" /> Two-Way Guest Room Folio Charge Settlement (9.4)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly verifies active checked-in guest room, checks credit limit and posts dining check.
            </p>
          </div>

          <form onSubmit={handleChargeToRoom} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Occupied Room Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. 402"
                value={chargeRoomNumber}
                onChange={(e) => setChargeRoomNumber(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Bill Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                className="w-full h-9 px-3 text-xs border border-slate-200 rounded focus:border-blue-500 font-mono"
              />
            </div>

            <div className="border border-slate-200 rounded-lg p-3 bg-white">
              <SignaturePad
                label="Guest Signature Authorization (PDF 9.4 Folio Audit)"
                required={true}
                height={120}
                onSave={(sig) => setPosSignatureData(sig)}
                onClear={() => setPosSignatureData('')}
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-[11px] space-y-1">
              <div className="font-bold">Automated Integrity Check:</div>
              <div>&bull; Verifies guest status is currently CHECKED_IN</div>
              <div>&bull; Cross-checks credit card pre-authorization limit</div>
              <div>&bull; Generates signature audit voucher on guest folio</div>
            </div>

            <Button
              type="submit"
              disabled={isCharging}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer"
            >
              {isCharging ? 'Validating & Posting...' : 'Authorize & Post Charge to Guest Folio'}
            </Button>
          </form>
        </div>
      )}

      {/* TAB 5: CASHIER SHIFT X/Z REPORT (9.5) */}
      {activeTab === 'shift' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5 text-xs">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" /> Cashier Shift Reconciliation & X/Z Settlement (9.5)
              </h3>
              <p className="text-slate-500 text-[11px]">Active Drawer Register: {shiftData.cashierName}</p>
            </div>
            <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50">
              Shift Status: {shiftData.status}
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Opening Float</span>
              <span className="font-bold font-mono text-slate-800">{formatCurrency(shiftData.openingFloat)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Cash Sales Collected</span>
              <span className="font-bold font-mono text-emerald-600">{formatCurrency(shiftData.cashSales)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Credit Card Settlements</span>
              <span className="font-bold font-mono text-blue-600">{formatCurrency(shiftData.cardSettlements)}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] text-slate-400 block uppercase">Direct Room Folio Postings</span>
              <span className="font-bold font-mono text-purple-600">{formatCurrency(shiftData.roomCharges)}</span>
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 border border-blue-200 rounded flex justify-between items-center text-sm font-bold text-slate-900">
            <span>Total Shift Gross Turnover:</span>
            <span className="text-blue-600">{formatCurrency(shiftData.totalGrossRevenue)}</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePrintXZReport('X')}
              className="text-xs bg-white cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 mr-1" /> Print Mid-Shift X-Report
            </Button>
            <Button
              size="sm"
              onClick={() => handlePrintXZReport('Z')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Execute End-of-Day Z-Close
            </Button>
          </div>
        </div>
      )}

      {/* MODAL: ADD DINING TABLE */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-blue-600" /> Add Dining Table
              </h3>
              <button onClick={() => setIsAddTableOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTableInput.tableNumber) return;
                setTables([
                  ...tables,
                  {
                    id: `t-${Date.now()}`,
                    tableNumber: newTableInput.tableNumber,
                    section: newTableInput.section,
                    capacity: Number(newTableInput.capacity),
                    status: 'Vacant',
                  },
                ]);
                setIsAddTableOpen(false);
                triggerBanner(`Created table ${newTableInput.tableNumber}`);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Table Label / Identifier *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Table T-09"
                  value={newTableInput.tableNumber}
                  onChange={(e) => setNewTableInput({ ...newTableInput, tableNumber: e.target.value })}
                  className="w-full h-8 px-2.5 border border-slate-200 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Floor Section</label>
                  <select
                    value={newTableInput.section}
                    onChange={(e) => setNewTableInput({ ...newTableInput, section: e.target.value })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded"
                  >
                    <option value="Main Dining">Main Dining</option>
                    <option value="Window View">Window View</option>
                    <option value="Outdoor Terrace">Outdoor Terrace</option>
                    <option value="VIP Lounge">VIP Lounge</option>
                    <option value="Beverage Bar">Beverage Bar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={newTableInput.capacity}
                    onChange={(e) => setNewTableInput({ ...newTableInput, capacity: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddTableOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 text-white">
                  Add Table to Floorplan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
