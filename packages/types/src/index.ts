export interface PriceHistoryItem {
  priceUsd: number;
  date: Date;
}

export interface Apartment {
  realtId: string;
  url: string;
  title: string;
  description?: string;

  // Цены
  priceUsd: number;
  priceByn?: number;
  pricePerM2Usd?: number;

  // Локация
  address: string;
  district?: string;
  metro?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };

  // Характеристики
  rooms?: number;
  areaTotal?: number;
  areaLiving?: number;
  areaKitchen?: number;
  floor?: number;
  floorsTotal?: number;
  buildingYear?: number;

  // Медиа и Контакты
  images: string[];
  contactPhones?: string[];
  agencyName?: string;

  // Даты
  sourceCreatedAt?: Date;
  sourceUpdatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  priceChangeDirection?: number; // -1 (упала), 1 (выросла), 0
  priceChangeDate?: Date;

  repairState?: number; // Код состояния ремонта (1, 2, 3...)

  // Наша собственная история цен
  priceHistory?: PriceHistoryItem[];
}