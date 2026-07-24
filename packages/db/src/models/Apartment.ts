import { Schema, model, models, Document } from 'mongoose';

export interface IApartment extends Document {
  realtId: string;           // Уникальный ID объявления на realt.by
  url: string;               // Ссылка на объявление
  title: string;             // Заголовок ("2-к квартира...")
  priceUsd: number;          // Цена в $
  priceByn?: number;         // Цена в BYN
  address: string;           // Улица, дом
  district?: string;         // Район (например, "Первомайский")
  metro?: string;            // Станция метро
  rooms?: number;            // Кол-во комнат
  areaTotal?: number;        // Общая площадь
  areaLiving?: number;       // Жилая площадь
  areaKitchen?: number;      // Площадь кухни
  floor?: number;            // Этаж
  floorsTotal?: number;      // Всего этажей
  images: string[];          // Ссылки на фото
  sourceCreatedAt?: Date;    // Дата публикации на источнике
  createdAt: Date;
  updatedAt: Date;
}

const ApartmentSchema = new Schema<IApartment>(
  {
    realtId: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    title: { type: String, required: true },
    priceUsd: { type: Number, required: true, index: true },
    priceByn: { type: Number },
    address: { type: String, required: true },
    district: { type: String },
    metro: { type: String },
    rooms: { type: Number, index: true },
    areaTotal: { type: Number },
    areaLiving: { type: Number },
    areaKitchen: { type: Number },
    floor: { type: Number },
    floorsTotal: { type: Number },
    images: { type: [String], default: [] },
    sourceCreatedAt: { type: Date },
  },
  {
    timestamps: true, // Автоматически создаёт createdAt и updatedAt
  }
);

// Защита от переопределения модели при Hot Reload в Next.js
export const Apartment =
  models.Apartment || model<IApartment>('Apartment', ApartmentSchema);