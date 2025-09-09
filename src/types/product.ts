export interface SkuData {
  size: string;
  sku: string;
  gtin: string;
}

export interface Product {
  id: string;
  isOnSale: boolean;
  catalogId: string;
  isNikeByYou: boolean;
  brand: string;
  category: string;
  cloudProductId: string;
  color: string;
  country: string;
  currentPrice: number;
  fullPrice: number;
  genders: string[];
  name: string;
  prodigyId: string;
  imageUrl: string;
  skuData: SkuData[];
  subCategory: string[];
}
