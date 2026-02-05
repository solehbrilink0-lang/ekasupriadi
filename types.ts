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
  sellingPrice: number; // Harga yang dibayar pembeli
  displayPrice: number; // Harga coret (sebelum diskon display)
  totalFees: number;
  netProfit: number;
  breakdown: {
    admin: number;
    transaction: number;
    program: number; // New: Gratis Ongkir Xtra + Cashback Xtra
    affiliate: number;
    marketing: number; // Voucher + Bundle
    operational: number; // Packing + Other
    cogs: number; // Modal
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