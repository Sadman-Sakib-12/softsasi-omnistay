'use client';

import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  LayoutGrid,
  Monitor,
  CreditCard,
  Receipt,
  CheckCircle2,
  BedDouble,
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
  Wine,
  Sparkles,
  Split,
  ArrowRightLeft,
  ShieldCheck,
  UserCheck,
  FileText,
  BadgeAlert,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BeatLoader } from 'react-spinners';
import {
  posService,
  PosOutlet,
  DiningTableItem,
  PosMenuItem,
  PosOutletDetail,
  KdsTicket,
  RoomVerificationResult,
  CashierShift,
  XReportResult,
  ZReportResult,
} from '@/features/pos/services/pos.service';
import { SignaturePad } from '@/components/ui/signature-pad';

// CHAPTER 9: OMNI-CHANNEL POINT OF SALE (POS) & F&B OPERATIONS
export default function PosEnterprisePage() {
  const queryClient = useQueryClient();

  // 5 Specialized Chapter 9 Tabs
  const [activeTab, setActiveTab] = useState<'terminal' | 'tables' | 'kds' | 'charge' | 'shift'>('terminal');

  // Toast / Alert banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ---------------------------------------------------------------------------
  // 9.1 OUTLET SELECTOR & REAL BACKEND QUERIES
  // ---------------------------------------------------------------------------
  const { data: outlets = [], isLoading: isLoadingOutlets } = useQuery<PosOutlet[]>({
    queryKey: ['posOutlets'],
    queryFn: () => posService.getOutlets(),
  });

  const [selectedOutletId, setSelectedOutletId] = useState<string>('');

  useEffect(() => {
    if (outlets.length > 0 && !selectedOutletId) {
      setSelectedOutletId(outlets[0].id);
    }
  }, [outlets, selectedOutletId]);

  const activeOutletId = selectedOutletId || (outlets[0]?.id ?? '');

  // Outlet Detail (Tables, Menus, Terminals)
  const { data: outletDetail, isLoading: isLoadingOutletDetail, refetch: refetchOutletDetail } = useQuery<PosOutletDetail | null>({
    queryKey: ['posOutletDetail', activeOutletId],
    queryFn: () => (activeOutletId ? posService.getOutletById(activeOutletId) : null),
    enabled: Boolean(activeOutletId),
  });

  // Real KDS Queue
  const { data: kdsQueue = [], isLoading: isLoadingKds, refetch: refetchKds } = useQuery<KdsTicket[]>({
    queryKey: ['posKdsQueue', activeOutletId],
    queryFn: () => (activeOutletId ? posService.getKdsQueue(activeOutletId) : []),
    enabled: Boolean(activeOutletId),
    refetchInterval: 15000, // Poll every 15s for live kitchen tickets
  });

  // Active Terminal for Shift
  const activeTerminal = outletDetail?.terminals?.[0];

  // Real Cashier Shift
  const { data: activeShift, isLoading: isLoadingShift, refetch: refetchShift } = useQuery<CashierShift | null>({
    queryKey: ['posActiveShift', activeTerminal?.id],
    queryFn: () => posService.getActiveShift(activeTerminal?.id),
    enabled: Boolean(activeTerminal?.id),
  });

  // ---------------------------------------------------------------------------
  // 9.1 POS TOUCH TERMINAL CART & ORDERING STATE
  // ---------------------------------------------------------------------------
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeCart, setActiveCart] = useState<
    Array<{
      id: string;
      name: string;
      price: number;
      qty: number;
      notes?: string;
    }>
  >([]);

  const [selectedTableForOrder, setSelectedTableForOrder] = useState<DiningTableItem | null>(null);
  const [serverName, setServerName] = useState('Alexander Jenkins (Waitstaff)');
  const [guestCount, setGuestCount] = useState(2);

  // Settlement Modals
  const [isSettleOpen, setIsSettleOpen] = useState(false);
  const [isSplitCheckOpen, setIsSplitCheckOpen] = useState(false);
  const [splitCount, setSplitCount] = useState(2);

  // Cart Totals: 10% Service Charge + 5% Dining Tax
  const cartSubtotal = activeCart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartServiceCharge = Math.round(cartSubtotal * 0.1 * 100) / 100;
  const cartTax = Math.round(cartSubtotal * 0.05 * 100) / 100;
  const cartGrandTotal = Math.round((cartSubtotal + cartServiceCharge + cartTax) * 100) / 100;

  const addToCart = (item: PosMenuItem) => {
    const existing = activeCart.find((i) => i.id === item.id);
    if (existing) {
      setActiveCart(activeCart.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)));
    } else {
      setActiveCart([...activeCart, { id: item.id, name: item.itemName, price: item.price, qty: 1 }]);
    }
  };

  const updateCartQty = (id: string, delta: number) => {
    setActiveCart(
      activeCart
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  // ---------------------------------------------------------------------------
  // 9.2 TABLE MANAGEMENT & FLOOR PLANS STATE
  // ---------------------------------------------------------------------------
  const [floorplanView, setFloorplanView] = useState<'canvas' | 'grid'>('canvas');
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [newTable, setNewTable] = useState({ tableNumber: 'Table T-07', seatingCap: 4, posX: 30, posY: 50 });

  const [isTransferTableOpen, setIsTransferTableOpen] = useState(false);
  const [transferState, setTransferState] = useState({ sourceTableId: '', targetTableId: '', reason: 'Guest requested window view' });

  const [isMergeTablesOpen, setIsMergeTablesOpen] = useState(false);
  const [mergePrimaryId, setMergePrimaryId] = useState('');
  const [mergeSelectedIds, setMergeSelectedIds] = useState<string[]>([]);

  // ---------------------------------------------------------------------------
  // 9.3 KDS FILTER STATE
  // ---------------------------------------------------------------------------
  const [kdsStationFilter, setKdsStationFilter] = useState<string>('All');

  // ---------------------------------------------------------------------------
  // 9.4 TWO-WAY ROOM CHARGE STATE
  // ---------------------------------------------------------------------------
  const [roomNumberInput, setRoomNumberInput] = useState('302');
  const [isVerifyingRoom, setIsVerifyingRoom] = useState(false);
  const [roomVerification, setRoomVerification] = useState<RoomVerificationResult | null>(null);
  const [chargeAmountInput, setChargeAmountInput] = useState('145.00');
  const [posSignatureData, setPosSignatureData] = useState<string>('');

  // ---------------------------------------------------------------------------
  // 9.5 CASHIER SHIFT MANAGEMENT STATE
  // ---------------------------------------------------------------------------
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [openShiftFloat, setOpenShiftFloat] = useState(500.0);
  const [isCashDropOpen, setIsCashDropOpen] = useState(false);
  const [cashDropInput, setCashDropInput] = useState({ amount: 300.0, reason: 'Mid-day safe drop (excess cash limit)' });

  const [isXReportOpen, setIsXReportOpen] = useState(false);
  const [xReportData, setXReportData] = useState<XReportResult | null>(null);

  const [isZReportOpen, setIsZReportOpen] = useState(false);
  const [zReportData, setZReportData] = useState<ZReportResult | null>(null);
  const [closingPhysicalCash, setClosingPhysicalCash] = useState(500.0);

  // ---------------------------------------------------------------------------
  // LIVE MUTATIONS
  // ---------------------------------------------------------------------------
  const createOrderMutation = useMutation({
    mutationFn: async (settleImmediate?: { paymentMode: string }) => {
      if (!activeOutletId) throw new Error('No active outlet selected');
      const order = await posService.createOrder({
        outletId: activeOutletId,
        terminalId: activeTerminal?.id,
        tableId: selectedTableForOrder?.id,
        guestCount,
        serverName,
        items: activeCart.map((i) => ({
          itemName: i.name,
          quantity: i.qty,
          unitPrice: i.price,
          notes: i.notes,
        })),
      });

      if (settleImmediate) {
        await posService.settleOrder((order as any).id, {
          paymentMode: settleImmediate.paymentMode,
          amount: (order as any).totalAmount,
        });
      }

      return order;
    },
    onSuccess: (order: any) => {
      queryClient.invalidateQueries({ queryKey: ['posOutletDetail', activeOutletId] });
      queryClient.invalidateQueries({ queryKey: ['posKdsQueue', activeOutletId] });
      setActiveCart([]);
      setSelectedTableForOrder(null);
      setIsSettleOpen(false);
      showToast(`Order ${order?.orderNumber || 'created'} successfully fired to Kitchen Display System (KDS)!`);
    },
    onError: (err: any) => showToast(`Failed to ring up order: ${err?.message || 'Error'}`),
  });

  const updateTableStatusMutation = useMutation({
    mutationFn: ({ tableId, status }: { tableId: string; status: string }) =>
      posService.updateTableStatus(tableId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posOutletDetail', activeOutletId] });
      showToast('Table dining status updated.');
    },
  });

  const createTableMutation = useMutation({
    mutationFn: () => posService.createTable(activeOutletId, newTable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posOutletDetail', activeOutletId] });
      setIsAddTableOpen(false);
      showToast(`Table ${newTable.tableNumber} added to floor plan.`);
    },
  });

  const transferTableMutation = useMutation({
    mutationFn: () =>
      posService.transferTable(transferState.sourceTableId, transferState.targetTableId, transferState.reason),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['posOutletDetail', activeOutletId] });
      setIsTransferTableOpen(false);
      showToast(res?.message || 'Table transferred successfully.');
    },
    onError: (err: any) => showToast(`Transfer error: ${err?.message || 'Error'}`),
  });

  const mergeTablesMutation = useMutation({
    mutationFn: () => posService.mergeTables(mergePrimaryId, mergeSelectedIds),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ['posOutletDetail', activeOutletId] });
      setIsMergeTablesOpen(false);
      showToast(res?.message || 'Tables merged successfully.');
    },
    onError: (err: any) => showToast(`Merge error: ${err?.message || 'Error'}`),
  });

  const bumpKdsMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: 'queued' | 'cooking' | 'ready' | 'served' }) =>
      posService.updateKdsTicketStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posKdsQueue', activeOutletId] });
      queryClient.invalidateQueries({ queryKey: ['posOutletDetail', activeOutletId] });
      showToast('KDS Ticket bumped to next station state.');
    },
  });

  const handleVerifyRoom = async () => {
    if (!roomNumberInput.trim()) return;
    setIsVerifyingRoom(true);
    try {
      const res = await posService.verifyRoomForCharge('00000000-0000-0000-0000-000000000001', roomNumberInput.trim());
      setRoomVerification(res);
      if (res.isOccupied) {
        showToast(`Verified Room #${res.roomNumber}: Checked in as ${res.guestName}`);
      } else {
        showToast(`Room #${res.roomNumber} has no active checked-in guest.`);
      }
    } catch (err: any) {
      showToast(`Verification failed: ${err?.message || 'Room not found'}`);
    } finally {
      setIsVerifyingRoom(false);
    }
  };

  const chargeToRoomMutation = useMutation({
    mutationFn: async () => {
      if (!roomVerification?.isOccupied) throw new Error('Please verify room occupancy first');
      if (!posSignatureData) throw new Error('Guest digital signature is required (Chapter 9.4)');

      return await posService.chargeToRoom({
        orderId: 'direct',
        roomNumber: roomVerification.roomNumber,
        guestName: roomVerification.guestName || 'In-House Guest',
        amount: parseFloat(chargeAmountInput) || 50,
        signatureUrl: posSignatureData,
      });
    },
    onSuccess: () => {
      showToast(`Successfully charged ${formatCurrency(parseFloat(chargeAmountInput))} to Room #${roomVerification?.roomNumber} folio!`);
      setPosSignatureData('');
      setRoomVerification(null);
    },
    onError: (err: any) => showToast(`Charge error: ${err?.message || 'Failed to charge folio'}`),
  });

  const openShiftMutation = useMutation({
    mutationFn: () => {
      if (!activeTerminal?.id) throw new Error('No terminal available');
      return posService.openShift({
        terminalId: activeTerminal.id,
        cashierName: serverName,
        openingFloat: openShiftFloat,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posActiveShift', activeTerminal?.id] });
      setIsOpenShiftModalOpen(false);
      showToast(`Cashier shift opened with starting float: ${formatCurrency(openShiftFloat)}`);
    },
    onError: (err: any) => showToast(`Failed to open shift: ${err?.message || 'Error'}`),
  });

  const cashDropMutation = useMutation({
    mutationFn: () => {
      if (!activeShift?.id) throw new Error('No active shift');
      return posService.recordCashDrop(activeShift.id, cashDropInput.amount, cashDropInput.reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posActiveShift', activeTerminal?.id] });
      setIsCashDropOpen(false);
      showToast(`Safe cash drop recorded: ${formatCurrency(cashDropInput.amount)}`);
    },
  });

  const handleGenerateXReport = async () => {
    if (!activeShift?.id) return;
    try {
      const rep = await posService.getXReport(activeShift.id);
      setXReportData(rep);
      setIsXReportOpen(true);
    } catch (err: any) {
      showToast(`X-Report error: ${err?.message || 'Error'}`);
    }
  };

  const closeZReportMutation = useMutation({
    mutationFn: () => {
      if (!activeShift?.id) throw new Error('No active shift');
      return posService.closeShiftZReport(activeShift.id, closingPhysicalCash);
    },
    onSuccess: (rep) => {
      queryClient.invalidateQueries({ queryKey: ['posActiveShift', activeTerminal?.id] });
      setZReportData(rep);
      showToast(`Shift closed! Z-Report balancing: ${rep.balancingStatus.toUpperCase()}`);
    },
    onError: (err: any) => showToast(`Z-Report error: ${err?.message || 'Error'}`),
  });

  // Flat menu items from all categories
  const allMenuItems: PosMenuItem[] = [];
  const categoriesList: string[] = ['All'];
  (outletDetail?.menus || []).forEach((menu) => {
    (menu.categories || []).forEach((cat) => {
      if (!categoriesList.includes(cat.categoryName)) {
        categoriesList.push(cat.categoryName);
      }
      (cat.items || []).forEach((it) => {
        allMenuItems.push(it);
      });
    });
  });

  const filteredMenuItems = allMenuItems.filter((it) => {
    if (selectedCategory === 'All') return true;
    const cat = (outletDetail?.menus || [])
      .flatMap((m) => m.categories)
      .find((c) => c.id === it.categoryId);
    return cat?.categoryName === selectedCategory;
  });

  const tablesList = outletDetail?.tables || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-top-3">
          <Sparkles className="w-4 h-4 text-[#00a8ff]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-[#00a8ff] font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Chapter 9: Omni-Channel Point of Sale (POS) & F&B Operations</span>
      </div>

      {/* Header & Multi-Outlet Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#00a8ff] p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-7 h-7 text-[#00a8ff]" />
            <h1 className="text-2xl font-black tracking-tight">Omni-Channel POS & Dining Operations</h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Multi-outlet touch terminals, visual floor plans, real-time Kitchen Display System (KDS), room folio charges, and cashier shift X/Z balancing.
          </p>
        </div>

        {/* Outlet Switcher (9.1 Multi-Outlet) */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/15">
          <Store className="w-4 h-4 text-[#00a8ff]" />
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-bold text-slate-300">Active Revenue Outlet</span>
            <select
              value={activeOutletId}
              onChange={(e) => {
                setSelectedOutletId(e.target.value);
                setActiveCart([]);
                setSelectedTableForOrder(null);
              }}
              className="bg-transparent text-xs font-black text-white focus:outline-hidden cursor-pointer"
            >
              {outlets.map((o) => (
                <option key={o.id} value={o.id} className="text-slate-900">
                  {o.outletName} ({o.outletType.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 5-Tab Navigation Bar */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('terminal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'terminal'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Monitor className="w-4 h-4 text-[#00a8ff]" />
          <span>9.1 Touchscreen POS Terminal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tables')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'tables'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <LayoutGrid className="w-4 h-4 text-[#00a8ff]" />
          <span>9.2 Visual Floor Plan & Tables ({tablesList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kds')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'kds'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Flame className="w-4 h-4 text-[#00a8ff]" />
          <span>9.3 Kitchen Display System (KDS) ({kdsQueue.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('charge')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'charge'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BedDouble className="w-4 h-4 text-[#00a8ff]" />
          <span>9.4 Two-Way Room Folio Charge</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('shift')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'shift'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Receipt className="w-4 h-4 text-[#00a8ff]" />
          <span>9.5 Cashier Shift & X/Z Balancing</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: 9.1 TOUCHSCREEN POS TERMINAL
          ========================================================================= */}
      {activeTab === 'terminal' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Menu Catalog (Left 8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categoriesList.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu Items Grid */}
            {isLoadingOutletDetail ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200">
                <BeatLoader color="#22d3ee" size={16} speedMultiplier={1.2} />
                <span className="text-xs text-slate-400">Loading live outlet menu from database...</span>
              </div>
            ) : filteredMenuItems.length === 0 ? (
              <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                No items available in this category.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredMenuItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-[#00a8ff] hover:shadow-md transition cursor-pointer flex flex-col justify-between group active:scale-98"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-[#00a8ff] transition line-clamp-2">
                        {item.itemName}
                      </h4>
                      {item.allergens && item.allergens.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {item.allergens.map((al) => (
                            <span key={al} className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              {al}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">
                        {formatCurrency(item.price)}
                      </span>
                      <span className="w-6 h-6 rounded-md bg-sky-50 text-[#00a8ff] flex items-center justify-center group-hover:bg-[#00a8ff] group-hover:text-white transition">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Order Cart (Right 4 Cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#00a8ff]" />
                  <h3 className="font-bold text-sm text-slate-900">Current Check</h3>
                </div>
                {selectedTableForOrder ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sky-50 text-[#00a8ff] border border-sky-200">
                    {selectedTableForOrder.tableNumber}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Quick Order</span>
                )}
              </div>

              {/* Server & Table assignment */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Server</label>
                  <input
                    type="text"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-200 rounded-md font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Guests</label>
                  <input
                    type="number"
                    min="1"
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                    className="w-full text-xs p-1.5 border border-slate-200 rounded-md font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 pr-1">
                {activeCart.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    Cart is empty. Tap menu items on the left to ring up check.
                  </div>
                ) : (
                  activeCart.map((item) => (
                    <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex-1 pr-2">
                        <div className="font-bold text-slate-900 truncate">{item.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {formatCurrency(item.price)} each
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.id, -1)}
                          className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold hover:bg-slate-200 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-bold text-slate-900 w-4 text-center">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.id, 1)}
                          className="w-5 h-5 rounded bg-slate-100 text-slate-600 flex items-center justify-center font-bold hover:bg-slate-200 cursor-pointer"
                        >
                          +
                        </button>
                        <span className="font-black text-slate-900 w-16 text-right">
                          {formatCurrency(item.price * item.qty)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bill Summary & Actions */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-bold text-slate-800">{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Service Charge (10%):</span>
                <span className="font-bold text-slate-800">{formatCurrency(cartServiceCharge)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>State Dining Tax (5%):</span>
                <span className="font-bold text-slate-800">{formatCurrency(cartTax)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-2">
                <span>Total Due:</span>
                <span className="text-[#00a8ff]">{formatCurrency(cartGrandTotal)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  type="button"
                  onClick={() => createOrderMutation.mutate()}
                  disabled={activeCart.length === 0 || createOrderMutation.isPending}
                  className="bg-slate-900 hover:bg-black text-white font-bold text-xs"
                >
                  <Flame className="w-3.5 h-3.5 mr-1 text-[#00a8ff]" />
                  <span>Fire to KDS</span>
                </Button>

                <Button
                  type="button"
                  onClick={() => setIsSettleOpen(true)}
                  disabled={activeCart.length === 0 || createOrderMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold text-xs shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5 mr-1" />
                  <span>Settle Bill</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: 9.2 VISUAL DINING TABLE MANAGEMENT & FLOOR PLANS
          ========================================================================= */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-slate-600 font-medium">Vacant</span>
                <span className="w-3 h-3 rounded-full bg-sky-500 ml-2" />
                <span className="text-slate-600 font-medium">Seated</span>
                <span className="w-3 h-3 rounded-full bg-amber-500 ml-2" />
                <span className="text-slate-600 font-medium">Cooking</span>
                <span className="w-3 h-3 rounded-full bg-yellow-400 ml-2" />
                <span className="text-slate-600 font-medium">Served</span>
                <span className="w-3 h-3 rounded-full bg-purple-500 ml-2" />
                <span className="text-slate-600 font-medium">Check Printed</span>
                <span className="w-3 h-3 rounded-full bg-slate-400 ml-2" />
                <span className="text-slate-600 font-medium">Cleaning</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsTransferTableOpen(true)}
                className="text-xs font-bold"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 mr-1 text-[#00a8ff]" /> Transfer Table
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsMergeTablesOpen(true)}
                className="text-xs font-bold"
              >
                <Split className="w-3.5 h-3.5 mr-1 text-[#00a8ff]" /> Merge Tables
              </Button>
              <Button
                size="sm"
                onClick={() => setIsAddTableOpen(true)}
                className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> + Add Table
              </Button>
            </div>
          </div>

          {/* Interactive Table Canvas */}
          <div className="relative w-full h-[520px] bg-slate-100/80 border border-slate-200 rounded-2xl overflow-hidden p-6 shadow-inner">
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

            {tablesList.map((t) => {
              const statusColor =
                t.status === 'vacant'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                  : t.status === 'seated'
                  ? 'border-sky-500 bg-sky-50 text-sky-900'
                  : t.status === 'cooking'
                  ? 'border-amber-500 bg-amber-50 text-amber-900'
                  : t.status === 'dining'
                  ? 'border-yellow-400 bg-yellow-50 text-yellow-900'
                  : t.status === 'check_printed'
                  ? 'border-purple-500 bg-purple-50 text-purple-900'
                  : 'border-slate-400 bg-slate-100 text-slate-700';

              return (
                <div
                  key={t.id}
                  style={{ left: `${t.posX}%`, top: `${t.posY}%` }}
                  onClick={() => {
                    setSelectedTableForOrder(t);
                    setActiveTab('terminal');
                    showToast(`Selected ${t.tableNumber} for ordering.`);
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-3.5 rounded-2xl border-2 shadow-sm transition-transform hover:scale-108 cursor-pointer ${statusColor}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-xs">{t.tableNumber}</span>
                    <span className="text-[10px] font-bold opacity-75">{t.seatingCap}p</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider mt-1 opacity-90">
                    {t.status}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: 9.3 KITCHEN DISPLAY SYSTEM (KDS) & ORDER ROUTING
          ========================================================================= */}
      {activeTab === 'kds' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-sm text-slate-900">Real-Time Kitchen Display System (KDS)</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                {kdsQueue.length} Active Tickets
              </span>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => refetchKds()}
              className="text-xs font-semibold cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 mr-1 text-[#00a8ff]" /> Refresh Queue
            </Button>
          </div>

          {isLoadingKds ? (
            <div className="p-16 flex flex-col items-center justify-center gap-3 bg-white rounded-2xl border border-slate-200">
              <BeatLoader color="#22d3ee" size={16} speedMultiplier={1.2} />
              <span className="text-xs text-slate-400">Loading KDS live orders from PostgreSQL...</span>
            </div>
          ) : kdsQueue.length === 0 ? (
            <div className="p-16 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
              Kitchen queue is currently clear. No pending tickets.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {kdsQueue.map((ticket) => {
                const isDelayed = ticket.isDelayedAlert || ticket.waitTimeMinutes >= 15;
                return (
                  <div
                    key={ticket.id}
                    className={`bg-white border-2 rounded-2xl p-5 shadow-sm space-y-3 transition-all ${
                      isDelayed
                        ? 'border-rose-500 ring-2 ring-rose-400/50 animate-pulse'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Ticket Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-slate-900">
                            {ticket.ticketNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-sky-50 text-[#00a8ff] font-bold text-[10px]">
                            {ticket.order?.table?.tableNumber || 'Takeout / In-Room'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium block mt-0.5">
                          Station: {ticket.station?.stationName || 'Expo / Grill'}
                        </span>
                      </div>

                      {/* Elapsed Timer Badge (Section 9.3) */}
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 ${
                          isDelayed
                            ? 'bg-rose-500 text-white shadow-md'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{ticket.waitTimeMinutes}m wait</span>
                      </span>
                    </div>

                    {/* Delay Banner if >= 15 minutes */}
                    {isDelayed && (
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span>DELAY ALERT: Waiting &gt; 15 mins! Notify Sous Chef.</span>
                      </div>
                    )}

                    {/* Items List */}
                    <div className="divide-y divide-slate-100 py-1 text-xs">
                      {ticket.order?.items?.map((item) => (
                        <div key={item.id} className="py-1.5">
                          <div className="font-bold text-slate-900">
                            {item.quantity}x {item.itemName}
                          </div>
                          {item.notes && (
                            <div className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded inline-block mt-0.5">
                              {item.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Status Bump Action */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase text-slate-400">
                        Status: <span className="text-slate-900">{ticket.status}</span>
                      </span>

                      <Button
                        size="sm"
                        onClick={() => {
                          const nextStatus =
                            ticket.status === 'queued'
                              ? 'cooking'
                              : ticket.status === 'cooking'
                              ? 'ready'
                              : 'served';
                          bumpKdsMutation.mutate({ ticketId: ticket.id, status: nextStatus as any });
                        }}
                        className="bg-slate-900 hover:bg-black text-white font-bold text-[11px] cursor-pointer"
                      >
                        <span>Bump to {ticket.status === 'queued' ? 'Cooking' : ticket.status === 'cooking' ? 'Ready' : 'Served'}</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 4: 9.4 TWO-WAY ROOM CHARGE & FOLIO INTEGRATION
          ========================================================================= */}
      {activeTab === 'charge' && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="space-y-1 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-[#00a8ff]" />
              <h3 className="font-bold text-base text-slate-900">Guest Room Folio Charge Verification (9.4)</h3>
            </div>
            <p className="text-xs text-slate-500">
              Two-way PMS lookup: verify guest occupancy, credit authorization, and capture digital signature directly on screen.
            </p>
          </div>

          {/* Step 1: Verify Room */}
          <div className="space-y-3">
            <label className="font-bold text-xs text-slate-700 block">Enter Guest Room Number</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. 302, 402, 502"
                value={roomNumberInput}
                onChange={(e) => setRoomNumberInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900"
              />
              <Button
                type="button"
                onClick={handleVerifyRoom}
                disabled={isVerifyingRoom}
                className="bg-slate-900 hover:bg-black text-white font-bold text-xs"
              >
                {isVerifyingRoom ? 'Verifying...' : 'Verify Occupancy'}
              </Button>
            </div>
          </div>

          {/* Step 2: Verification Result */}
          {roomVerification && (
            <div className={`p-4 rounded-xl border text-xs space-y-2 ${
              roomVerification.isOccupied
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-rose-50 border-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">
                  Room #{roomVerification.roomNumber} Status:
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  roomVerification.isOccupied
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {roomVerification.isOccupied ? 'ACTIVE OCCUPANCY' : 'VACANT'}
                </span>
              </div>

              {roomVerification.isOccupied && (
                <>
                  <div className="flex justify-between text-slate-600">
                    <span>Primary Guest:</span>
                    <span className="font-bold text-slate-900">{roomVerification.guestName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>VIP Loyalty Tier:</span>
                    <span className="font-bold text-[#00a8ff]">{roomVerification.vipStatus}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Credit Limit Authorized:</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(roomVerification.creditLimit || 2500)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Current Folio Balance:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(roomVerification.currentBalanceDue || 0)}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 3: Amount & Digital Signature */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="font-bold text-xs text-slate-700 block mb-1">Charge Amount ($)</label>
              <input
                type="number"
                step="0.01"
                value={chargeAmountInput}
                onChange={(e) => setChargeAmountInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-black text-slate-900"
              />
            </div>

            {/* Digital Signature Canvas */}
            <div className="space-y-1.5">
              <label className="font-bold text-xs text-slate-700 block">Guest Digital Signature (Section 9.4)</label>
              <SignaturePad
                onSave={(dataUrl) => setPosSignatureData(dataUrl)}
                onClear={() => setPosSignatureData('')}
                height={120}
              />
            </div>

            <Button
              type="button"
              onClick={() => chargeToRoomMutation.mutate()}
              disabled={!roomVerification?.isOccupied || !posSignatureData || chargeToRoomMutation.isPending}
              className="w-full py-2.5 bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              {chargeToRoomMutation.isPending ? 'Posting Folio Charge...' : 'Authorize & Post Charge to Guest Room Folio'}
            </Button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: 9.5 CASHIER SHIFT MANAGEMENT & END-OF-DAY BALANCING
          ========================================================================= */}
      {activeTab === 'shift' && (
        <div className="space-y-5">
          {/* Active Shift Overview Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#00a8ff] uppercase tracking-wider block">
                  Active Terminal: {activeTerminal?.deviceSerial || 'POS-REST-02'}
                </span>
                <h3 className="font-black text-lg text-slate-900">
                  {activeShift ? `Shift Active: ${activeShift.cashierName}` : 'No Active Cashier Shift Open'}
                </h3>
                <span className="text-xs text-slate-500">
                  {activeShift ? `Opened: ${new Date(activeShift.startedAt).toLocaleTimeString()}` : 'Please open register before transactions.'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!activeShift ? (
                  <Button
                    size="sm"
                    onClick={() => setIsOpenShiftModalOpen(true)}
                    className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold text-xs shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Open Cashier Shift ($500 Float)
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsCashDropOpen(true)}
                      className="text-xs font-bold"
                    >
                      <DollarSign className="w-3.5 h-3.5 mr-1 text-[#00a8ff]" /> Mid-Day Safe Drop
                    </Button>

                    <Button
                      size="sm"
                      onClick={handleGenerateXReport}
                      className="bg-slate-900 hover:bg-black text-white font-bold text-xs"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1 text-[#00a8ff]" /> X-Report Snapshot
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => setIsZReportOpen(true)}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                    >
                      <Receipt className="w-3.5 h-3.5 mr-1" /> Close Register & Z-Report
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Shift Stats */}
            {activeShift && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Starting Drawer Float</span>
                  <span className="text-base font-black text-slate-900">{formatCurrency(activeShift.openingFloat)}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Cash Drops to Safe</span>
                  <span className="text-base font-black text-slate-900">
                    {formatCurrency((activeShift.cashDrops || []).reduce((acc, d) => acc + d.amount, 0))}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Drawer Status</span>
                  <span className="text-base font-black text-emerald-600">OPEN & BALANCED</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Cashier</span>
                  <span className="text-base font-black text-slate-900">{activeShift.cashierName.split(' ')[0]}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS
          ========================================================================= */}

      {/* Settle Bill Modal */}
      {isSettleOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Settle POS Dining Check</h3>
              <button onClick={() => setIsSettleOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                <span className="font-bold text-slate-700">Total Check Amount:</span>
                <span className="text-lg font-black text-[#00a8ff]">{formatCurrency(cartGrandTotal)}</span>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Select Tender Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => createOrderMutation.mutate({ paymentMode: 'cash' })}
                    className="p-3 rounded-xl border-2 border-slate-200 hover:border-[#00a8ff] text-center font-bold text-slate-800 transition cursor-pointer hover:bg-slate-50"
                  >
                    <DollarSign className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                    <span>Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => createOrderMutation.mutate({ paymentMode: 'card' })}
                    className="p-3 rounded-xl border-2 border-slate-200 hover:border-[#00a8ff] text-center font-bold text-slate-800 transition cursor-pointer hover:bg-slate-50"
                  >
                    <CreditCard className="w-5 h-5 mx-auto mb-1 text-[#00a8ff]" />
                    <span>Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSettleOpen(false);
                      setChargeAmountInput(cartGrandTotal.toFixed(2));
                      setActiveTab('charge');
                    }}
                    className="p-3 rounded-xl border-2 border-slate-200 hover:border-[#00a8ff] text-center font-bold text-slate-800 transition cursor-pointer hover:bg-slate-50"
                  >
                    <BedDouble className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                    <span>Room Charge</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Table Modal */}
      {isAddTableOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Add Dining Table</h3>
              <button onClick={() => setIsAddTableOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createTableMutation.mutate();
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Table Number</label>
                <input
                  type="text"
                  required
                  placeholder="Table T-07"
                  value={newTable.tableNumber}
                  onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Seating Capacity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newTable.seatingCap}
                  onChange={(e) => setNewTable({ ...newTable, seatingCap: parseInt(e.target.value) || 2 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddTableOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createTableMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold"
                >
                  Save Table
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transfer Table Modal */}
      {isTransferTableOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Transfer Table Party</h3>
              <button onClick={() => setIsTransferTableOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                transferTableMutation.mutate();
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Origin Table</label>
                <select
                  required
                  value={transferState.sourceTableId}
                  onChange={(e) => setTransferState({ ...transferState, sourceTableId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">-- From Table --</option>
                  {tablesList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tableNumber} ({t.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Destination Table (Must be vacant)</label>
                <select
                  required
                  value={transferState.targetTableId}
                  onChange={(e) => setTransferState({ ...transferState, targetTableId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">-- To Table --</option>
                  {tablesList.filter((t) => t.status === 'vacant').map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tableNumber} (Vacant)
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsTransferTableOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={transferTableMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold"
                >
                  Transfer Party
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Open Shift Modal */}
      {isOpenShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Open Cashier Shift</h3>
              <button onClick={() => setIsOpenShiftModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                openShiftMutation.mutate();
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Starting Cash Float ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={openShiftFloat}
                  onChange={(e) => setOpenShiftFloat(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-black text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsOpenShiftModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={openShiftMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold"
                >
                  Open Register
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe Cash Drop Modal */}
      {isCashDropOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Record Mid-Day Safe Cash Drop</h3>
              <button onClick={() => setIsCashDropOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                cashDropMutation.mutate();
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Cash Drop Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={cashDropInput.amount}
                  onChange={(e) => setCashDropInput({ ...cashDropInput, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-black text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Safe Drop Envelope #</label>
                <input
                  type="text"
                  required
                  value={cashDropInput.reason}
                  onChange={(e) => setCashDropInput({ ...cashDropInput, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCashDropOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={cashDropMutation.isPending}
                  className="bg-slate-900 hover:bg-black text-white font-bold"
                >
                  Record Drop
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* X-Report Modal */}
      {isXReportOpen && xReportData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#00a8ff]" />
                <h3 className="font-bold text-sm text-slate-900">Official Mid-Shift X-Report</h3>
              </div>
              <button onClick={() => setIsXReportOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-xs font-mono">
              <div className="text-center pb-2 border-b border-slate-200">
                <div className="font-black text-sm">OMNISTAY LUXURY PMS</div>
                <div className="text-[10px] text-slate-500">X-REPORT MID-SHIFT AUDIT SNAPSHOT</div>
                <div className="text-[10px] text-slate-400 mt-1">Cashier: {xReportData.cashierName}</div>
              </div>

              <div className="space-y-1 text-slate-700">
                <div className="flex justify-between">
                  <span>Starting Float:</span>
                  <span>{formatCurrency(xReportData.openingFloat)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Sales:</span>
                  <span>{formatCurrency(xReportData.salesBreakdown.cashTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credit Card Sales:</span>
                  <span>{formatCurrency(xReportData.salesBreakdown.cardTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Room Charges:</span>
                  <span>{formatCurrency(xReportData.salesBreakdown.roomChargeTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Safe Cash Drops:</span>
                  <span className="text-rose-600">-{formatCurrency(xReportData.cashDropsTotal)}</span>
                </div>
                <div className="flex justify-between font-black border-t border-slate-300 pt-1 text-slate-900">
                  <span>Expected Drawer Cash:</span>
                  <span>{formatCurrency(xReportData.expectedDrawerCash)}</span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setIsXReportOpen(false)}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold font-sans mt-3"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Z-Report Modal */}
      {isZReportOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-sm text-slate-900">End-of-Day Z-Report Shift Closure</h3>
              </div>
              <button onClick={() => { setIsZReportOpen(false); setZReportData(null); }} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-mono">
              {!zReportData ? (
                <>
                  <p className="font-sans text-slate-500">
                    Enter physical cash counted in drawer to balance and permanently close register shift.
                  </p>
                  <div>
                    <label className="font-bold font-sans text-slate-700 block mb-1">Physical Cash Counted ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={closingPhysicalCash}
                      onChange={(e) => setClosingPhysicalCash(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-black text-slate-900"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => closeZReportMutation.mutate()}
                    disabled={closeZReportMutation.isPending}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold font-sans"
                  >
                    {closeZReportMutation.isPending ? 'Closing Register...' : 'Close Shift & Print Official Z-Report'}
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="text-center pb-2 border-b border-slate-200">
                    <div className="font-black text-sm">OMNISTAY LUXURY PMS</div>
                    <div className="text-[10px] text-slate-500">PERMANENT Z-REPORT SHIFT CLOSURE</div>
                    <div className="text-[10px] text-slate-400 mt-1">Closed At: {new Date(zReportData.closedAt).toLocaleTimeString()}</div>
                  </div>

                  <div className="space-y-1 text-slate-700">
                    <div className="flex justify-between">
                      <span>Total Sales:</span>
                      <span>{formatCurrency(zReportData.salesBreakdown.totalSales)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected Drawer Cash:</span>
                      <span>{formatCurrency(zReportData.expectedDrawerCash)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Actual Drawer Cash:</span>
                      <span>{formatCurrency(zReportData.actualDrawerCash)}</span>
                    </div>
                    <div className="flex justify-between font-black border-t border-slate-300 pt-1 text-slate-900">
                      <span>Variance / Discrepancy:</span>
                      <span className={zReportData.discrepancy === 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {formatCurrency(zReportData.discrepancy)} ({zReportData.balancingStatus.toUpperCase()})
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={() => { setIsZReportOpen(false); setZReportData(null); }}
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold font-sans mt-3"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
