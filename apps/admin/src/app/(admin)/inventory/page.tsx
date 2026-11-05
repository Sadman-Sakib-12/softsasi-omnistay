'use client';

import React, { useState } from 'react';
import {
  Package,
  AlertCircle,
  Plus,
  CheckCircle2,
  X,
  Warehouse,
  ArrowRightLeft,
  FileCheck,
  TrendingUp,
  Barcode,
  Truck,
  Download,
  Filter,
  Search,
  Check,
  ShieldCheck,
  Trash2,
  Layers,
  Sparkles,
  ClipboardList,
  Flame,
  Calculator,
  RefreshCw,
  Clock,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BeatLoader } from 'react-spinners';
import {
  inventoryService,
  InventoryProduct,
  WarehouseItem,
  PurchaseOrderItem,
  ThreeWayMatchResult,
  InventoryValuationResult,
  ReorderAlert,
} from '@/features/inventory/services/inventory.service';
import { formatCurrency } from '@/lib/utils';

// CHAPTER 8: PROCUREMENT, SUPPLY CHAIN & WAREHOUSE INVENTORY (USALI & ERP ENGINE)
export default function InventoryEnterprisePage() {
  const queryClient = useQueryClient();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'catalog' | 'warehouses' | 'procurement' | 'movements' | 'valuation'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');

  // Toast / Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // -------------------------------------------------------------
  // REAL BACKEND QUERIES (Zero Mock Data)
  // -------------------------------------------------------------
  const { data: products = [], isLoading: isLoadingProducts, refetch: refetchProducts } = useQuery<InventoryProduct[]>({
    queryKey: ['inventoryProducts'],
    queryFn: () => inventoryService.getProducts(),
  });

  const { data: warehouses = [], isLoading: isLoadingWarehouses, refetch: refetchWarehouses } = useQuery<WarehouseItem[]>({
    queryKey: ['inventoryWarehouses'],
    queryFn: () => inventoryService.getWarehouses(),
  });

  const { data: purchaseOrders = [], isLoading: isLoadingPOs, refetch: refetchPOs } = useQuery<PurchaseOrderItem[]>({
    queryKey: ['inventoryPurchaseOrders'],
    queryFn: () => inventoryService.getPurchaseOrders(),
  });

  const { data: reorderData, isLoading: isLoadingAlerts } = useQuery<{ totalAlerts: number; alerts: ReorderAlert[] }>({
    queryKey: ['inventoryReorderAlerts'],
    queryFn: () => inventoryService.getReorderAlerts(),
  });

  // Selected Warehouse & Method for 8.5 Valuation
  const [selectedValuationWh, setSelectedValuationWh] = useState<string>('');
  const [valuationMethod, setValuationMethod] = useState<'FIFO' | 'WAC'>('FIFO');

  const activeValWhId = selectedValuationWh || (warehouses[0]?.id ?? '');

  const { data: valuationData, isLoading: isLoadingValuation, refetch: refetchValuation } = useQuery<InventoryValuationResult>({
    queryKey: ['inventoryValuation', activeValWhId, valuationMethod],
    queryFn: () => inventoryService.calculateValuation(activeValWhId, valuationMethod),
    enabled: Boolean(activeValWhId),
  });

  // -------------------------------------------------------------
  // MODAL STATES
  // -------------------------------------------------------------
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddWarehouseOpen, setIsAddWarehouseOpen] = useState(false);
  const [isAddBinOpen, setIsAddBinOpen] = useState(false);
  const [selectedWarehouseForBin, setSelectedWarehouseForBin] = useState<string>('');
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isNewPoOpen, setIsNewPoOpen] = useState(false);
  const [isReceiveGrnOpen, setIsReceiveGrnOpen] = useState(false);
  const [selectedPoForGrn, setSelectedPoForGrn] = useState<PurchaseOrderItem | null>(null);
  const [isThreeWayMatchOpen, setIsThreeWayMatchOpen] = useState(false);
  const [threeWayResult, setThreeWayResult] = useState<ThreeWayMatchResult | null>(null);
  const [isWastageOpen, setIsWastageOpen] = useState(false);
  const [isStocktakeOpen, setIsStocktakeOpen] = useState(false);

  // -------------------------------------------------------------
  // FORM STATES
  // -------------------------------------------------------------
  // 8.1 Product Form
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    barcode: '',
    costPrice: 15.0,
    retailPrice: 28.0,
    isRecipe: false,
  });

  // 8.2 Warehouse Form
  const [newWarehouse, setNewWarehouse] = useState({
    name: '',
    code: '',
    address: '',
  });

  // 8.2 Bin Form
  const [newBin, setNewBin] = useState({
    binCode: '',
    zone: '',
  });

  // 8.3 PO Form
  const [newPoInput, setNewPoInput] = useState({
    productId: '',
    quantity: 100,
    unitCost: 14.5,
  });

  // 8.3 GRN Form
  const [grnInput, setGrnInput] = useState({
    targetWarehouseId: '',
    qtyReceived: 0,
    isDamaged: false,
  });

  // 8.3 Three-Way Match Form
  const [threeWayInput, setThreeWayInput] = useState({
    purchaseId: '',
    grnId: '',
    billedAmount: 2900.0,
    vendorInvoiceNumber: 'INV-2026-9901',
  });

  // 8.4 Transfer Form
  const [transferInput, setTransferInput] = useState({
    fromWarehouseId: '',
    toWarehouseId: '',
    productId: '',
    quantity: 20,
    reason: 'Internal floor restock',
  });

  // 8.4 Spoilage / Wastage Form
  const [wastageInput, setWastageInput] = useState({
    warehouseId: '',
    productId: '',
    quantity: 5,
    reason: 'Expired dairy / broken bottle during cellar transit',
    costLost: 75.0,
  });

  // 8.4 Stocktake Count Form
  const [stocktakeInput, setStocktakeInput] = useState({
    warehouseId: '',
    productId: '',
    physicalCount: 100,
    reason: 'Monthly cycle physical inventory audit',
  });

  // -------------------------------------------------------------
  // MUTATIONS (Live Backend)
  // -------------------------------------------------------------
  const createProductMutation = useMutation({
    mutationFn: (dto: typeof newProduct) => inventoryService.createProduct(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryProducts'] });
      setIsAddProductOpen(false);
      setNewProduct({ name: '', sku: '', barcode: '', costPrice: 15.0, retailPrice: 28.0, isRecipe: false });
      showToast('Product SKU successfully created and registered with barcode.');
    },
    onError: (err: any) => showToast(`Failed to create product: ${err?.message || 'Error'}`),
  });

  const createWarehouseMutation = useMutation({
    mutationFn: (dto: typeof newWarehouse) => inventoryService.createWarehouse(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryWarehouses'] });
      setIsAddWarehouseOpen(false);
      setNewWarehouse({ name: '', code: '', address: '' });
      showToast('Warehouse storage location added to property network.');
    },
    onError: (err: any) => showToast(`Failed to create warehouse: ${err?.message || 'Error'}`),
  });

  const createBinMutation = useMutation({
    mutationFn: ({ warehouseId, dto }: { warehouseId: string; dto: typeof newBin }) =>
      inventoryService.createBin(warehouseId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventoryWarehouses'] });
      setIsAddBinOpen(false);
      setNewBin({ binCode: '', zone: '' });
      showToast('Storage bin / zone added to warehouse.');
    },
    onError: (err: any) => showToast(`Failed to add bin: ${err?.message || 'Error'}`),
  });

  const transferMutation = useMutation({
    mutationFn: (dto: typeof transferInput) => inventoryService.initiateStockTransfer(dto),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['inventoryProducts'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryWarehouses'] });
      setIsTransferOpen(false);
      showToast(res?.message || 'Stock transfer completed with dual-entry ledger deduction & addition.');
    },
    onError: (err: any) => showToast(`Transfer error: ${err?.message || 'Insufficient stock'}`),
  });

  const createPoMutation = useMutation({
    mutationFn: () => {
      return inventoryService.createPurchaseOrder({
        items: [
          {
            productId: newPoInput.productId || (products[0]?.id ?? ''),
            quantity: Number(newPoInput.quantity),
            unitCost: Number(newPoInput.unitCost),
          },
        ],
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['inventoryPurchaseOrders'] });
      setIsNewPoOpen(false);
      showToast(`Purchase Order ${res?.poNumber || ''} created and approved for vendor transmission.`);
    },
    onError: (err: any) => showToast(`Failed to create PO: ${err?.message || 'Error'}`),
  });

  const receiveGrnMutation = useMutation({
    mutationFn: () => {
      if (!selectedPoForGrn) throw new Error('No PO selected');
      const poProd = selectedPoForGrn.products?.[0];
      return inventoryService.receiveGoods(
        {
          purchaseId: selectedPoForGrn.id,
          items: [
            {
              itemTitle: poProd?.product?.name || 'Delivered Goods',
              qtyOrdered: Number(poProd?.quantity || 100),
              qtyReceived: Number(grnInput.qtyReceived),
              isDamaged: grnInput.isDamaged,
            },
          ],
        },
        grnInput.targetWarehouseId || warehouses[0]?.id
      );
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['inventoryPurchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryProducts'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryWarehouses'] });
      setIsReceiveGrnOpen(false);
      setSelectedPoForGrn(null);
      showToast(`Goods Receipt Note ${res?.grnNumber || ''} logged and stock deposited into warehouse.`);
    },
    onError: (err: any) => showToast(`Failed to receive goods: ${err?.message || 'Error'}`),
  });

  const threeWayMatchMutation = useMutation({
    mutationFn: () => inventoryService.executeThreeWayMatch(threeWayInput),
    onSuccess: (res) => {
      setThreeWayResult(res);
      showToast(`3-Way Match executed: ${res.matchStatus} (Variance: $${res.variance.toFixed(2)})`);
    },
    onError: (err: any) => showToast(`3-Way Match error: ${err?.message || 'Error'}`),
  });

  const wastageMutation = useMutation({
    mutationFn: () =>
      inventoryService.recordWastage(
        wastageInput.warehouseId || warehouses[0]?.id,
        {
          productId: wastageInput.productId || products[0]?.id,
          quantity: Number(wastageInput.quantity),
          reason: wastageInput.reason,
          costLost: Number(wastageInput.costLost),
        }
      ),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['inventoryProducts'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryWarehouses'] });
      setIsWastageOpen(false);
      showToast(`Wastage written off: $${res?.costLost || 0} debited to OPEX Account 6200.`);
    },
    onError: (err: any) => showToast(`Wastage log error: ${err?.message || 'Error'}`),
  });

  const stocktakeMutation = useMutation({
    mutationFn: () =>
      inventoryService.reconcileStocktake({
        warehouseId: stocktakeInput.warehouseId || warehouses[0]?.id,
        productId: stocktakeInput.productId || products[0]?.id,
        physicalCount: Number(stocktakeInput.physicalCount),
        reason: stocktakeInput.reason,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['inventoryProducts'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryWarehouses'] });
      setIsStocktakeOpen(false);
      showToast(`Physical count reconciled: Book stock updated (Variance: ${res?.variance ?? 0}).`);
    },
    onError: (err: any) => showToast(`Stocktake reconciliation error: ${err?.message || 'Error'}`),
  });

  // Filtered Products
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchTerm))
  );

  const totalAssetValue = products.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0);
  const lowStockCount = products.filter((p) => p.status === 'LOW_STOCK' || p.status === 'OUT_OF_STOCK').length;
  const activeAlerts = reorderData?.alerts || [];

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
        <span className="text-slate-400">Chapter 8: Procurement, Supply Chain & Inventory</span>
      </div>

      {/* Header & Global Stats Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-[#00a8ff] p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="w-7 h-7 text-[#00a8ff]" />
            <h1 className="text-2xl font-black tracking-tight">Hospitality Procurement & Supply Chain Engine</h1>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Multi-warehouse logistics, recipe BOM ingredient depletion, PO &rarr; GRN 3-Way Match validation, and USALI FIFO/WAC asset valuation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Total Inventory Assets</span>
            <span className="text-lg font-black text-white">{formatCurrency(totalAssetValue)}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Storage Depots</span>
            <span className="text-lg font-black text-[#00a8ff]">{warehouses.length} Active</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
            <span className="text-[10px] uppercase font-bold text-slate-300 block">Low Stock Alerts</span>
            <span className="text-lg font-black text-amber-300">{lowStockCount} SKUs</span>
          </div>
        </div>
      </div>

      {/* 5-Tab Navigation Bar */}
      <div className="flex items-center gap-1 bg-white p-1.5 rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4 text-[#00a8ff]" />
          <span>8.1 Master Catalog & Taxonomy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('warehouses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'warehouses'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Warehouse className="w-4 h-4 text-[#00a8ff]" />
          <span>8.2 Multi-Warehouse Storage</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('procurement')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'procurement'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileCheck className="w-4 h-4 text-[#00a8ff]" />
          <span>8.3 Procurement & 3-Way Match</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('movements')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'movements'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4 text-[#00a8ff]" />
          <span>8.4 Movements & Audits</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('valuation')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'valuation'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calculator className="w-4 h-4 text-[#00a8ff]" />
          <span>8.5 Stock Valuation & Reorders</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: 8.1 MASTER ITEM CATALOG & TAXONOMY
          ========================================================================= */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search SKU, item name or barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#00a8ff]"
              />
            </div>

            <Button
              size="sm"
              onClick={() => setIsAddProductOpen(true)}
              className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> + Add Product SKU
            </Button>
          </div>

          {/* Catalog Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            {isLoadingProducts ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <BeatLoader color="#22d3ee" size={16} speedMultiplier={1.2} />
                <span className="text-xs text-slate-400">Loading master catalog from PostgreSQL...</span>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No items found. Click "+ Add Product SKU" to register an item.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Item & SKU</th>
                    <th className="py-3 px-4">Taxonomy Category</th>
                    <th className="py-3 px-4">EAN-13 / Code-128 Barcode</th>
                    <th className="py-3 px-4 text-right">Cost Price</th>
                    <th className="py-3 px-4 text-right">Retail / Menu</th>
                    <th className="py-3 px-4 text-right">Total In-Stock</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{p.name}</div>
                        <div className="font-mono text-[11px] text-[#00a8ff] font-bold">{p.sku}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {p.categoryName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800">
                          <Barcode className="w-3.5 h-3.5 text-slate-500" />
                          <span>{p.barcode || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        {formatCurrency(p.costPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        {formatCurrency(p.retailPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {p.currentStock.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'IN_STOCK'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : p.status === 'LOW_STOCK'
                              ? 'bg-amber-50 text-amber-600 border border-amber-200'
                              : 'bg-rose-50 text-rose-600 border border-rose-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: 8.2 MULTI-WAREHOUSE & PROPERTY STORAGE LOCATIONS
          ========================================================================= */}
      {activeTab === 'warehouses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Floor-by-floor logistics, cold rooms, Sommelier wine vaults, and floor linen par depots across the property.
            </p>
            <Button
              size="sm"
              onClick={() => setIsAddWarehouseOpen(true)}
              className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold text-xs cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" /> + Add Storage Location
            </Button>
          </div>

          {isLoadingWarehouses ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3">
              <BeatLoader color="#22d3ee" size={16} speedMultiplier={1.2} />
              <span className="text-xs text-slate-400">Loading property warehouses from PostgreSQL...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {warehouses.map((wh) => (
                <div
                  key={wh.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-[#00a8ff] transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-[#00a8ff] font-black uppercase tracking-wider block">
                        {wh.code}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-0.5">{wh.name}</h3>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    {wh.address || 'Resort Storage Zone'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Total Stock Units</span>
                      <span className="font-black text-slate-900 text-sm">
                        {wh.totalStockCount?.toLocaleString() ?? 0}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Storage Bins</span>
                      <span className="font-bold text-slate-700">{wh.bins?.length ?? 0} configured</span>
                    </div>
                  </div>

                  {wh.bins && wh.bins.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {wh.bins.map((b) => (
                        <span
                          key={b.id}
                          className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600"
                        >
                          {b.binCode} ({b.zone || 'Zone'})
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWarehouseForBin(wh.id);
                        setIsAddBinOpen(true);
                      }}
                      className="w-full py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[11px] font-bold text-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#00a8ff]" />
                      <span>Add Bin / Zone</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: 8.3 PROCUREMENT LIFECYCLE & 3-WAY MATCH
          ========================================================================= */}
      {activeTab === 'procurement' && (
        <div className="space-y-5">
          {/* 5-Stage Closed Loop Diagram */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
              Closed-Loop Procurement Workflow (Section 8.3)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-100">
                <span className="w-5 h-5 rounded-full bg-[#00a8ff] text-white font-bold text-[10px] inline-flex items-center justify-center mb-1">1</span>
                <div className="font-bold text-slate-900">Purchase Requisition</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Chef / HOD request</div>
              </div>
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-100">
                <span className="w-5 h-5 rounded-full bg-[#00a8ff] text-white font-bold text-[10px] inline-flex items-center justify-center mb-1">2</span>
                <div className="font-bold text-slate-900">PO Approval</div>
                <div className="text-[10px] text-slate-500 mt-0.5">GM signature check</div>
              </div>
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-100">
                <span className="w-5 h-5 rounded-full bg-[#00a8ff] text-white font-bold text-[10px] inline-flex items-center justify-center mb-1">3</span>
                <div className="font-bold text-slate-900">Goods Receiving (GRN)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Physical intake count</div>
              </div>
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-100">
                <span className="w-5 h-5 rounded-full bg-[#00a8ff] text-white font-bold text-[10px] inline-flex items-center justify-center mb-1">4</span>
                <div className="font-bold text-slate-900">Vendor Bill 3-Way Match</div>
                <div className="text-[10px] text-slate-500 mt-0.5">PO vs GRN vs Bill</div>
              </div>
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-100">
                <span className="w-5 h-5 rounded-full bg-[#00a8ff] text-white font-bold text-[10px] inline-flex items-center justify-center mb-1">5</span>
                <div className="font-bold text-slate-900">Payment Settlement</div>
                <div className="text-[10px] text-slate-500 mt-0.5">AP ledger close</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-bold text-sm text-slate-900">Live Purchase Orders & Delivery Intake</h3>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setIsThreeWayMatchOpen(true)}
                className="bg-slate-900 hover:bg-black text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                <FileCheck className="w-3.5 h-3.5 mr-1.5 text-[#00a8ff]" /> Execute 3-Way Match
              </Button>
              <Button
                size="sm"
                onClick={() => setIsNewPoOpen(true)}
                className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" /> + Generate Vendor PO
              </Button>
            </div>
          </div>

          {/* PO Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            {isLoadingPOs ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <BeatLoader color="#22d3ee" size={16} speedMultiplier={1.2} />
                <span className="text-xs text-slate-400">Loading purchase orders from PostgreSQL...</span>
              </div>
            ) : purchaseOrders.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No purchase orders logged. Click "+ Generate Vendor PO" to initiate procurement.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Vendor Partner</th>
                    <th className="py-3 px-4">Ordered Items</th>
                    <th className="py-3 px-4 text-right">Total Order Value</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Receiving Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#00a8ff]">
                        {po.poNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {po.vendorName || 'Atlantic Linens Ltd'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {po.products?.map((p) => `${p.quantity}x ${p.product?.name || 'Item'}`).join(', ') || 'General hospitality supplies'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {formatCurrency(po.totalCost)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            po.status === 'received'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : po.status === 'approved'
                              ? 'bg-sky-50 text-[#00a8ff] border border-sky-200'
                              : 'bg-amber-50 text-amber-600 border border-amber-200'
                          }`}
                        >
                          {po.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {po.status !== 'received' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPoForGrn(po);
                              setGrnInput({
                                targetWarehouseId: warehouses[0]?.id || '',
                                qtyReceived: Number(po.products?.[0]?.quantity || 100),
                                isDamaged: false,
                              });
                              setIsReceiveGrnOpen(true);
                            }}
                            className="px-3 py-1 rounded-md bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold text-[11px] transition cursor-pointer shadow-xs"
                          >
                            Receive GRN
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-600 inline-flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>GRN Verified</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: 8.4 INVENTORY MOVEMENTS & AUDITS
          ========================================================================= */}
      {activeTab === 'movements' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action 1: Stock Transfer */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ArrowRightLeft className="w-4 h-4 text-[#00a8ff]" />
                <h3>Internal Stock Transfer</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Move items between depots (e.g. 50 bottles of wine from Sommelier Cellar to Rooftop Bar) with automatic dual-entry balance updates.
              </p>
              <Button
                size="sm"
                onClick={() => setIsTransferOpen(true)}
                className="w-full bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Execute Inter-Warehouse Transfer
              </Button>
            </div>

            {/* Action 2: Spoilage / Wastage Write-off */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Flame className="w-4 h-4 text-rose-500" />
                <h3>Wastage & Spoilage Write-Off</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Log expired kitchen ingredients, broken liquor bottles, or damaged guest linens and post directly to OPEX Spoilage Account 6200.
              </p>
              <Button
                size="sm"
                onClick={() => setIsWastageOpen(true)}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Log Spoilage / Write-Off
              </Button>
            </div>

            {/* Action 3: Physical Count Reconciliation */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ClipboardList className="w-4 h-4 text-emerald-600" />
                <h3>Physical Cycle Count Stocktake</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Barcode scan physical stock on shelves, compare against theoretical book stock, and post automated reconciliation adjustments.
              </p>
              <Button
                size="sm"
                onClick={() => setIsStocktakeOpen(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Reconcile Physical Count
              </Button>
            </div>
          </div>

          {/* Recent movements overview */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Active Storage Balances by Property Depot</h3>
            <div className="divide-y divide-slate-100">
              {warehouses.map((wh) => (
                <div key={wh.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{wh.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono ml-2">({wh.code})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500">{wh.bins?.length || 0} storage bins</span>
                    <span className="font-black text-slate-900">{wh.totalStockCount || 0} units</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: 8.5 STOCK VALUATION & REORDER INTELLIGENCE
          ========================================================================= */}
      {activeTab === 'valuation' && (
        <div className="space-y-5">
          {/* Controls: Warehouse & Method Selector */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Select Warehouse
                </label>
                <select
                  value={activeValWhId}
                  onChange={(e) => setSelectedValuationWh(e.target.value)}
                  className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-800 font-medium focus:outline-hidden focus:border-[#00a8ff]"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Valuation Accounting Method
                </label>
                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setValuationMethod('FIFO')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                      valuationMethod === 'FIFO'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    FIFO (First-In First-Out)
                  </button>
                  <button
                    type="button"
                    onClick={() => setValuationMethod('WAC')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                      valuationMethod === 'WAC'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    WAC (Weighted Average)
                  </button>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Warehouse Total Asset Value ({valuationMethod})
              </span>
              <span className="text-2xl font-black text-[#00a8ff]">
                {formatCurrency(valuationData?.totalInventoryAssetValue || 0)}
              </span>
            </div>
          </div>

          {/* Valuation breakdown table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Itemized Valuation Breakdown ({valuationData?.totalItemCount || 0} Products)
              </h3>
              <span className="text-xs text-slate-500 font-medium">Conforms to USALI Standards</span>
            </div>

            {isLoadingValuation ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <BeatLoader color="#22d3ee" size={16} speedMultiplier={1.2} />
                <span className="text-xs text-slate-400">Computing asset valuation in PostgreSQL...</span>
              </div>
            ) : !valuationData?.inventoryItems || valuationData.inventoryItems.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400">
                No items found in selected warehouse.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Product SKU & Name</th>
                    <th className="py-3 px-4 text-right">Physical Stock Units</th>
                    <th className="py-3 px-4 text-right">Unit Cost Basis</th>
                    <th className="py-3 px-4 text-right">Total Inventory Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {valuationData.inventoryItems.map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{item.name}</div>
                        <div className="font-mono text-[11px] text-[#00a8ff]">{item.sku}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                        {item.stockQty.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                        {formatCurrency(item.unitCost)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        {formatCurrency(item.totalValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Automated Reorder Alerts Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">Automated Reorder Threshold Alerts</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {activeAlerts.length} Actionable Triggers
              </span>
            </div>

            {isLoadingAlerts ? (
              <div className="py-6 flex justify-center">
                <BeatLoader color="#22d3ee" size={14} speedMultiplier={1.2} />
              </div>
            ) : activeAlerts.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                All property stocks are currently above safety reorder thresholds.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {activeAlerts.map((al) => (
                  <div key={al.alertId} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{al.productName}</div>
                      <div className="text-[11px] text-slate-500">
                        {al.warehouseName} · Current: <span className="font-bold text-rose-600">{al.currentStock}</span> (Safety Min: {al.reorderThreshold})
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          al.urgency === 'CRITICAL_STOCKOUT'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}
                      >
                        {al.urgency}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const matchedProd = products.find((p) => p.sku === al.sku);
                          if (matchedProd) {
                            setNewPoInput({
                              productId: matchedProd.id,
                              quantity: al.reorderThreshold * 2,
                              unitCost: matchedProd.costPrice,
                            });
                            setIsNewPoOpen(true);
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold text-[11px] transition cursor-pointer"
                      >
                        Auto-Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS WITH REAL LIVE BACKEND ACTIONS
          ========================================================================= */}

      {/* 1. Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Add New Master Product SKU</h3>
              <button onClick={() => setIsAddProductOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createProductMutation.mutate(newProduct);
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5-Star Egyptian Cotton Bath Mat"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    placeholder="LIN-MAT-009"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Barcode (EAN-13)</label>
                  <input
                    type="text"
                    placeholder="Auto if blank"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cost Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.costPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Retail Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newProduct.retailPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, retailPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddProductOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createProductMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold"
                >
                  {createProductMutation.isPending ? 'Registering...' : 'Register SKU'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Warehouse Modal */}
      {isAddWarehouseOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Add Property Storage Depot</h3>
              <button onClick={() => setIsAddWarehouseOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createWarehouseMutation.mutate(newWarehouse);
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Warehouse Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rooftop Sky Bar Beverage Store"
                  value={newWarehouse.name}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Warehouse Code</label>
                <input
                  type="text"
                  required
                  placeholder="WH-RSB-06"
                  value={newWarehouse.code}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Physical Location & Zone</label>
                <input
                  type="text"
                  placeholder="Level 25 Roof Terrace, Room 2501"
                  value={newWarehouse.address}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddWarehouseOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createWarehouseMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold"
                >
                  {createWarehouseMutation.isPending ? 'Adding...' : 'Create Depot'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Bin Modal */}
      {isAddBinOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Add Storage Bin / Shelf Zone</h3>
              <button onClick={() => setIsAddBinOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createBinMutation.mutate({ warehouseId: selectedWarehouseForBin, dto: newBin });
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Bin / Rack Code</label>
                <input
                  type="text"
                  required
                  placeholder="BIN-A1-SHELF3"
                  value={newBin.binCode}
                  onChange={(e) => setNewBin({ ...newBin, binCode: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Zone Description</label>
                <input
                  type="text"
                  placeholder="Top Shelf - Dry Amenities"
                  value={newBin.zone}
                  onChange={(e) => setNewBin({ ...newBin, zone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddBinOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createBinMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold"
                >
                  {createBinMutation.isPending ? 'Saving...' : 'Add Bin'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Stock Transfer Modal */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Execute Internal Stock Transfer</h3>
              <button onClick={() => setIsTransferOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                transferMutation.mutate(transferInput);
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product SKU to Move</label>
                <select
                  required
                  value={transferInput.productId}
                  onChange={(e) => setTransferInput({ ...transferInput, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) · Available: {p.currentStock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Source Origin Depot</label>
                  <select
                    required
                    value={transferInput.fromWarehouseId}
                    onChange={(e) => setTransferInput({ ...transferInput, fromWarehouseId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">-- From Depot --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Destination Depot</label>
                  <select
                    required
                    value={transferInput.toWarehouseId}
                    onChange={(e) => setTransferInput({ ...transferInput, toWarehouseId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">-- To Depot --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Transfer Quantity (Units)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={transferInput.quantity}
                  onChange={(e) => setTransferInput({ ...transferInput, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsTransferOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={transferMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold"
                >
                  {transferMutation.isPending ? 'Transferring...' : 'Execute Transfer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Create PO Modal */}
      {isNewPoOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Generate Vendor Purchase Order (PO)</h3>
              <button onClick={() => setIsNewPoOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createPoMutation.mutate();
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Catalog Item</label>
                <select
                  required
                  value={newPoInput.productId}
                  onChange={(e) => {
                    const prod = products.find((p) => p.id === e.target.value);
                    setNewPoInput({
                      ...newPoInput,
                      productId: e.target.value,
                      unitCost: prod?.costPrice || 14.5,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">-- Choose Item --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) · Unit Cost: ${p.costPrice}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantity to Order</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPoInput.quantity}
                    onChange={(e) => setNewPoInput({ ...newPoInput, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Agreed Unit Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newPoInput.unitCost}
                    onChange={(e) => setNewPoInput({ ...newPoInput, unitCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-between">
                <span className="text-slate-600 font-semibold">Total PO Commitment Value:</span>
                <span className="text-base font-black text-[#00a8ff]">
                  {formatCurrency((newPoInput.quantity || 0) * (newPoInput.unitCost || 0))}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsNewPoOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createPoMutation.isPending}
                  className="bg-[#00a8ff] hover:bg-[#0097e6] text-white font-bold"
                >
                  {createPoMutation.isPending ? 'Generating...' : 'Approve & Transmit PO'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Receive GRN Modal */}
      {isReceiveGrnOpen && selectedPoForGrn && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Goods Receipt Note (GRN) Intake</h3>
                <span className="text-[11px] font-mono text-[#00a8ff]">PO: {selectedPoForGrn.poNumber}</span>
              </div>
              <button onClick={() => setIsReceiveGrnOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                receiveGrnMutation.mutate();
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Target Storage Depot</label>
                <select
                  required
                  value={grnInput.targetWarehouseId}
                  onChange={(e) => setGrnInput({ ...grnInput, targetWarehouseId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Actual Physical Accepted Units</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={grnInput.qtyReceived}
                  onChange={(e) => setGrnInput({ ...grnInput, qtyReceived: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="damagedCheck"
                  checked={grnInput.isDamaged}
                  onChange={(e) => setGrnInput({ ...grnInput, isDamaged: e.target.checked })}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="damagedCheck" className="text-slate-700 font-medium">
                  Flag delivery as damaged / short shipment
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsReceiveGrnOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={receiveGrnMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {receiveGrnMutation.isPending ? 'Processing...' : 'Confirm Delivery & Update Stock'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. 3-Way Match Modal */}
      {isThreeWayMatchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#00a8ff]" />
                <h3 className="font-bold text-sm text-slate-900">3-Way Match Audit Validation</h3>
              </div>
              <button onClick={() => setIsThreeWayMatchOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Select Purchase Order</label>
                  <select
                    value={threeWayInput.purchaseId}
                    onChange={(e) => {
                      const po = purchaseOrders.find((p) => p.id === e.target.value);
                      const grn = po?.grns?.[0];
                      setThreeWayInput({
                        ...threeWayInput,
                        purchaseId: e.target.value,
                        grnId: grn?.id || '',
                        billedAmount: po?.totalCost || 2900,
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">-- Choose PO --</option>
                    {purchaseOrders.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.poNumber} (${p.totalCost.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vendor Invoice #</label>
                  <input
                    type="text"
                    value={threeWayInput.vendorInvoiceNumber}
                    onChange={(e) => setThreeWayInput({ ...threeWayInput, vendorInvoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Vendor Invoice Billed Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={threeWayInput.billedAmount}
                  onChange={(e) => setThreeWayInput({ ...threeWayInput, billedAmount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold"
                />
              </div>

              <Button
                type="button"
                onClick={() => threeWayMatchMutation.mutate()}
                disabled={!threeWayInput.purchaseId || threeWayMatchMutation.isPending}
                className="w-full bg-slate-900 hover:bg-black text-white font-bold text-xs"
              >
                {threeWayMatchMutation.isPending ? 'Evaluating 3-Way Match...' : 'Validate PO vs GRN vs Bill'}
              </Button>

              {threeWayResult && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Match Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        threeWayResult.matchStatus === 'EXACT_MATCH'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-rose-50 text-rose-600 border border-rose-200'
                      }`}
                    >
                      {threeWayResult.matchStatus}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>PO Committed Amount:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(threeWayResult.poAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GRN Delivered Value:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(threeWayResult.grnReceivedValue)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Vendor Invoice Billed:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(threeWayResult.billedAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-1">
                    <span>Financial Variance:</span>
                    <span className="font-bold text-rose-600">{formatCurrency(threeWayResult.variance)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic mt-2">
                    Recommendation: {threeWayResult.recommendation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 8. Spoilage / Wastage Modal */}
      {isWastageOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Log Spoilage / Wastage Write-Off</h3>
              <button onClick={() => setIsWastageOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                wastageMutation.mutate();
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Storage Warehouse</label>
                <select
                  required
                  value={wastageInput.warehouseId}
                  onChange={(e) => setWastageInput({ ...wastageInput, warehouseId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">-- Choose Warehouse --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Product SKU Spoiled</label>
                <select
                  required
                  value={wastageInput.productId}
                  onChange={(e) => {
                    const prod = products.find((p) => p.id === e.target.value);
                    setWastageInput({
                      ...wastageInput,
                      productId: e.target.value,
                      costLost: (prod?.costPrice || 15) * (wastageInput.quantity || 1),
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">-- Choose Item --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quantity Spoiled</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={wastageInput.quantity}
                    onChange={(e) => {
                      const qty = parseFloat(e.target.value) || 0;
                      const prod = products.find((p) => p.id === wastageInput.productId);
                      setWastageInput({
                        ...wastageInput,
                        quantity: qty,
                        costLost: (prod?.costPrice || 15) * qty,
                      });
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cost Loss ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={wastageInput.costLost}
                    onChange={(e) => setWastageInput({ ...wastageInput, costLost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-rose-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Inspection Notes</label>
                <input
                  type="text"
                  required
                  value={wastageInput.reason}
                  onChange={(e) => setWastageInput({ ...wastageInput, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsWastageOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={wastageMutation.isPending}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {wastageMutation.isPending ? 'Logging...' : 'Post Write-Off to OPEX 6200'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Physical Stocktake Count Modal */}
      {isStocktakeOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Physical Stocktake Reconciliation</h3>
              <button onClick={() => setIsStocktakeOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                stocktakeMutation.mutate();
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">Warehouse Storage Depot</label>
                <select
                  required
                  value={stocktakeInput.warehouseId}
                  onChange={(e) => setStocktakeInput({ ...stocktakeInput, warehouseId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">-- Choose Warehouse --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Item SKU Scanned</label>
                <select
                  required
                  value={stocktakeInput.productId}
                  onChange={(e) => setStocktakeInput({ ...stocktakeInput, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="">-- Select Scanned Item --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) · Book Stock: {p.currentStock}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Physical Count Found on Shelves</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  value={stocktakeInput.physicalCount}
                  onChange={(e) => setStocktakeInput({ ...stocktakeInput, physicalCount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-emerald-700"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsStocktakeOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={stocktakeMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  {stocktakeMutation.isPending ? 'Reconciling...' : 'Reconcile & Update Book Stock'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
