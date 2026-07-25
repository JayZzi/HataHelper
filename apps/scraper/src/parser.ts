import axios from 'axios';
import * as cheerio from 'cheerio';
import { Apartment } from '@hatahelper/types';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
};

/**
 * Рекурсивный поиск массива с объектами недвижимости внутри JSON (__NEXT_DATA__)
 */
function findObjectsInJson(obj: any): any[] | null {
  if (!obj || typeof obj !== 'object') return null;

  if (Array.isArray(obj)) {
    if (
      obj.length > 0 &&
      (obj[0]?.code || obj[0]?.id) &&
      (obj[0]?.address || obj[0]?.priceRates || obj[0]?.price)
    ) {
      return obj;
    }
    for (const item of obj) {
      const res = findObjectsInJson(item);
      if (res) return res;
    }
  } else {
    for (const key of Object.keys(obj)) {
      const res = findObjectsInJson(obj[key]);
      if (res) return res;
    }
  }

  return null;
}

export async function parseListingPage(pageUrl: string): Promise<Apartment[]> {
  try {
    const { data: html } = await axios.get(pageUrl, { headers: HEADERS });
    const $ = cheerio.load(html);

    const nextDataScript = $('#__NEXT_DATA__').html();

    if (!nextDataScript) {
      console.warn('⚠️ __NEXT_DATA__ не найден на странице');
      return [];
    }

    const parsedData = JSON.parse(nextDataScript);
    const rawObjects = findObjectsInJson(parsedData?.props?.pageProps);

    if (!rawObjects || rawObjects.length === 0) {
      console.warn('⚠️ Массив объявлений в __NEXT_DATA__ не найден');
      return [];
    }

    console.log(`✨ Распарсено ${rawObjects.length} объектов из JSON!`);

    return rawObjects.map((item: any): Apartment => {
      const realtId = String(item.code || item.id);

      // Валютные ставки (840 = USD, 933 = BYN)
      const priceUsd = Number(item.priceRates?.['840'] || 0);
      const priceByn = Number(item.priceRates?.['933'] || item.price || 0);
      const pricePerM2Usd = Number(item.priceRatesPerM2?.['840'] || item.pricePerM2 || 0);

      // Форматирование геоданных для MongoDB GeoJSON [lng, lat]
      const location =
        Array.isArray(item.location) && item.location.length === 2
          ? {
              type: 'Point' as const,
              coordinates: [item.location[0], item.location[1]] as [number, number],
            }
          : undefined;

      // TODO: В будущем район (district) и микрорайон/ЖК (subdistrict) 
      // будут точно определяться на бэкенде через Point-in-Polygon (Turf.js) 
      // по координатам location.coordinates.
      const district = item.townDistrictName || item.districtName || 'Минск';
      const subdistrict = undefined;

      return {
        realtId,
        url: `https://realt.by/sale-flats/object/${realtId}/`,
        title: String(item.title || `${item.rooms || ''}-комнатная квартира`),
        description: item.description || item.headline || undefined,

        // Цены и динамика
        priceUsd,
        priceByn,
        pricePerM2Usd,
        priceChangeDirection: item.priceChangeDirection ?? undefined,
        priceChangeDate: item.priceChangeDate ? new Date(item.priceChangeDate) : undefined,

        // Локация
        address: String(item.address || 'Минск'),
        district,
        subdistrict,
        metro: item.metroStationName || undefined,
        location,

        // Характеристики
        rooms: item.rooms ? Number(item.rooms) : undefined,
        areaTotal: item.areaTotal ? Number(item.areaTotal) : undefined,
        areaLiving: item.areaLiving ? Number(item.areaLiving) : undefined,
        areaKitchen: item.areaKitchen ? Number(item.areaKitchen) : undefined,
        floor: item.storey ? Number(item.storey) : undefined,
        floorsTotal: item.storeys ? Number(item.storeys) : undefined,
        buildingYear: item.buildingYear ? Number(item.buildingYear) : undefined,
        repairState: item.repairState ? Number(item.repairState) : undefined,

        // Медиа и Контакты
        images: Array.isArray(item.images) ? item.images : [],
        contactPhones: Array.isArray(item.contactPhones) ? item.contactPhones : [],
        agencyName: item.agencyName || undefined,

        // Даты
        sourceCreatedAt: item.createdAt ? new Date(item.createdAt) : undefined,
        sourceUpdatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
      };
    });
  } catch (error: any) {
    console.error(`Ошибка при парсинге страницы: ${error.message}`);
    return [];
  }
}