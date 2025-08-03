# 🎭 EmojiSwap - Cross-Chain Token Swaps with Emojis

> **Cross-chain swaps made by emojis, powered by 1inch**

EmojiSwap is a revolutionary DeFi application that enables users to perform cross-chain token swaps using simple emoji codes. Built with Next.js, powered by 1inch Fusion+ SDK, and featuring a delightful comical UI design.

When you make the final swap make sure it asks two requests from your wallet- One is for approve the spending cap and another one is for signature request. Both will work.

If you excecute the swap and if it fails within one tx dont worry(just a tx hash return error), the spending cap has been approved with transaction, and if you hit another time for “execute cross chain swap” button, it will sign and make the swap.

Its just a wagmi issue, other than that it works well.

![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![1inch](https://img.shields.io/badge/1inch-Fusion%2B-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Features

### 🎯 Core Functionality

- **Cross-Chain Swaps**: Swap tokens across 12+ supported blockchain networks
- **Emoji-Based Receipts**: Create and retrieve payment receipts using unique emoji codes
- **1inch Fusion+ Integration**: Powered by 1inch's advanced cross-chain swap technology
- **MEV Protection**: Built-in protection against Maximal Extractable Value attacks
- **Self-Custody**: Users maintain full control of their assets

### 🎨 User Experience

- **Comical UI Design**: Delightful cartoon-style interface with custom fonts
- **Animated Components**: Smooth animations using Framer Motion
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Progressive Disclosure**: Information revealed gradually for better UX

### 🔧 Technical Features

- **Web3 Integration**: Seamless wallet connection with Wagmi v2
- **Real-Time Pricing**: Live token prices from 1inch API
- **Multi-Chain Support**: Ethereum, Polygon, BSC, Arbitrum, and more
- **Supabase Backend**: Secure receipt storage and retrieval
- **TypeScript**: Full type safety throughout the application

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Web3 wallet (MetaMask, WalletConnect, etc.)
- 1inch API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd unitedefi
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_PROJECT_ID=your_reown_project_id
   INCH_API_KEY=your_1inch_api_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Application Pages

### 🏠 Landing Page (`/`)

- **Hero Section**: EmojiSwap branding with comical cartoon font
- **Statistics**: Real-time stats showing supported chains, trades, MEV protection
- **Navigation**: Access to all main features via bottom navbar

### 📝 Create Receipt (`/create-receipt`)

- **Receipt Generation**: Create payment receipts with emoji codes
- **Form Fields**: Amount, destination chain, token, and address
- **Success Modal**: Displays generated emoji code for sharing

### 🎯 Drop Receipt (`/drop-receipt`)

- **Receipt Retrieval**: Paste emoji codes to retrieve payment details
- **Price Calculation**: Real-time token price conversion
- **Cross-Chain Swap**: Execute swaps using 1inch Fusion+ technology
- **Progressive UI**: Step-by-step interface with conditional rendering

### 🔐 Wallet Approval Process

When executing the final cross-chain swap, your wallet will request **two separate approvals**:

1. **Spending Cap Approval**: First transaction to approve token spending
2. **Signature Request**: Second transaction to execute the actual swap

**Important Notes:**

- ✅ **Both approvals are required** for the swap to complete successfully
- ✅ **If the swap fails on first attempt**, the spending cap approval remains active
- ✅ **Simply retry the "Execute Cross-Chain Swap" button** - no need to re-approve spending
- ✅ **This is a known Wagmi behavior** - the functionality works correctly despite the two-step process

## 🔧 Technical Architecture

### Frontend Stack

- **Next.js 15.4.4**: App Router for routing and SSR
- **React 19.1.0**: Latest React with concurrent features
- **TypeScript 5**: Full type safety
- **Tailwind CSS 4**: Utility-first styling
- **Framer Motion**: Smooth animations and interactions

### Web3 Integration

- **Wagmi v2**: React hooks for Ethereum
- **Reown AppKit**: Enhanced wallet experience
- **Ethers.js v5**: Ethereum library
- **Viem**: TypeScript interface for Ethereum

### Backend Services

- **1inch Fusion+ SDK**: Cross-chain swap functionality
- **1inch API**: Token lists and spot prices
- **Supabase**: Database and authentication
- **Next.js API Routes**: Server-side API proxies

### Key Components

#### Core Services

- `fusionPlusService.ts`: 1inch Fusion+ integration
- `receiptService.ts`: Supabase receipt operations
- `tokenService.ts`: Token list management
- `spotPriceService.ts`: Real-time pricing

#### UI Components

- `Navbar.tsx`: Bottom navigation with comical styling
- `ChainSelect.tsx`: Multi-chain selection dropdown
- `TokenSelect.tsx`: Token selection with search
- `ConnectButton.tsx`: Web3 wallet connection

#### API Routes

- `/api/fusion-plus`: 1inch Fusion+ proxy
- `/api/tokens/[chainId]`: Token list endpoint
- `/api/spot-price/[chainId]/[tokenAddress]`: Price data
- `/api/fusion-plus-execute`: Swap execution

## 🎨 Design System

### Typography

- **Comical Cartoon**: Custom TTF font for playful UI elements
- **SF Pro Display**: System font for technical content

### Color Palette

- **Primary**: Orange/Yellow gradients for buttons
- **Secondary**: Purple/Blue for special actions
- **Background**: Custom background image with overlay
- **Text**: White with black outlines for readability

### Animations

- **Entrance Effects**: Fade-in and scale animations
- **Hover States**: Interactive button animations
- **Loading States**: Smooth transitions during operations

## 🔐 Security Features

### Web3 Security

- **Wallet Validation**: Proper connection state management
- **Transaction Signing**: Secure user approval flow
- **Error Handling**: Comprehensive error catching and user feedback

### API Security

- **CORS Protection**: Server-side API proxies
- **Rate Limiting**: Built-in request throttling
- **Input Validation**: Type-safe parameter handling

## 📊 Supported Networks

| Network       | Chain ID | Status |
| ------------- | -------- | ------ |
| Ethereum      | 1        | ✅     |
| Polygon       | 137      | ✅     |
| BSC           | 56       | ✅     |
| Arbitrum      | 42161    | ✅     |
| Optimism      | 10       | ✅     |
| Avalanche     | 43114    | ✅     |
| Fantom        | 250      | ✅     |
| Base          | 8453     | ✅     |
| Linea         | 59144    | ✅     |
| Polygon zkEVM | 1101     | ✅     |
| zkSync Era    | 324      | ✅     |
| Scroll        | 534352   | ✅     |

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── api/            # API routes
│   ├── create-receipt/ # Receipt creation page
│   ├── drop-receipt/   # Receipt retrieval page
│   └── layout.tsx      # Root layout
├── components/         # Reusable UI components
├── config/            # Configuration files
├── context/           # React context providers
├── lib/               # Utility libraries
├── services/          # Business logic services
└── types/             # TypeScript type definitions
```

### Environment Variables

| Variable                        | Description               | Required |
| ------------------------------- | ------------------------- | -------- |
| `NEXT_PUBLIC_PROJECT_ID`        | Reown AppKit project ID   | ✅       |
| `INCH_API_KEY`                  | 1inch API key             | ✅       |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL      | ✅       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key    | ✅       |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service role key | ✅       |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **1inch Network**: For providing the Fusion+ cross-chain swap technology
- **Supabase**: For the excellent backend-as-a-service platform
- **Framer Motion**: For the smooth animation library
- **Tailwind CSS**: For the utility-first CSS framework

## 📞 Support

For support, email support@emojiswap.com or join our Discord community.

---

**Made with ❤️ by the EmojiSwap Team**

_Cross-chain swaps made by emojis, powered by 1inch_
