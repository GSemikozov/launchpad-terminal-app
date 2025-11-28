# Launchpad Terminal App

A modern Solana-based meme token launchpad application built with React, TypeScript, and Tailwind CSS. Create, manage, and trade tokens on the Solana blockchain with real-time price updates and order management.

## Features

- **Token Creation**: Create new meme tokens with custom metadata, images, and launch parameters
- **Real-time Updates**: Live token prices and market data via WebSocket (Centrifugo)
- **Order Management**: Create, view, and manage limit orders for token trading
- **Portfolio Tracking**: Monitor your token holdings and portfolio performance
- **Wallet Integration**: Full Solana wallet adapter support (Phantom, Solflare, etc.)
- **Responsive Design**: Mobile-first UI with smooth animations and modern UX

## Getting Started

### Prerequisites

- **Node.js** 18+ 
- **npm** or **pnpm**
- **Solana Wallet** (Phantom, Solflare, etc.) for blockchain interactions

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd launchpad-terminal-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # API Configuration
   VITE_API_BASE_URL=https://launch.meme
   
   # Centrifugo WebSocket Configuration
   VITE_CENTRIFUGO_URL=wss://your-centrifugo-url
   VITE_CENTRIFUGO_TOKEN=your-centrifugo-token
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build & Deploy

### Build for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Linting & Formatting

```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code
npm run format
```

## Architecture

This project follows **Feature-Sliced Design (FSD)** principles for scalable and maintainable code organization.

### Project Structure

```
src/
├── app/              # Application layer
│   ├── config/       # Configuration (API, Centrifugo, constants)
│   ├── providers/    # React providers (Query, Wallet, etc.)
│   └── styles/       # Global styles
│
├── pages/            # Page components (routes)
│   ├── home/         # Home page with token list
│   ├── create-token/ # Token creation page
│   ├── orders/       # Orders management page
│   └── profile/      # User profile page
│
├── widgets/          # Complex UI blocks
│   ├── Header/       # App header with wallet button
│   ├── Sidebar/      # Navigation sidebar
│   ├── TokenList/    # Token listing with filters
│   ├── Orders/       # Orders list and detail views
│   └── ...
│
├── features/         # User features (business logic)
│   ├── token/        # Token creation feature
│   ├── order/        # Order management feature
│   ├── profile/      # Profile management feature
│   └── wallet/       # Wallet integration feature
│
├── entities/         # Business entities
│   ├── token/        # Token entity (types, API)
│   ├── order/        # Order entity (types, API)
│   ├── profile/      # Profile entity (types, API)
│   └── wallet/       # Wallet entity (types, API)
│
└── shared/           # Shared resources
    ├── api/          # API client and hooks
    ├── lib/          # Utilities and SDKs
    └── ui/           # Reusable UI components
```

### Layer Rules

- **app**: Application initialization, providers, global config
- **pages**: Route-level page components
- **widgets**: Complex composite UI blocks
- **features**: User-facing features with business logic
- **entities**: Business entities (Token, Order, Profile, Wallet)
- **shared**: Reusable utilities, UI components, and API clients

### Import Aliases

The project uses path aliases for cleaner imports:

```typescript
import { TokenCard } from '@shared/ui';
import { useTokens } from '@entities/token';
import { CreateTokenForm } from '@features/token';
import { API_ENDPOINTS } from '@app/config';
```

## 🛠️ Tech Stack

### Core

- **React 18** - UI library with hooks
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

### State Management & Data Fetching

- **React Query (TanStack Query)** - Server state management, caching, and synchronization
- **React Router** - Client-side routing

### Blockchain

- **@solana/web3.js** - Solana blockchain interaction
- **@solana/wallet-adapter-react** - Wallet adapter for Solana wallets
- **bs58** - Base58 encoding (Solana standard)

### Real-time

- **Centrifugo** - WebSocket server for real-time token prices and updates

### Utilities

- **date-fns** - Date formatting and manipulation
- **classnames** - Conditional CSS class names
- **buffer** - Node.js Buffer polyfill for browser

### Development

- **Biome** - Fast linter and formatter
- **TypeScript** - Static type checking

## 🔌 API Integration

### API Endpoints

The application communicates with a backend API. Main endpoints:

- **Tokens**: `/api/tokens`, `/api/tokens/live`, `/api/tokens/draft`
- **Orders**: `/api/orders`, `/api/orders/wallet/:wallet`
- **Profile**: `/api/profile`, `/api/portfolio`
- **Authentication**: `/api/sign` (message signing for auth)
- **Upload**: `/api/upload` (image upload)

### Authentication

Authentication is handled via message signing:

1. User connects wallet
2. Backend sends a challenge message
3. User signs the message with their wallet
4. Backend verifies signature and returns JWT token (doesn't work on server side now)
5. Token is stored in localStorage and sent with subsequent requests

### Real-time Data

Real-time token prices are received via Centrifugo WebSocket:

- Channel: `tokens` - Broadcasts price updates for all tokens
- Format: Base58 encoded Solana addresses as keys

## Wallet Integration

### Supported Wallets

- Phantom
- Solflare
- Backpack
- Ledger
- And other Solana wallet adapters

## 📱 Pages

### Home (`/`)

- Displays "Hot Tokens" list
- Real-time price updates
- Search and filter functionality
- Infinite scrolling
- Sort by price, volume, market cap

### Create Token (`/create-token`)

- Multi-step token creation form
- Image upload
- Token metadata (name, symbol, description)
- Launch parameters (hardcap, decimals, supply)
- Social links (website, Twitter, Telegram)
- Transaction signing and submission

### My Orders (`/orders`)

- View all orders (active, pending, completed, cancelled)
- Filter by status
- Cancel pending orders
- Responsive design (table on desktop, cards on mobile)
- Mock data for UI testing

### Profile (`/profile`)

- View wallet address
- Update profile (username, bio)
- View portfolio holdings
- Token statistics

## 📄 License

MIT