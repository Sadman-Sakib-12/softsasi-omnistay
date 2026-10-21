# Database & Prisma ORM Architecture

## 1. Multi-File Prisma Schema Architecture

To manage enterprise complexity (319+ tables), OmniStay utilizes **Prisma multi-file schemas** located in `packages/database/prisma/schema/`:

| Schema File | Domain Scope | Primary Models |
| :--- | :--- | :--- |
| `iam.prisma` | Identity & Access | `User`, `Role`, `Permission`, `Membership`, `RefreshToken` |
| `tenancy.prisma` | Multi-Tenancy | `Organization`, `Domain`, `TenantSetting`, `SubscriptionPlan` |
| `hospitality.prisma` | Hotels & PMS | `Hotel`, `RoomType`, `Room`, `RatePlan`, `Booking`, `GuestFolio` |
| `travel-verticals.prisma`| Travel Verticals | `Space`, `Tour`, `Car`, `Boat`, `Event`, `Flight`, `Cart` |
| `pos.prisma` | Restaurant POS | `PosOutlet`, `Menu`, `MenuItem`, `PosOrder`, `CashRegisterShift` |
| `inventory.prisma` | Warehouses & Stock | `Warehouse`, `Product`, `StockLevel`, `PurchaseOrder` |
| `hrm.prisma` | Human Resources | `Employee`, `Department`, `AttendanceRecord`, `LeaveRequest` |
| `crm.prisma` | Guest CRM | `Lead`, `Pipeline`, `PipelineStage`, `Deal`, `ActivityLog` |
| `loyalty.prisma` | Loyalty & Rewards | `LoyaltyProgram`, `LoyaltyTier`, `LoyaltyWallet`, `PointsTransaction`|
| `marketplace.prisma` | Multi-Vendor | `Vendor`, `VendorListing`, `VendorPayout`, `MarketplaceReview` |
| `accounting.prisma` | USALI Financials | `ChartOfAccount`, `JournalEntry`, `Invoice`, `Bill`, `NightAuditRun` |

---

## 2. Database Design Standards

### 2.1 UUID Primary Keys
All primary keys use UUID v4 values generated via native PostgreSQL functions:
```prisma
id String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
```

### 2.2 Soft Deletes
Critical commercial entities utilize soft deletes to maintain auditability and accounting compliance:
```prisma
deletedAt DateTime? @map("deleted_at")
```
Services and repositories explicitly filter `{ deletedAt: null }` on all queries.

### 2.3 Currency & Decimal Precision
Monetary values are stored strictly as `Decimal(15, 2)` to avoid floating-point rounding errors:
```prisma
totalAmount Decimal @default(0) @map("total_amount") @db.Decimal(15, 2)
```

---

## 3. Transaction Management Patterns

Atomic operations spanning multiple tables (e.g. creating a booking and its initial folio) use Prisma interactive transactions:

```typescript
return this.prisma.$transaction(async (tx) => {
  // 1. Create confirmed booking
  const booking = await tx.booking.create({ data: bookingData });

  // 2. Provision initial guest folio
  const folio = await tx.guestFolio.create({
    data: {
      bookingId: booking.id,
      folioNumber: generateFolioNumber(),
      totalCharges: totalAmount,
      balanceDue: totalAmount - depositAmount,
      status: 'open',
    },
  });

  // 3. Post room charge transaction
  await tx.folioTransaction.create({
    data: {
      folioId: folio.id,
      transactionType: 'charge',
      department: 'room',
      amount: totalAmount,
    },
  });

  return { booking, folio };
});
```
