import { Schema, model, models, Document } from 'mongoose';
import { Apartment as ApartmentType } from '@hatahelper/types';

// Расширяем Mongoose Document базовым типом
export interface IApartmentDocument extends ApartmentType, Document {}

const ApartmentSchema = new Schema<IApartmentDocument>(
  {
    realtId: { type: String, required: true, unique: true, index: true },
    url: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },

    // Цены
    priceUsd: { type: Number, required: true, index: true },
    priceByn: { type: Number },
    pricePerM2Usd: { type: Number },

    // История и изменение цен (ДОБАВЛЯЕМ СЮДА ВНУТРЬ)
    priceChangeDirection: { type: Number },
    priceChangeDate: { type: Date },
    priceHistory: [
      {
        priceUsd: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],

    // Локация
    address: { type: String, required: true },
    district: { type: String, index: true },
    subdistrict: { type: String, index: true },
    metro: { type: String },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number] },
    },

    // Параметры
    rooms: { type: Number, index: true },
    areaTotal: { type: Number },
    areaLiving: { type: Number },
    areaKitchen: { type: Number },
    floor: { type: Number },
    floorsTotal: { type: Number },
    buildingYear: { type: Number },

    // Медиа и Контакты
    images: { type: [String], default: [] },
    contactPhones: { type: [String], default: [] },
    agencyName: { type: String },

    repairState: { type: Number, index: true },

    // Даты
    sourceCreatedAt: { type: Date },
    sourceUpdatedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

ApartmentSchema.index({ location: '2dsphere' });

export const Apartment =
  models.Apartment || model<IApartmentDocument>('Apartment', ApartmentSchema);