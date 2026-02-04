export enum Marketplace {
  SHOPEE = 'Shopee',
  TIKTOK = 'TikTok Shop',
  LAZADA = 'Lazada',
  TOKOPEDIA = 'Tokopedia',
  OTHER = 'Lainnya'
}

export enum CalculationMode {
  PRICING = 'pricing',
  ROAS = 'roas',
  ANALYSIS = 'analysis',
  CREATOR = 'creator'
}

export interface PricingResult {
  sellingPrice: number;
  totalFees: number;
  netProfit: number;
  feeBreakdown: {
    admin: number;
    transaction: number;
    shipping: number;
    marketing: number; // Store discount gap
    affiliate: number;
    voucher: number;
    bundle: number;
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
}