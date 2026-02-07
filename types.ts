
export enum Marketplace {
  SHOPEE = 'Shopee',
  TIKTOK = 'TikTok Shop',
  LAZADA = 'Lazada',
  TOKOPEDIA = 'Tokopedia',
  OTHER = 'Lainnya'
}

export enum CalculationMode {
  DASHBOARD = 'dashboard', 
  PRICING = 'pricing',
  ROAS = 'roas',
  ANALYSIS = 'analysis',
  CREATOR = 'creator',
  JOURNAL = 'journal',
  TOPUP = 'topup'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  credits: number;
  isNewUser: boolean;
}

export interface PricingResult {
  sellingPrice: number; 
  displayPrice: number; 
  totalFees: number;
  netProfit: number;
  breakdown: {
    admin: number;
    transaction: number;
    program: number; 
    affiliate: number;
    marketing: number; 
    operational: number; 
    cogs: number; 
  };
}

export interface RoasResult {
  revenue: number;
  totalAdBudget: number;
  requiredRoas: number;
  profitBeforeAds: number;
  netProfitAfterAds: number;
}

export interface ProductListingResult {
  seoTitle: string;
  seoDescription: string;
  discountStrategy: string;
  suggestedDiscountPercentage: number;
  adsStrategy: {
    targetRoas: number;
    dailyBudgetRecommendation: number;
    audienceTargeting: string;
  };
  generatedImages: string[]; 
}

export interface FinancialInput {
  marketplace: Marketplace;
  revenue: number;
  adSpend: number; 
}

export interface FinancialReport {
  period: string;
  inputs: FinancialInput[];
  grossMarginPercent: number; 
  employeeCost: number;
  operationalCost: number;
  totalRevenue: number;
  totalAdSpendRaw: number;
  totalAdTax: number; 
  totalAdSpendFinal: number;
  grossProfit: number; 
  finalNetProfit: number;
  burnRate: number; 
}

// --- Trending Interfaces ---
export interface TrendingProduct {
  name: string;
  category: string;
  status: string; // e.g. "Viral", "Naik Daun", "Stabil"
}

export interface MarketplaceTrend {
  platform: string;
  items: TrendingProduct[];
}

export interface DailyInsightResult {
  headline: string;
  strategy: string;
  marketMood: 'FIRE' | 'SLOW' | 'NORMAL';
  trendingCategories: string[];
  actionItem: string;
  marketplaceTrends: MarketplaceTrend[]; // New Field
  sources?: Array<{ title: string; uri: string }>;
}
