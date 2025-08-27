import Link from "next/link";
import { Header } from "@/components/header";
import { ETFQuoteCard } from "@/components/etf-quote-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, PieChart, Search } from "lucide-react";

// Mock data for demonstration
const featuredETFs = [
  {
    symbol: "SPY",
    name: "SPDR S&P 500 ETF Trust",
    price: 445.67,
    change: 2.34,
    changePercent: 0.53,
    volume: 45234567,
    marketCap: 415000000000,
  },
  {
    symbol: "QQQ",
    name: "Invesco QQQ Trust",
    price: 389.12,
    change: -1.45,
    changePercent: -0.37,
    volume: 32145678,
    marketCap: 185000000000,
  },
  {
    symbol: "VTI",
    name: "Vanguard Total Stock Market ETF",
    price: 267.89,
    change: 1.23,
    changePercent: 0.46,
    volume: 28456789,
    marketCap: 325000000000,
  },
];

const marketStats = [
  { label: "Total ETFs Tracked", value: "2,847", change: "+12" },
  { label: "Total AUM", value: "$8.2T", change: "+2.3%" },
  { label: "Avg. Expense Ratio", value: "0.18%", change: "-0.02%" },
  { label: "Active ETFs", value: "1,234", change: "+45" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Professional ETF Analytics Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Track, analyze, and compare ETFs with real-time data, comprehensive holdings analysis, 
            and institutional-grade research tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Start Exploring ETFs
            </Button>
            <Button variant="outline" size="lg">
              View Market Overview
            </Button>
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {marketStats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mb-2">{stat.label}</div>
                <Badge 
                  variant={stat.change.startsWith('+') ? 'success' : 'secondary'}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured ETFs */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured ETFs</h2>
            <Button variant="outline">View All ETFs</Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featuredETFs.map((etf) => (
              <Link key={etf.symbol} href={`/etf/${etf.symbol}`} className="block transition-transform hover:scale-[1.02]">
                <ETFQuoteCard
                  symbol={etf.symbol}
                  name={etf.name}
                  price={etf.price}
                  change={etf.change}
                  changePercent={etf.changePercent}
                  volume={etf.volume}
                  marketCap={etf.marketCap}
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center p-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <CardTitle className="mb-2">Real-Time Data</CardTitle>
            <p className="text-gray-600">
              Get live quotes, price movements, and market data from multiple providers 
              with sub-second latency.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="mb-2">Advanced Analytics</CardTitle>
            <p className="text-gray-600">
              Comprehensive performance metrics, risk analysis, and correlation studies 
              to make informed investment decisions.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <PieChart className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <CardTitle className="mb-2">Holdings Analysis</CardTitle>
            <p className="text-gray-600">
              Deep dive into ETF compositions with sector allocation, geographic exposure, 
              and top holdings breakdown.
            </p>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white text-center p-8">
          <CardTitle className="text-3xl mb-4 text-white">
            Ready to Start Your ETF Analysis?
          </CardTitle>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Join thousands of investors who rely on our platform for comprehensive 
            ETF research and portfolio optimization.
          </p>
          <Button size="lg" variant="secondary">
            Get Started Free
          </Button>
        </Card>
      </main>
    </div>
  );
}