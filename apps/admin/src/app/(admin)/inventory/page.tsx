'use client';

import React from 'react';
import { Package, AlertCircle, Plus, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/data-table/data-table';
import { useQuery } from '@tanstack/react-query';
import { inventoryService, InventoryItem } from '@/features/inventory/services/inventory.service';
import { formatCurrency } from '@/lib/utils';

export default function InventoryPage() {
  const { data: inventoryData = [], isLoading } = useQuery({
    queryKey: ['inventoryProducts'],
    queryFn: () => inventoryService.getProducts(),
  });

  const columns: Column<InventoryItem>[] = [
    {
      header: 'SKU / Code',
      accessorKey: 'sku',
      cell: (item) => <span className="font-mono text-emerald-400 font-semibold">{item.sku}</span>,
    },
    {
      header: 'Item Name',
      accessorKey: 'name',
      cell: (item) => <span className="font-medium text-white">{item.name}</span>,
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: (item) => <Badge variant="outline" className="text-slate-300">{item.category}</Badge>,
    },
    {
      header: 'Current Stock',
      cell: (item) => (
        <span className={item.currentStock <= item.reorderPoint ? 'text-rose-400 font-bold' : 'text-slate-200'}>
          {item.currentStock} Units
        </span>
      ),
    },
    {
      header: 'Reorder Point',
      cell: (item) => <span className="text-slate-400">{item.reorderPoint} Units</span>,
    },
    {
      header: 'Unit Cost',
      cell: (item) => <span className="text-slate-300">{formatCurrency(item.unitCost)}</span>,
    },
    {
      header: 'Status',
      cell: (item) => (
        <Badge variant={item.currentStock <= item.reorderPoint ? 'destructive' : 'success'}>
          {item.currentStock <= item.reorderPoint ? 'Low Stock' : 'Optimal'}
        </Badge>
      ),
    },
  ];

  const lowStockCount = inventoryData.filter((i) => i.currentStock <= i.reorderPoint).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-400" /> Supply Chain & Inventory Master
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time warehouse stock tracking, UOM conversions, and automated reorder alerts (Chapter 8).
          </p>
        </div>
        <Button variant="glow" size="sm">
          <Plus className="w-4 h-4 mr-1" /> Add Product Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Stocked Items</CardDescription>
            <CardTitle className="text-2xl text-white">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : inventoryData.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">Active SKUs in central warehouse</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Low Stock Alerts</CardDescription>
            <CardTitle className="text-2xl text-rose-400">
              {isLoading ? '...' : lowStockCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">Items below minimum threshold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Inventory Asset Value</CardDescription>
            <CardTitle className="text-2xl text-emerald-400">
              {isLoading
                ? '...'
                : formatCurrency(inventoryData.reduce((acc, i) => acc + i.currentStock * i.unitCost, 0))}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-slate-400">Valuation method: Moving Average Cost</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base text-white">Warehouse Inventory Catalog</CardTitle>
          <CardDescription className="text-xs">Live stock ledger retrieved directly from NestJS Inventory API</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={inventoryData}
            columns={columns}
            isLoading={isLoading}
            emptyTitle="No inventory items found"
            emptySubtitle="Live stock items from Inventory API will appear here."
          />
        </CardContent>
      </Card>
    </div>
  );
}
