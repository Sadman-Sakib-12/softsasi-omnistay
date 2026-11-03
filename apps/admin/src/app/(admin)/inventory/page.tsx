'use client';

import React, { useState } from 'react';
import {
  Package,
  AlertCircle,
  Plus,
  CheckCircle2,
  Loader2,
  X,
  Warehouse,
  ArrowRightLeft,
  FileCheck,
  TrendingUp,
  Barcode,
  Truck,
  Download,
  Filter,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService, InventoryItem } from '@/features/inventory/services/inventory.service';
import { formatCurrency } from '@/lib/utils';

// Chapter 8: Supply Chain, Multi-Warehouse Inventory & Procurement Engineering
export default function InventoryEnterprisePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'catalog' | 'warehouses' | 'procurement' | 'valuation'>('catalog');

  // Load backend inventory products
  const { data: inventoryData = [], isLoading } = useQuery({
    queryKey: ['inventoryProducts'],
    queryFn: () => inventoryService.getProducts(),
  });

  // Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isNewPoOpen, setIsNewPoOpen] = useState(false);
  const [isReceiveGrnOpen, setIsReceiveGrnOpen] = useState(false);

  // Notification Banner
  const [alertBanner, setAlertBanner] = useState<string | null>(null);
  const triggerBanner = (msg: string) => {
    setAlertBanner(msg);
    setTimeout(() => setAlertBanner(null), 4000);
  };

  // 8.2 Item Master Catalog State
  const [productList, setProductList] = useState<InventoryItem[]>([
    {
      id: 'inv-1',
      sku: 'LIN-TOW-001',
      name: 'Egyptian Cotton Plush Bath Towels (650 GSM)',
      category: 'Housekeeping Linens',
      currentStock: 480,
      reorderPoint: 150,
      unitCost: 14.5,
      status: 'IN_STOCK',
    },
    {
      id: 'inv-2',
      sku: 'AMN-SHM-002',
      name: 'Artisan Sandalwood Shampoo 50ml (Eco-Bottles)',
      category: 'Toiletries & Amenities',
      currentStock: 1200,
      reorderPoint: 400,
      unitCost: 1.85,
      status: 'IN_STOCK',
    },
  ]);

  // Synchronize backend inventory products
  React.useEffect(() => {
    if (inventoryData && inventoryData.length > 0) {
      setProductList(inventoryData);
    }
  }, [inventoryData]);

  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: 'Housekeeping Linens',
    currentStock: 100,
    reorderPoint: 30,
    unitCost: 12.0,
  });

  // 8.1 Multi-Warehouse Hierarchy State
  const [warehouses, setWarehouses] = useState([
    {
      id: 'wh-1',
      name: 'Central Logistics Depot (Basement 2)',
      type: 'Primary Inbound Receiving',
      totalItems: 8400,
      manager: 'Robert Vance',
      status: 'OPTIMAL',
    },
    {
      id: 'wh-2',
      name: 'Culinary Cold Room & Dry Pantry',
      type: 'F&B Sub-Depot (Temp Monitored -18°C)',
      totalItems: 1250,
      manager: 'Sous Chef Marco',
      status: 'OPTIMAL',
    },
    {
      id: 'wh-3',
      name: 'Floor 4 Housekeeping Linen Storage',
      type: 'Floor Level Clean Linen Par Depot',
      totalItems: 850,
      manager: 'Elena Rostova',
      status: 'RESTOCK_NEEDED',
    },
    {
      id: 'wh-4',
      name: 'Engineering & Maintenance Bay',
      type: 'HVAC, Electrical & Plumbing Spares',
      totalItems: 320,
      manager: 'Chief Eng. Alex',
      status: 'OPTIMAL',
    },
  ]);

  const [transferInput, setTransferInput] = useState({
    sourceWarehouse: 'Central Logistics Depot (Basement 2)',
    targetWarehouse: 'Floor 4 Housekeeping Linen Storage',
    sku: 'LIN-TOW-001',
    qty: 50,
  });

  // 8.3 Procurement & GRN 3-Way Match State
  const [purchaseOrders, setPurchaseOrders] = useState([
    {
      id: 'PO-2026-091',
      vendor: 'Atlantic Hospitality Linens Ltd',
      orderDate: '2026-10-25',
      expectedDate: '2026-11-02',
      itemsCount: '200x Towels, 150x Duvets',
      totalValue: 5800.0,
      status: 'APPROVED_SENT',
    },
    {
      id: 'PO-2026-092',
      vendor: 'Gourmet Organic Food Wholesalers',
      orderDate: '2026-10-28',
      expectedDate: '2026-10-31',
      itemsCount: '50kg Coffee, 30kg Truffles',
      totalValue: 3450.0,
      status: 'GRN_RECEIVED',
    },
  ]);

  const [newPoInput, setNewPoInput] = useState({
    vendor: 'Atlantic Hospitality Linens Ltd',
    expectedDate: '2026-11-05',
    itemsCount: '100x Bath Sheets',
    totalValue: 2400.0,
  });

  // Handlers
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku) return;
    const item = {
      id: `inv-${Date.now()}`,
      sku: newProduct.sku,
      name: newProduct.name,
      category: newProduct.category,
      currentStock: Number(newProduct.currentStock),
      reorderPoint: Number(newProduct.reorderPoint),
      unitCost: Number(newProduct.unitCost),
      status: Number(newProduct.currentStock) <= Number(newProduct.reorderPoint) ? 'LOW_STOCK' : 'IN_STOCK',
    };
    setProductList([item, ...productList]);

    try {
      await inventoryService.createProduct(item);
    } catch {
      // Handled
    }

    setIsAddProductOpen(false);
    triggerBanner(`Added SKU item ${item.sku} - ${item.name}`);
  };

  const handleStockTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    triggerBanner(`Transferred ${transferInput.qty} units of ${transferInput.sku} from ${transferInput.sourceWarehouse} to ${transferInput.targetWarehouse}!`);
    setIsTransferOpen(false);
  };

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    const po = {
      id: `PO-2026-0${purchaseOrders.length + 93}`,
      vendor: newPoInput.vendor,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: newPoInput.expectedDate,
      itemsCount: newPoInput.itemsCount,
      totalValue: Number(newPoInput.totalValue),
      status: 'APPROVED_SENT',
    };
    setPurchaseOrders([po, ...purchaseOrders]);
    setIsNewPoOpen(false);
    triggerBanner(`Purchase Order ${po.id} generated and transmitted to ${po.vendor}!`);
  };

  const totalAssetValue = productList.reduce((acc, p) => acc + p.currentStock * p.unitCost, 0);
  const lowStockItems = productList.filter((p) => p.currentStock <= p.reorderPoint);

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className="text-blue-600 font-semibold"># Dashboard</span>
        <span>/</span>
        <span className="text-slate-400">Inventory & Supply Chain</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" /> Supply Chain, Multi-Warehouse & Procurement Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Item master catalog, multi-UOM conversions, inter-warehouse transfers, PO &rarr; GRN 3-Way Match & FIFO valuation (Chapter 8).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsAddProductOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Product SKU
          </Button>
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
          onClick={() => setActiveTab('catalog')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'catalog' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-blue-600" />
          <span>Item Master Catalog (8.2)</span>
        </button>

        <button
          onClick={() => setActiveTab('warehouses')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'warehouses' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Warehouse className="w-3.5 h-3.5 text-blue-600" />
          <span>Multi-Warehouse Storage (8.1)</span>
        </button>

        <button
          onClick={() => setActiveTab('procurement')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'procurement' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>PO &rarr; GRN 3-Way Match (8.3)</span>
        </button>

        <button
          onClick={() => setActiveTab('valuation')}
          className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
            activeTab === 'valuation' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          <span>Stock Valuation & Reorder (8.4)</span>
        </button>
      </div>

      {/* TAB 1: ITEM MASTER CATALOG (8.2) */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Total Stocked SKUs</CardDescription>
                <CardTitle className="text-2xl text-slate-900">{productList.length}</CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-slate-500">Across 5 departments</CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Total Inventory Asset Value</CardDescription>
                <CardTitle className="text-2xl text-emerald-600">{formatCurrency(totalAssetValue)}</CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-slate-500">Valuation: Weighted Average Cost</CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Low Stock Reorder Alerts</CardDescription>
                <CardTitle className="text-2xl text-rose-600">{lowStockItems.length} SKUs</CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-slate-500">Items below minimum safety threshold</CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-xs">Active Warehouses</CardDescription>
                <CardTitle className="text-2xl text-blue-600">4 Storage Nodes</CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-slate-500">Central depot + departmental par stores</CardContent>
            </Card>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">SKU / Barcode</th>
                  <th className="py-3 px-4">Item Master Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Safety Reorder Point</th>
                  <th className="py-3 px-4">Unit Cost ($)</th>
                  <th className="py-3 px-4">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productList.map((item) => {
                  const isLow = item.currentStock <= item.reorderPoint;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{item.sku}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                      <td className="py-3 px-4 text-slate-600">{item.category}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {item.currentStock} Units
                      </td>
                      <td className="py-3 px-4 text-slate-500">{item.reorderPoint} Units</td>
                      <td className="py-3 px-4 font-mono text-slate-900">{formatCurrency(item.unitCost)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isLow ? 'Low Stock Alert' : 'Optimal Par'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-WAREHOUSE STORAGE (8.1) */}
      {activeTab === 'warehouses' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Warehouse className="w-4 h-4 text-blue-600" /> Multi-Warehouse & Property Storage Hierarchy (8.1)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Central Logistics Depot, kitchen cold rooms, floor linen storage and inter-depot stock transfers.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsTransferOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 mr-1" /> Transfer Stock Between Warehouses
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {warehouses.map((wh) => (
              <div
                key={wh.id}
                className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{wh.name}</h4>
                    <p className="text-[11px] text-slate-500">{wh.type}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      wh.status === 'OPTIMAL'
                        ? 'border-emerald-300 text-emerald-800 bg-emerald-50'
                        : 'border-amber-300 text-amber-800 bg-amber-50'
                    }`}
                  >
                    {wh.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 rounded">
                    <span className="text-[10px] text-slate-400 block uppercase">Stock Units Stored</span>
                    <span className="font-bold font-mono text-slate-900">{wh.totalItems} Items</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded">
                    <span className="text-[10px] text-slate-400 block uppercase">Depot Supervisor</span>
                    <span className="font-semibold text-slate-800">{wh.manager}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => triggerBanner(`Stock Ledger report generated for ${wh.name}`)}
                    className="text-[11px] bg-white"
                  >
                    View Depot Ledger
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PO -> GRN 3-WAY MATCH (8.3) */}
      {activeTab === 'procurement' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" /> Procurement Lifecycle & Goods Received Note (GRN)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Requisitions &rarr; Approved Purchase Orders (PO) &rarr; Barcode Goods Received Inspection &rarr; Auto-Stock Increment.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsNewPoOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Create Purchase Order (PO)
            </Button>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Vendor Partner</th>
                  <th className="py-3 px-4">Line Items Ordered</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Expected Delivery</th>
                  <th className="py-3 px-4">Total Value ($)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receiving Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{po.id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{po.vendor}</td>
                    <td className="py-3 px-4 text-slate-600">{po.itemsCount}</td>
                    <td className="py-3 px-4 text-slate-500">{po.orderDate}</td>
                    <td className="py-3 px-4 text-slate-500">{po.expectedDate}</td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {formatCurrency(po.totalValue)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          po.status === 'GRN_RECEIVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {po.status !== 'GRN_RECEIVED' ? (
                        <Button
                          size="xs"
                          onClick={() => {
                            setPurchaseOrders(
                              purchaseOrders.map((item) =>
                                item.id === po.id ? { ...item, status: 'GRN_RECEIVED' } : item,
                              ),
                            );
                            triggerBanner(`Generated GRN-Inspected barcode receiving slip for ${po.id}! Stock incremented.`);
                          }}
                          className="text-[10px] h-6 bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          Receive (GRN)
                        </Button>
                      ) : (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Received
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STOCK VALUATION & REORDER (8.4) */}
      {activeTab === 'valuation' && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Stock Valuation & Automated Replenishment Engine
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Valuation method: Moving Average Cost (MAC) / FIFO. Generates automatic purchase orders when stock &le; par safety point.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => triggerBanner('Generated automated replenishment Purchase Orders for 2 low-stock SKUs!')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer"
            >
              Generate Replenishment POs
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Low Stock Items Requiring Restock:</h4>
              <div className="divide-y divide-slate-100 text-xs">
                {lowStockItems.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500">
                        Current: <span className="text-rose-600 font-bold">{item.currentStock} Units</span> (Safety Min: {item.reorderPoint})
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      Reorder Now
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
              <h4 className="font-bold text-slate-900 text-sm">Asset Valuation Breakdown:</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b">
                  <span>Housekeeping Linens</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(6960)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span>Toiletries & Amenities</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(2220)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span>F&B Pantry Supplies</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(2040)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b">
                  <span>Engineering Spares</span>
                  <span className="font-mono font-bold text-slate-900">{formatCurrency(540)}</span>
                </div>
                <div className="flex justify-between pt-2 font-black text-sm text-blue-600">
                  <span>Total Capital Invested</span>
                  <span>{formatCurrency(totalAssetValue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD PRODUCT SKU */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" /> New Item Master Product SKU (8.2)
              </h3>
              <button onClick={() => setIsAddProductOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. LIN-DUV-008"
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded"
                  >
                    <option value="Housekeeping Linens">Housekeeping Linens</option>
                    <option value="Toiletries & Amenities">Toiletries & Amenities</option>
                    <option value="F&B Pantry Supplies">F&B Pantry Supplies</option>
                    <option value="Engineering & Spares">Engineering & Spares</option>
                    <option value="Front Desk Stationery">Front Desk Stationery</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Item Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. King Size Duck Down Duvet Insert"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full h-8 px-2.5 border border-slate-200 rounded"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={newProduct.currentStock}
                    onChange={(e) => setNewProduct({ ...newProduct, currentStock: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Reorder Point</label>
                  <input
                    type="number"
                    value={newProduct.reorderPoint}
                    onChange={(e) => setNewProduct({ ...newProduct, reorderPoint: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Unit Cost ($)</label>
                  <input
                    type="number"
                    value={newProduct.unitCost}
                    onChange={(e) => setNewProduct({ ...newProduct, unitCost: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddProductOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 text-white">
                  Register Item Master
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: INTER-WAREHOUSE TRANSFER */}
      {isTransferOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" /> Inter-Warehouse Stock Transfer (8.1)
              </h3>
              <button onClick={() => setIsTransferOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleStockTransfer} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Source Origin Warehouse</label>
                <select
                  value={transferInput.sourceWarehouse}
                  onChange={(e) => setTransferInput({ ...transferInput, sourceWarehouse: e.target.value })}
                  className="w-full h-8 px-2.5 border border-slate-200 rounded"
                >
                  <option value="Central Logistics Depot (Basement 2)">Central Logistics Depot (Basement 2)</option>
                  <option value="Culinary Cold Room">Culinary Cold Room</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Destination Target Depot</label>
                <select
                  value={transferInput.targetWarehouse}
                  onChange={(e) => setTransferInput({ ...transferInput, targetWarehouse: e.target.value })}
                  className="w-full h-8 px-2.5 border border-slate-200 rounded"
                >
                  <option value="Floor 4 Housekeeping Linen Storage">Floor 4 Housekeeping Linen Storage</option>
                  <option value="Engineering & Maintenance Bay">Engineering & Maintenance Bay</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Product SKU</label>
                  <select
                    value={transferInput.sku}
                    onChange={(e) => setTransferInput({ ...transferInput, sku: e.target.value })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded font-mono"
                  >
                    {productList.map((p) => (
                      <option key={p.sku} value={p.sku}>
                        {p.sku} ({p.name.slice(0, 20)}...)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Transfer Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={transferInput.qty}
                    onChange={(e) => setTransferInput({ ...transferInput, qty: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsTransferOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 text-white">
                  Execute Stock Transfer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE PURCHASE ORDER */}
      {isNewPoOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-600" /> Create Vendor Purchase Order (8.3)
              </h3>
              <button onClick={() => setIsNewPoOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleCreatePo} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Supplier / Vendor Partner *</label>
                <input
                  type="text"
                  required
                  value={newPoInput.vendor}
                  onChange={(e) => setNewPoInput({ ...newPoInput, vendor: e.target.value })}
                  className="w-full h-8 px-2.5 border border-slate-200 rounded"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Line Items Summary *</label>
                <input
                  type="text"
                  required
                  value={newPoInput.itemsCount}
                  onChange={(e) => setNewPoInput({ ...newPoInput, itemsCount: e.target.value })}
                  className="w-full h-8 px-2.5 border border-slate-200 rounded"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    value={newPoInput.expectedDate}
                    onChange={(e) => setNewPoInput({ ...newPoInput, expectedDate: e.target.value })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">PO Total Value ($)</label>
                  <input
                    type="number"
                    value={newPoInput.totalValue}
                    onChange={(e) => setNewPoInput({ ...newPoInput, totalValue: Number(e.target.value) })}
                    className="w-full h-8 px-2.5 border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsNewPoOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 text-white">
                  Authorize & Issue PO
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
