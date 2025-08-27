# ETF Dashboard 📈

A modern, responsive ETF (Exchange-Traded Fund) dashboard built with **Next.js 15**, **TypeScript**, and **TailwindCSS**. Features real-time data integration, interactive charts, and comprehensive ETF analytics.

![ETF Dashboard](https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=600&fit=crop&crop=entropy&auto=format&q=80)

## ✨ Features

### 🎯 Core Functionality
- **Real-time ETF Data**: Live prices, changes, volume, and market metrics
- **Interactive Charts**: Price history, sector allocation, and performance analytics
- **ETF Search**: Quick search and discovery of ETFs
- **Watchlist Management**: Track your favorite ETFs
- **ETF Comparison**: Side-by-side comparison of multiple ETFs
- **Holdings Analysis**: Detailed breakdown of ETF holdings
- **Sector Visualization**: Interactive sector allocation charts

### 🎨 Design & UX
- **Modern UI**: Clean, professional interface inspired by Trade Republic
- **Fully Responsive**: Mobile-first design that works on all devices
- **Dark/Light Mode**: Automatic theme switching based on system preferences
- **Smooth Animations**: Subtle transitions and micro-interactions
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation support

### 🚀 Technical Features
- **Next.js 15**: Latest features including App Router and Server Components
- **TypeScript**: Full type safety throughout the application
- **TailwindCSS**: Utility-first CSS framework for rapid development
- **Real-time Updates**: Live data refresh with optimistic updates
- **Error Boundaries**: Graceful error handling and recovery
- **Performance Optimized**: Code splitting, lazy loading, and caching

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm
- API keys from supported providers (optional for demo)

### Installation

```bash
# Clone the repository
git clone https://github.com/ruisoho/etf-dashboard.git
cd etf-dashboard

# Install dependencies
npm install
# or
yarn install
# or
pnpm install

# Copy environment variables
cp .env.local.example .env.local

# Start the development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## ⚙️ Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Keys (Optional - app works with mock data)
POLYGON_API_KEY=your_polygon_api_key
EODHD_API_KEY=your_eodhd_api_key
FMP_API_KEY=your_fmp_api_key
FINNHUB_API_KEY=your_finnhub_api_key

# Development Settings
NODE_TLS_REJECT_UNAUTHORIZED=0
NEXT_PUBLIC_APP_ENV=development
```

### API Providers

The application supports multiple financial data providers:

1. **Polygon.io** (Recommended)
   - Sign up at [polygon.io](https://polygon.io)
   - Free tier: 5 API calls/minute
   - Paid plans available for higher limits

2. **EODHD**
   - Sign up at [eodhd.com](https://eodhd.com)
   - Free tier available

3. **Financial Modeling Prep**
   - Sign up at [financialmodelingprep.com](https://financialmodelingprep.com)
   - Free tier: 250 requests/day

4. **Finnhub**
   - Sign up at [finnhub.io](https://finnhub.io)
   - Free tier: 60 calls/minute

> **Note**: The application works without API keys using comprehensive mock data for demonstration purposes.

## 📁 Project Structure

```
etf-dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── etf/           # ETF data endpoints
│   │   │   ├── search/        # Search functionality
│   │   │   └── types.ts       # API type definitions
│   │   ├── etf/[symbol]/      # Dynamic ETF pages
│   │   ├── compare/           # ETF comparison page
│   │   ├── markets/           # Markets overview
│   │   ├── watchlist/         # Watchlist management
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── chart.tsx
│   │   │   └── ...
│   │   ├── etf-quote-card.tsx
│   │   ├── performance-chart.tsx
│   │   ├── sector-chart.tsx
│   │   └── ...
│   └── lib/                   # Utilities and configurations
│       ├── api/              # API integration
│       ├── types/            # TypeScript definitions
│       └── utils.ts          # Helper functions
├── public/                    # Static assets
├── .env.local.example        # Environment variables template
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── next.config.js           # Next.js configuration
└── package.json             # Dependencies and scripts
```

## 🔌 API Integration

### Supported ETFs

The application includes comprehensive mock data for popular ETFs:

- **SPY** - SPDR S&P 500 ETF Trust
- **QQQ** - Invesco QQQ Trust
- **VTI** - Vanguard Total Stock Market ETF
- **FTWG** - First Trust Tactical High Yield ETF
- And many more...

### Data Sources

The application uses a robust provider system with automatic fallbacks:

1. **Primary**: Real-time data from configured API providers
2. **Fallback**: Comprehensive mock data for demonstration
3. **Caching**: Intelligent caching to reduce API calls
4. **Error Handling**: Graceful degradation when APIs are unavailable

### API Endpoints

- `GET /api/etf/[symbol]` - Get ETF details
- `GET /api/search?q=[query]` - Search ETFs
- `GET /api/quote/[symbol]` - Get real-time quote
- `GET /api/price/[symbol]` - Get price history

## 🎨 Design System

### Color Palette

Inspired by modern fintech applications:

```css
/* Primary Colors */
--primary-50: #f0f9ff;
--primary-500: #0ea5e9;
--primary-900: #0c4a6e;

/* Success/Positive */
--green-500: #22c55e;
--green-600: #16a34a;

/* Error/Negative */
--red-500: #ef4444;
--red-600: #dc2626;

/* Neutral */
--gray-50: #f8fafc;
--gray-500: #64748b;
--gray-900: #0f172a;
```

### Typography

- **Primary Font**: Inter (system fallback)
- **Headings**: Font weights 600-700
- **Body**: Font weight 400-500
- **Code**: Monospace system fonts

### Components

All components follow consistent design patterns:

- **Cards**: Rounded corners, subtle shadows, hover effects
- **Buttons**: Multiple variants (primary, secondary, outline)
- **Charts**: Interactive with smooth animations
- **Tables**: Sortable, filterable, responsive

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ruisoho/etf-dashboard)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Other Platforms

```bash
# Build for production
npm run build

# Start production server
npm run start
```

The application can be deployed to:
- **Netlify**
- **Railway**
- **DigitalOcean App Platform**
- **AWS Amplify**
- **Docker** (Dockerfile included)

## 🔒 Security

- **API Keys**: Stored securely in environment variables
- **CORS**: Configured for production domains
- **Rate Limiting**: Built-in API rate limiting
- **Input Validation**: All user inputs are validated
- **XSS Protection**: React's built-in XSS protection
- **HTTPS**: Enforced in production

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Open a Pull Request

### Code Style

- **ESLint**: Configured with Next.js recommended rules
- **Prettier**: Automatic code formatting
- **TypeScript**: Strict mode enabled
- **Husky**: Pre-commit hooks for quality checks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Vercel** - For hosting and deployment
- **TailwindCSS** - For the utility-first CSS framework
- **Recharts** - For beautiful chart components
- **Lucide React** - For consistent icons
- **Financial Data Providers** - For real-time market data

## 📞 Support

If you have any questions or need help:

- 📧 Email: support@etf-dashboard.com
- 💬 Discord: [Join our community](https://discord.gg/etf-dashboard)
- 🐛 Issues: [GitHub Issues](https://github.com/ruisoho/etf-dashboard/issues)
- 📖 Documentation: [Full Documentation](https://docs.etf-dashboard.com)

---

**Built with ❤️ by the ETF Dashboard team**

*Empowering investors with real-time ETF analytics and insights.*