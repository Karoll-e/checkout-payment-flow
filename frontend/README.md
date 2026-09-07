# Frontend - Checkout Payment Flow

Frontend para el flujo de checkout con integración de pagos Wompi. Construido con React 19, TypeScript y Vite.

## Stack Tecnológico

- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Redux Toolkit** - Gestión de estado global
- **React Router v7** - Enrutamiento
- **Axios** - Cliente HTTP
- **Wompi** - Procesamiento de pagos
- **Oxlint** - Linter rápido

## Estructura del Proyecto

```
src/
├── app/                    # Configuración de Redux store
│   ├── store.ts
│   └── hooks.ts
├── components/             # Componentes reutilizables
│   ├── CardLogos.tsx       # Logos de tarjetas soportadas
│   ├── PaymentModal.tsx    # Modal de pago con formulario de tarjeta
│   └── ProductHero.tsx     # Hero del producto
├── features/               # Redux slices por feature
│   └── checkout/
│       └── checkoutSlice.ts
├── pages/                  # Páginas de la aplicación
│   ├── ProductPage.tsx     # Página de producto + compra
│   ├── SummaryPage.tsx     # Resumen de orden
│   └── StatusPage.tsx      # Estado de la transacción
├── services/               # Servicios y APIs
│   ├── api.ts              # API del backend (productos, órdenes)
│   └── wompi.ts            # Integración con Wompi (tokenización)
├── utils/                  # Utilidades
│   ├── cardBrand.ts        # Detección de marca de tarjeta
│   └── cardValidation.ts   # Validación de tarjetas (Luhn)
├── App.tsx                 # App principal con rutas
├── main.tsx                # Entry point
└── index.css               # Estilos globales
```

## Flujo de la Aplicación

1. **ProductPage** (`/`) - Muestra el producto, permite seleccionar cantidad y abre el modal de pago
2. **PaymentModal** - Formulario de datos del cliente, entrega y tarjeta (tokeniza con Wompi)
3. **SummaryPage** (`/summary`) - Resumen de la orden, confirma y crea la transacción
4. **StatusPage** (`/status`) - Muestra el resultado de la transacción (aprobada/rechazada/pendiente)

## Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_WOMPI_API_URL=https://sandbox.wompi.co/v1
VITE_WOMPI_PUBLIC_KEY=pub_prod_xxx
```

### Instalación

```bash
pnpm install
```

### Desarrollo

```bash
pnpm dev
```

### Build de Producción

```bash
pnpm build
```

### Preview del Build

```bash
pnpm preview
```

### Linting

```bash
pnpm lint
```

## Integración con Wompi

La tokenización de tarjetas se realiza directamente desde el frontend usando la llave pública de Wompi:

- El formulario captura: número, CVC, expiración, titular
- `wompi.ts` envía los datos a `/tokens/cards` de Wompi
- Retorna un `card_token` que se envía al backend para crear la transacción

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia servidor de desarrollo |
| `pnpm build` | Compila para producción |
| `pnpm preview` | Previsualiza build de producción |
| `pnpm lint` | Ejecuta Oxlint |