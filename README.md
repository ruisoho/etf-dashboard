# 📈 ETF Dashboard

A modern, responsive ETF (Exchange-Traded Fund) dashboard built with **Next.js 15**, featuring real-time data from multiple API providers, interactive charts, and comprehensive ETF analytics.

![ETF Dashboard](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)

## ✨ Features

### 📊 **Real-Time ETF Data**
- Live price updates and market data
- Multiple API provider integration (Polygon.io, EODHD, Financial Modeling Prep, Finnhub)
- Intelligent fallback system for data reliability
- Support for 500+ ETFs with comprehensive coverage

### 📈 **Interactive Charts & Analytics**
- **Performance Charts**: Historical price movements with interactive tooltips
- **Sector Allocation**: Visual breakdown of ETF holdings by sector
- **Holdings Analysis**: Top 10 holdings with real-time price changes
- **Price History**: 30-day price trends with technical indicators

### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Dark/Light Mode**: Automatic theme detection and manual toggle
- **Smooth Animations**: Framer Motion powered transitions
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation

### 🔍 **Smart Search & Discovery**
- Real-time ETF search with autocomplete
- Popular ETF recommendations
- Category-based filtering (Technology, Healthcare, Energy, etc.)
- Recently viewed ETFs tracking

### 🛡️ **Robust Architecture**
- **Error Handling**: Comprehensive error boundaries and fallback UI
- **Data Validation**: Input sanitization and type safety
- **Performance**: Optimized rendering with React 18 features
- **SEO Optimized**: Meta tags, structured data, and sitemap generation

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.17 or later
- **pnpm** (recommended) or npm
- API keys from at least one supported provider

### Installation

```bash
# Clone the repository
git clone https://github.com/ruisoho/etf-dashboard.git
cd etf-dashboard

# Install dependencies
pnpm install

# Copy environment variables
cp .env.local.example .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Keys (at least one required)
POLYGON_API_KEY=your_polygon_api_key
EODHD_API_KEY=your_eodhd_api_key
FMP_API_KEY=your_fmp_api_key
FINNHUB_API_KEY=your_finnhub_api_key

# Optional: Development settings
NODE_TLS_REJECT_UNAUTHORIZED=0  # For development only
NEXT_PUBLIC_APP_ENV=development
```

### API Provider Setup

#### 1. **Polygon.io** (Recommended)
- Sign up at [polygon.io](https://polygon.io)
- Free tier: 5 API calls/minute
- Paid plans start at $29/month
- Best for: Real-time quotes, historical data

#### 2. **EODHD**
- Sign up at [eodhd.com](https://eodhd.com)
- Free tier: 20 API calls/day
- Paid plans start at $19.99/month
- Best for: End-of-day data, fundamentals

#### 3. **Financial Modeling Prep**
- Sign up at [financialmodelingprep.com](https://financialmodelingprep.com)
- Free tier: 250 API calls/day
- Paid plans start at $15/month
- Best for: Company profiles, financial statements

#### 4. **Finnhub**
- Sign up at [finnhub.io](https://finnhub.io)
- Free tier: 60 API calls/minute
- Paid plans start at $7.99/month
- Best for: Real-time data, news, earnings

## 🏗️ Project Structure

```
etf-dashboard/
├── src/
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── api/               # API routes
│   │   │   ├── etf/          # ETF data endpoints
│   │   │   ├── search/       # Search functionality
│   │   │   └── holdings/     # Holdings data
│   │   ├── etf/              # ETF detail pages
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Homepage
│   ├── components/            # Reusable UI components
│   │   ├── charts/           # Chart components
│   │   ├── ui/               # Base UI components
│   │   └── layout/           # Layout components
│   └── lib/                   # Utilities and configurations
│       ├── api/              # API client and providers
│       ├── utils.ts          # Helper functions
│       └── types.ts          # TypeScript definitions
├── public/                    # Static assets
├── .env.local                # Environment variables
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## 🔌 API Integration

### Provider Factory Pattern

The application uses a provider factory pattern to manage multiple API sources:

```typescript
// lib/api/provider-factory.ts
export class ProviderFactory {
  private providers: APIProvider[] = [];
  
  async getQuote(symbol: string): Promise<QuoteData> {
    // Try each provider until successful
    for (const provider of this.providers) {
      try {
        const result = await provider.getQuote(symbol);
        if (result.success) return result;
      } catch (error) {
        console.warn(`Provider ${provider.name} failed:`, error);
      }
    }
    throw new Error('All providers failed');
  }
}
```

### Intelligent Fallback System

When live API data is incomplete or unavailable, the system automatically falls back to comprehensive mock data:

```typescript
// Detect incomplete data
const isIncompleteData = !quote.price || quote.price === 0 || 
                        (holdings.length === 0 && sectors.length === 0);

if (isIncompleteData && mockData[symbol]) {
  return mockData[symbol]; // Use high-quality mock data
}
```

## 📊 Supported ETFs

### Popular ETFs with Full Support
- **SPY** - SPDR S&P 500 ETF Trust
- **QQQ** - Invesco QQQ Trust
- **VTI** - Vanguard Total Stock Market ETF
- **FTWG** - First Trust Dow Jones Internet Index Fund
- **IWM** - iShares Russell 2000 ETF
- **EFA** - iShares MSCI EAFE ETF
- **GLD** - SPDR Gold Shares
- **TLT** - iShares 20+ Year Treasury Bond ETF

### Data Coverage
- ✅ Real-time quotes and price changes
- ✅ Top 10 holdings with weights
- ✅ Sector allocation breakdown
- ✅ Performance metrics (1D, 1W, 1M, 3M, 6M, 1Y, 3Y, 5Y)
- ✅ 30-day price history
- ✅ Fund metadata (expense ratio, AUM, inception date)

## 🎨 Design System

### Color Palette
```css
:root {
  --primary: #2563eb;      /* Blue 600 */
  --secondary: #64748b;    /* Slate 500 */
  --success: #059669;      /* Emerald 600 */
  --danger: #dc2626;       /* Red 600 */
  --warning: #d97706;      /* Amber 600 */
  --background: #ffffff;   /* White */
  --surface: #f8fafc;      /* Slate 50 */
  --text: #0f172a;         /* Slate 900 */
}
```

### Typography
- **Primary Font**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono
- **Scale**: Tailwind CSS default scale (text-sm to text-6xl)

### Components
- **Buttons**: Multiple variants (primary, secondary, outline, ghost)
- **Cards**: Elevated surfaces with subtle shadows
- **Charts**: Custom SVG components with smooth animations
- **Forms**: Accessible inputs with validation states

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run integration tests
pnpm test:integration

# Run E2E tests
pnpm test:e2e

# Generate coverage report
pnpm test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker

```bash
# Build Docker image
docker build -t etf-dashboard .

# Run container
docker run -p 3000:3000 etf-dashboard
```

### Manual Deployment

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 🔒 Security

- **API Key Protection**: Environment variables never exposed to client
- **Input Validation**: All user inputs sanitized and validated
- **HTTPS Only**: Secure connections enforced in production
- **Rate Limiting**: Built-in protection against API abuse
- **Error Handling**: Sensitive information never leaked in error messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use Prettier for code formatting
- Write tests for new features
- Update documentation for API changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **API Providers** - Polygon.io, EODHD, Financial Modeling Prep, Finnhub
- **Vercel** - For seamless deployment platform
- **Community** - For feedback and contributions

## 📞 Support

- **Documentation**: [GitHub Wiki](https://github.com/ruisoho/etf-dashboard/wiki)
- **Issues**: [GitHub Issues](https://github.com/ruisoho/etf-dashboard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ruisoho/etf-dashboard/discussions)

---

**Built with ❤️ by [ruisoho](https://github.com/ruisoho)**

*Last updated: August 2025*
