import { connectDB, disconnectDB, Apartment } from '@hatahelper/db';

async function main() {
  console.log('Connecting to database...');
  await connectDB();

  console.log('Creating test apartment entry...');

  // Используем updateOne с upsert: true,
  // чтобы при повторном запуске скрипта не было ошибки уникальности realtId
  const result = await Apartment.updateOne(
    { realtId: 'test-12345' },
    {
      $set: {
        url: 'https://realt.by/apartment/test-12345/',
        title: 'Тестовая 2-комнатная квартира',
        priceUsd: 500,
        priceByn: 1600,
        address: 'г. Минск, пр-т Независимости, 1',
        rooms: 2,
        areaTotal: 55.4,
        images: ['https://example.com/photo1.jpg'],
      },
    },
    { upsert: true }
  );

  console.log('Saved successfully!', result);

  // Получаем созданную запись из базы для проверки
  const savedApartment = await Apartment.findOne({ realtId: 'test-12345' });
  console.log('Retrieved from DB:', savedApartment);

  // Отключаемся от базы, чтобы скрипт завершил работу
  await disconnectDB();
  console.log('Disconnected from DB.');
}

main().catch((err) => {
  console.error('Error during test save:', err);
  process.exit(1);
});