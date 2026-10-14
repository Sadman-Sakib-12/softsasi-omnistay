# OmniStay Monorepo

OmniStay is a modern property rental and hospitality management platform built as a high-performance monorepo using **pnpm workspaces**.

---

## 🏗 Repository Structure

```text
softsasi-omnistay/
├── apps/
│   ├── web/        # Next.js customer-facing booking & stay portal
│   ├── admin/      # Next.js admin dashboard & property management console
│   └── backend/    # NestJS REST/GraphQL API server with Vitest & TypeScript
├── package.json    # Root scripts and workspace orchestration
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [pnpm](https://pnpm.io/) (v10+ or v12+)

### Installation

Install all dependencies across the workspace:

```bash
pnpm install
```

---

## 💻 Development Scripts

Run individual applications from the root:

| Command | Description |
| :--- | :--- |
| `pnpm dev:web` | Start customer portal (`apps/web`) in development mode |
| `pnpm dev:admin` | Start admin dashboard (`apps/admin`) in development mode |
| `pnpm dev:backend` | Start NestJS backend (`apps/backend`) in watch mode |
| `pnpm build:web` | Build customer portal for production |
| `pnpm build:admin` | Build admin dashboard for production |
| `pnpm build:backend` | Build backend server for production |

---

## 🛠 Tech Stack

- **Monorepo**: pnpm workspaces
- **Frontend / Portal**: Next.js 16, React 19, Tailwind CSS
- **Admin Dashboard**: Next.js 16, React 19, Tailwind CSS
- **Backend API**: NestJS 12, Express, TypeScript, Vitest
