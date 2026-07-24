import { connectDB, disconnectDB, Apartment } from '@hatahelper/db';
import { parseListingPage } from './parser.js';

// Страница с долгосрочной арендой квартир в Минске
const TARGET_URL = 'https://realt.by/rent/flat-for-long/';

async function runScraper() {
  console.log('🚀 Запуск скрапера...');
  
  await connectDB();

  console.log(`📡 Скачиваем страницу: ${TARGET_URL}`);
  const parsedItems = await parseListingPage(TARGET_URL);

  console.log(`🔍 Найдено объявлений: ${parsedItems.length}`);

  let savedCount = 0;

  for (const item of parsedItems) {
    try {
      await Apartment.updateOne(
        { realtId: item.realtId },
        { $set: item },
        { upsert: true }
      );
      savedCount++;
    } catch (err) {
      console.error(`Ошибка сохранения объявления ${item.realtId}:`, err);
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