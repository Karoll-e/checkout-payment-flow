# Backend - Checkout Payment Flow

API REST para el flujo de checkout con integración de pagos Wompi. Construido con NestJS, Prisma y PostgreSQL.

## Stack Tecnológico

- **NestJS 12** - Framework Node.js
- **TypeScript** - Tipado estático
- **Prisma ORM** - Base de datos
- **PostgreSQL** - Base de datos relacional
- **Wompi** - Procesamiento de pagos (sandbox)
- **Jest** - Testing
- **Oxlint** - Linter rápido

## Estructura del Proyecto

```
src/
├── app.module.ts                    # Módulo principal
├── main.ts                          # Entry point
├── application/
│   └── use-cases/                   # Casos de uso
│       ├── create-transaction.use-case.ts
│       └── confirm-payment.use-case.ts
├── domain/
│   ├── entities/                    # Entidades de dominio
│   │   ├── transaction.entity.ts
│   │   ├── product.entity.ts
│   │   ├── customer.entity.ts
│   │   └── delivery.entity.ts
│   └── ports/                       # Interfaces (ports)
│       ├── transaction-repository.port.ts
│       ├── product-repository.port.ts
│       ├── payment-gateway.port.ts
│       ├── customer-repository.port.ts
│       └── delivery-repository.port.ts
├── infrastructure/
│   ├── adapters/
│   │   ├── driving/                 # Controladores (inbound)
│   │   │   ├── product.controller.ts
│   │   │   ├── transaction.controller.ts
│   │   │   └── dtos/
│   │   └── driven/                  # Adaptadores (outbound)
│   │       ├── prisma-product.repository.ts
│   │       ├── prisma-customer.repository.ts
│   │       ├── prisma-delivery.repository.ts
│   │       ├── prisma-transaction.repository.ts
│   │       └── wompi-payment.gateway.ts
│   └── persistence/
│       └── prisma/
│           └── prisma.service.ts
└── generated/
    └── prisma/                      # Cliente Prisma generado
```

## Endpoints API

### Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/products` | Listar todos los productos |
| GET | `/products/:id` | Obtener producto por ID |

### Transacciones

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/transactions` | Crear transacción (orden + datos cliente/entrega) |
| POST | `/transactions/:id/confirm` | Confirmar pago con card_token de Wompi |
| GET | `/transactions/:id` | Obtener estado de transacción |

---

### Detalle de Endpoints

#### POST `/transactions`
Crea una transacción pendiente con los datos del producto, cliente y entrega.

**Request Body:**
```json
{
  "productId": "clx...",
  "quantity": 1,
  "customer": {
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "+573001234567"
  },
  "delivery": {
    "address": "Calle 123 #45-67",
    "city": "Bogotá"
  },
  "deliveryFee": 15000
}
```

**Response (201):**
```json
{
  "id": "clx...",
  "status": "PENDING",
  "productId": "clx...",
  "quantity": 1,
  "productAmount": 149900,
  "baseFee": 0,
  "deliveryFee": 15000,
  "totalAmount": 164900,
  "wompiTransactionId": null,
  "errorMessage": null
}
```

#### POST `/transactions/:id/confirm`
Confirma el pago enviando el `card_token` obtenido desde el frontend (Wompi).

**Request Body:**
```json
{
  "cardToken": "tok_..."
}
```

**Response (200):**
```json
{
  "id": "clx...",
  "status": "APPROVED",
  "productId": "clx...",
  "quantity": 1,
  "productAmount": 149900,
  "baseFee": 0,
  "deliveryFee": 15000,
  "totalAmount": 164900,
  "wompiTransactionId": "txn_...",
  "errorMessage": null
}
```

Estados posibles: `PENDING`, `APPROVED`, `DECLINED`, `ERROR`

---

## Configuración

### Variables de Entorno

```env
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public
WOMPI_API_URL=https://api-sandbox.co.uat.wompi.dev/v1
WOMPI_PRIVATE_KEY=prv_stagtest_xxx
WOMPI_INTEGRITY_SECRET=stagtest_integrity_xxx
WOMPI_PUBLIC_KEY=pub_stagtest_xxx
PORT=3000
```

### Instalación

```bash
pnpm install
```

### Base de Datos

```bash
# Generar cliente Prisma
pnpm prisma generate

# Ejecutar migraciones
pnpm prisma migrate dev

# Seed de datos de prueba
pnpm prisma db seed
```

### Desarrollo

```bash
pnpm start:dev
```

### Producción

```bash
pnpm build
pnpm start:prod
```

### Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:cov
```

### Linting

```bash
pnpm lint
```

## Flujo de Transacción

1. **Frontend** obtiene productos → `GET /products`
2. **Usuario** selecciona producto y cantidad
3. **Frontend** tokeniza tarjeta con Wompi (usa `WOMPI_PUBLIC_KEY`)
4. **Frontend** crea transacción → `POST /transactions` (sin card_token)
5. **Backend** crea: Customer, Delivery, Transaction (PENDING)
6. **Frontend** confirma pago → `POST /transactions/:id/confirm` con `cardToken`
7. **Backend** llama a Wompi con `WOMPI_PRIVATE_KEY` para procesar pago
8. **Backend** actualiza transacción: `APPROVED` / `DECLINED` / `ERROR`
9. **Frontend** consulta estado → `GET /transactions/:id`

## Arquitectura

Clean Architecture con:
- **Domain**: Entidades y puertos (interfaces)
- **Application**: Casos de uso (orquestación)
- **Infrastructure**: Adaptadores (Prisma, Wompi, Controllers)

## Postman Collection

Ver `postman-collection.json` en la raíz del proyecto para importar en Postman.

## Datos de Prueba (Seed)

El seed crea un producto:
- **Game Boy** - $149.900 COP - Stock: 12