import axios from 'axios';
import * as cheerio from 'cheerio';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
};

export interface ParsedApartment {
  realtId: string;
  url: string;
  title: string;
  priceUsd: number;
  address: string;
  rooms?: number;
  images?: string[];
}

/**
 * Рекурсивный поиск массива с объектами недвижимости внутри JSON
 */
function findObjectsInJson(obj: any): any[] | null {
  if (!obj || typeof obj !== 'object') return null;

  if (Array.isArray(obj)) {
    if (
      obj.length > 0 &&
      (obj[0]?.id || obj[0]?.code) &&
      (obj[0]?.title || obj[0]?.address || obj[0]?.price)
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

export async function parseListingPage(pageUrl: string): Promise<ParsedApartment[]> {
  try {
    const { data: html } = await axios.get(pageUrl, { headers: HEADERS });
    const $ = cheerio.load(html);

    // 1. Пробуем извлечь объекты из __NEXT_DATA__
    const nextDataScript = $('#__NEXT_DATA__').html();

    if (nextDataScript) {
      try {
        const parsedData = JSON.parse(nextDataScript);
        const rawObjects = findObjectsInJson(parsedData?.props?.pageProps);

        if (rawObjects && rawObjects.length > 0) {
          console.log(`✨ Извлечено ${rawObjects.length} карточек из __NEXT_DATA__!`);
          return rawObjects.map((item: any): ParsedApartment => {
            const id = String(item.id || item.code);
            return {
              realtId: id,
              url: `https://realt.by/rent-flat-for-long/object/${id}/`,
              title: String(item.title || item.header || `${item.rooms || ''}-комнатная квартира`),
              priceUsd: Number(item.priceUsd || item.price?.usd || item.price || 0),
              address: String(item.address || item.location?.address || 'Минск'),
              rooms: item.rooms ? Number(item.rooms) : undefined,
              images: Array.isArray(item.images) ? item.images : item.image ? [item.image] : [],
            };
          });
        }
      } catch (err) {
        console.warn('Не удалось распарсить __NEXT_DATA__ JSON:', err);
      }
    }

    // 2. Продвинутый HTML-парсер (если в NEXT_DATA стейта не оказалось)
    console.log('🌐 Парсим HTML-карточки напрямую из DOM...');
    const apartments: ParsedApartment[] = [];

    // Ищем ссылки на объекты
    $('a[href*="/object/"]').each((_, el) => {
      const $a = $(el);
      const href = $a.attr('href');
      if (!href) return;

      const idMatch = href.match(/\/object\/(\d+)/);
      if (!idMatch || !idMatch[1]) return;

      const realtId = idMatch[1];
      if (apartments.some((item) => item.realtId === realtId)) return;

      // Находим ближайший родительский контейнер карточки
      const $card = $a.closest('div[class*="card"], article, div[class*="item"]');

      // Парсим текст карточки
      const cardText = $card.text() || '';
      const title = $card.find('h3, [class*="title"]').first().text().trim() || $a.text().trim() || 'Квартира';

      // Вытаскиваем цену ($ или USD)
      const priceMatch = cardText.match(/([\d\s]+)\s*(?:\$|USD)/i);
      const priceUsd = priceMatch ? Number.parseInt(priceMatch[1].replace(/\s+/g, ''), 10) : 0;

      // Вытаскиваем адрес
      const address = $card.find('[class*="address"]').first().text().trim() || 'Минск';

      // Вытаскиваем картинку
      const imgUrl = $card.find('img').first().attr('src') || '';

      // Количество комнат из заголовка
      const roomsMatch = title.match(/(\d+)-комн/i);
      const rooms = roomsMatch ? Number.parseInt(roomsMatch[1], 10) : undefined;

      apartments.push({
        realtId,
        url: href.startsWith('http') ? href : `https://realt.by${href}`,
        title,
        priceUsd,
        address,
        rooms,
        images: imgUrl ? [imgUrl] : [],
      });
    });

    return apartments;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.error('🚫 403 Forbidden: Доступ заблокирован антиботом');
    } else {
      console.error(`Ошибка при парсинге страницы: ${error.message}`);
    }
    return [];
  }
}