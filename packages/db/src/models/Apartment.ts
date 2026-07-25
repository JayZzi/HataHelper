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

    // Локация
    address: { type: String, required: true },
    district: { type: String },
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