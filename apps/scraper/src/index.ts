import { connectDB, disconnectDB, Apartment } from '@hatahelper/db';
import { parseListingPage } from './parser.js';

const TARGET_URL = 'https://realt.by/sale/flats/';

async function runScraper() {
  console.log('🚀 Запуск скрапера (Продажа квартир)...');
  
  await connectDB();

  console.log(`📡 Скачиваем страницу: ${TARGET_URL}`);
  const parsedItems = await parseListingPage(TARGET_URL);

  console.log(`🔍 Распарсено карточек: ${parsedItems.length}`);

  let savedCount = 0;

    for (const item of parsedItems) {
        try {
            // 1. Ищем, есть ли уже такая квартира в нашей БД
            const existingApartment = await Apartment.findOne({ realtId: item.realtId });

            if (existingApartment) {
            // Если цена изменилась — добавляем старую цену в историю!
            if (existingApartment.priceUsd !== item.priceUsd) {
                console.log(
                `📉 Изменение цены на ${item.address}: $${existingApartment.priceUsd} -> $${item.priceUsd}`
                );

                await Apartment.updateOne(
                { realtId: item.realtId },
                {
                    $set: item,
                    $push: {
                    priceHistory: {
                        priceUsd: existingApartment.priceUsd,
                        date: existingApartment.updatedAt,
                    },
                    },
                }
                );
                
                // ТУТ В БУДУЩЕМ БУДЕТ ОТПРАВКА УВЕДОМЛЕНИЯ В TELEGRAM!
            } else {
                // Если цена не менялась, просто обновляем поля
                await Apartment.updateOne({ realtId: item.realtId }, { $set: item });
            }
            } else {
            // Новая квартира — просто сохраняем
            await Apartment.create(item);
            }
            savedCount++;
        } catch (err) {
            console.error(`Ошибка сохранения ${item.realtId}:`, err);
        }
    }

  console.log(`✅ Успешно сохранено/обновлено в БД: ${savedCount} шт.`);

  await disconnectDB();
  console.log('Завершение работы.');
}

runScraper().catch((err) => {
  console.error('Критическая ошибка скрапера:', err);
  process.exit(1);
});