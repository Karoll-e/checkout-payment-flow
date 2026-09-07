# Checkout Payment Flow

Sistema completo de checkout con integración de pagos **Wompi** (sandbox). Arquitectura desacoplada: Frontend (React) + Backend (NestJS) + PostgreSQL.

## Arquitectura General

```
checkout-payment-flow/
├── frontend/          # React 19 + Vite + TypeScript + Redux Toolkit
├── backend/           # NestJS 12 + Prisma + PostgreSQL + Wompi
├── docker-compose.yml # PostgreSQL local
└── README.md          # Este archivo
```

## Documentación por Módulo

| Módulo | Descripción | Documentación |
|--------|-------------|---------------|
| **Frontend** | UI de producto, modal de pago, resumen y estado | [`frontend/README.md`](frontend/README.md) |
| **Backend** | API REST, lógica de negocio, integración Wompi | [`backend/README.md`](backend/README.md) |
| **Postman** | Collection para probar endpoints | [`backend/postman-collection.json`](backend/postman-collection.json) |

---

## Inicio Rápido

### Prerrequisitos
- Node.js 20+
- pnpm 9+
- Docker (para PostgreSQL)

### 1. Base de Datos (Docker)
```bash
docker-compose up -d
```

### 2. Backend
```bash
cd backend
pnpm install
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed
pnpm start:dev
```
→ API en `http://localhost:3000`

### 3. Frontend
```bash
cd frontend
pnpm install
pnpm dev
```
→ App en `http://localhost:5173`

---

## Flujo Completo

1. **Frontend** carga producto → `GET /products`
2. **Usuario** elige cantidad → abre modal de pago
3. **Frontend** tokeniza tarjeta con Wompi (llave pública)
4. **Frontend** crea orden → `POST /transactions`
5. **Backend** crea: Customer, Delivery, Transaction (PENDING)
6. **Frontend** confirma → `POST /transactions/:id/confirm` con `cardToken`
7. **Backend** procesa pago con Wompi (llave privada)
8. **Backend** actualiza estado: `APPROVED` / `DECLINED` / `ERROR`
9. **Frontend** muestra resultado → `GET /transactions/:id`

---

## Variables de Entorno

### Backend (`.env`)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/checkout?schema=public
WOMPI_API_URL=https://api-sandbox.co.uat.wompi.dev/v1
WOMPI_PRIVATE_KEY=prv_stagtest_xxx
WOMPI_INTEGRITY_SECRET=stagtest_integrity_xxx
WOMPI_PUBLIC_KEY=pub_stagtest_xxx
PORT=3000
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:3000
VITE_WOMPI_API_URL=https://api-sandbox.co.uat.wompi.dev/v1
VITE_WOMPI_PUBLIC_KEY=pub_stagtest_xxx
```

---

## Scripts Útiles

| Comando | Descripción |
|---------|-------------|
| `docker-compose up -d` | Levanta PostgreSQL |
| `docker-compose down -v` | Baja y limpia volúmenes |
| `cd backend && pnpm test:cov` | Tests con coverage |
| `cd frontend && pnpm lint` | Lint Oxlint |
| `cd backend && pnpm lint` | Lint Oxlint |

---

## Tecnologías Principales

| Capa | Stack |
|------|-------|
| Frontend | React 19, TypeScript, Vite, Redux Toolkit, React Router 7, Axios |
| Backend | NestJS 12, TypeScript, Prisma ORM, PostgreSQL, Wompi SDK |
| DevOps | Docker, pnpm workspaces |

---

## Estructura de Carpetas Clave

```
frontend/src/
├── components/       # PaymentModal, ProductHero, CardLogos
├── pages/            # ProductPage, SummaryPage, StatusPage
├── features/checkout/# Redux slice (checkoutSlice.ts)
├── services/         # api.ts, wompi.ts
└── utils/            # cardValidation, cardBrand

backend/src/
├── application/use-cases/  # create-transaction, confirm-payment
├── domain/                 # entities + ports (interfaces)
├── infrastructure/
│   ├── adapters/driving/   # controllers + dtos
│   ├── adapters/driven/    # prisma repos + wompi gateway
│   └── persistence/prisma/ # PrismaService
└── main.ts                 # Bootstrap + CORS + ValidationPipe
```