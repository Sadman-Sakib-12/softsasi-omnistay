# OmniStay 360 — Architecture & Engineering Documentation

Welcome to the central technical documentation portal for **OmniStay 360**. This documentation covers system architecture, domain models, multi-tenancy, security, and backend engineering standards.

---

## 📚 Documentation Index

### 1. [Architecture & System Design](architecture/overview.md)
- [System Architecture Overview](architecture/overview.md) — High-level architecture, technology choices, and design philosophy.
- [Domain-Driven Design (DDD) & Clean Architecture](architecture/ddd-clean-architecture.md) — The 4-layer structure, dependency inversion, and repository pattern.
- [Monorepo Structure & Package Orchestration](architecture/monorepo-structure.md) — pnpm workspaces, shared libraries, and build pipeline.
- [Multi-Tenancy Architecture](architecture/multi-tenancy.md) — Tenant isolation model, discriminator scoping, and provisioning workflows.
- [Security & 10 Personas RBAC](architecture/security-rbac.md) — 10 personas matrix, mandatory 2FA, token rotation, and rate limiting.

### 2. [Domain Models & Bounded Contexts](domain-models/hotel.md)
- [Hotel PMS & Hospitality](domain-models/hotel.md) — Reservations, rooms, guest folios, tape chart, and iCal sync.
- [Multi-Vertical Travel & Universal Cart](domain-models/travel.md) — Cross-vertical bundling (spaces, tours, cars, boats, events, flights).
- [USALI General Ledger & Night Audit](domain-models/accounting.md) — USALI chart of accounts, double-entry ledger, and night audit daemon.
- [Restaurant & Retail POS](domain-models/pos.md) — Menus, orders, KDS kitchen display, cashier shifts, and room charges.
- [Inventory & Procurement](domain-models/inventory.md) — Multi-warehouse stock, FIFO/AVCO valuation, and 3-way matching.
- [Human Resources & Workforce (HRM)](domain-models/hrm.md) — GPS geofence attendance, overtime rules, leave, and payroll.
- [Guest CRM & Sales Pipeline](domain-models/crm.md) — Lead scoring, sales pipelines, deals, and activity tracking.
- [Guest Loyalty & Rewards](domain-models/loyalty.md) — Wallets, tier progression (Bronze to Platinum), and points burn.
- [Vendor Marketplace](domain-models/marketplace.md) — Multi-vendor listings, commission splits, and escrow payouts.
- [Identity, Access Management & Tenancy](domain-models/auth-iam.md) — Global authentication, user profiles, and organization memberships.

### 3. [Backend Engineering & Developer Guides](backend/api-conventions.md)
- [API Conventions & Standards](backend/api-conventions.md) — REST URL patterns, HTTP methods, status codes, and OpenAPI 3.1.
- [Database & Prisma ORM](backend/database-prisma.md) — Modular Prisma schemas, 319+ tables, UUID keys, and transaction patterns.
- [Redis, BullMQ & Queues](backend/queues-redis.md) — Distributed rate limiting, background job processors, and locks.
- [Testing Strategy & Guidelines](backend/testing-guide.md) — 3-tier testing pyramid, zero-mock domain tests, and Vitest execution.

---

## ⚡ Quick Start for Developers

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Run the complete backend test suite (194 tests)
pnpm --filter @omnistay/backend test

# 3. Build the backend server
pnpm --filter @omnistay/backend build

# 4. Start backend in development mode with live watch
pnpm --filter @omnistay/backend start:dev
```
