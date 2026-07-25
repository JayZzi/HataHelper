Пробы в парсере для хаты
-----
Бизнес цели
1)Фоновый скрипт который булет собирать новые обьявления на реалте(возможно потом расширить онлайнером) в свою бд
2)Продвинутая фильтрация и тегирование(фильтры как удобно, выделение "бабушатника" и "норм ремонт", можно попробовать по словам или с помощью АИ), сортировка по райном(интеграция с гугл картами). Добавление избранного
3)Добавление аналитики по изменению цен по районно и все такое.
4)Телеграмм бот который пушит сообщения с топ обьявами сразу(говорят хорошие забирают за часы)
-----
Технологии
Попробовать развернуть репу с Turborepo или Nx. Можно общие типы и компоненты держать которые будут юзаться и на мобилке и на вебе сразу
Radix UI + Tailwind CSS - Компоненты на радикс
Next.js + React
Докер - Для подьема базы и всего такого в изолированной среде + парсинг сайтов вроде капризная вещь(нужен Headless Chrome (через Playwright или Puppeteer)) + фикс проблем с развертыванием на компе и ноуте + мб когда-нибудь сервак
Мобилка на реакт натив + поверх поверх фреймворк EXPo(позволяет запускать проект на телефоне через куар)
Монго дб  + Mongo Express(с этой штукой можно прямо в браузере смотреть какие данные лежат в бд)
---------
Структура
HataHelper/
├── apps/
│   ├── web/                # Next.js приложение (веб-версия)
│   ├── mobile/             # React Native / Expo приложение
│   └── scraper/                # Бэкенд (Node.js / NestJS / Express + парсер)
├── packages/
│   ├── db/                     # <--- ВСЯ ЛОГИКА БД ЗДЕСЬ
│   │   ├── src/
│   │   │   ├── client.ts       # Настройка и подключение к MongoDB
│   │   │   ├── models/         # Схемы (Apartment.ts, User.ts)
│   │   │   └── index.ts        # Экспорт моделей наружу
│   │   └── package.json
│   ├── ui/                 # Общие UI-компоненты (кнопки, карточки квартир)
│   ├── typescript-config/  # Общие tsconfig
│   └── types/              # Общие TypeScript интерфейсы (модели квартиры, фильтров)
├── package.json
├── pnpm-workspace.yaml     # Если используется pnpm
└── turbo.json              # Если используется Turborepo
├── docker-compose.yml      # Поднимает Postgres, Redis и при желании бэкенд
└── Dockerfile.api          # Инструкция, как упаковать ваш бэкенд/парсер
---------
Порядок тасок
-Разворот
1)Инициализация монорепозитория: Используйте Turborepo или pnpm workspaces. +
2)Развернуть Докер с монгоДБ +
3)Развернуть мангус для обращения к дб и сделать тестовое обращение к бд+
4)Развернуть тсконфиги +
5)Развернуть сохранение в тайпс типов с которыми работать буду +
6)В api (наверное переназовем на scraper) написать на ноде скрипт парсера
-Правки дефолт значений
)Проверить версии либ и инструментов, все пекеджи + прошерстить файл турбо + создать енв файл, настроить его шаринг и вынести пароли(монго в докере например) в него
)Поправить ТсКонфиги + структуру ДБ
-БД и инфра
1)Создать docker-compose.yml в корне репозитория. +
2)Добавить туда образ MongoDB и  Mongo express +
3)Запустите базу командой docker compose up -d. Теперь у вас на компьютере крутится готова к работе база данных. +
-Сердце парсера
1)Настраиваем скраппер (можно использовать библиотеки Playwright или Cheerio + Axios, если сайт не блокирует запросы)
2)Пишем минмум и проверяем
    На реалте по базовой ссылке (например, "1-2 комнатные, Минск").
    Собираем первые 10-20 объявлений (максимально кол-в свойств).
    Привести к типу Apartment или типо того.
    Сохранить их в MongoDB (используя библиотеку Mongoose или Prisma).Мангус или призма(мангус приоритет) делают шему, валидашки, типизацию и всякое такое говно, иначе в монге можно ложить что угодно + удобное апи запросов.
-Фронт
0)Разворачивает некст джс
1)Разворачиваем стили тайлвинда и пишем пару компонентов
2)Дописываем сервер чтоб он с базы получал данные
3)Фильтры карта и тп
-Телега
1)Оповещалки в телеге
-Докер
логин и пароль от монго экспресс - admin pass
docker compose up -d - запустить бд. Флаг д - это режим детач, чтобы терминал остался свободным. С чертежа создать контейнер, также перезапускать с ним удобнее так как он подтянет новые настройке и обновит только нужну.ю часть, заменяет по большей части старт
docker compose stop - остановить бд
docker compose start - запустить
docker ps - список запущенны контейнеров
--Пнпм
pnpm --filter scraper add tsx -D - это находясь в корне монорепа установит только в скраппере нужную либу
pnpm --filter scraper dev - запуск конкретной команды из аппки
--------
================ ПОЛНЫЙ СЫРОЙ ОБЪЕКТ ===================
{
  companyName: null,
  companyUuid: null,
  uuid: '09d107d0-7c83-11f1-8820-15c0e8230b3c',
  title: 'Продается квартира по пр-ту Мира в ЖК "Минск Мир"!',
  description: 'Квартира по площади формата двухкомнатнойВ квартире выполнен качественный ремонт: входная металлическая дверь, современные межкомнатные двери, встроенная кухня с бытовой техникой (индукционная панель Electrolux, встроенная микроволновая печь Samsung), гардеробная с системой хранения, на полу - ламинат, натяжные потолки, на стенах - декоративная штукатурка и обои, в сан узле-встроенная мебель, столешница из компакт плитыКвартира не угловая, теплая и уютная. Прекрасный панорамный вид на восток и башни МФЦ.  Во дворе детский садик, детская и взрослая поликлиники, множество магазинов, кофеен, отделений банков, через дорогу - современная школа с бассейном. Идеальный вариант для инвестиций или проживания! До ст м Аэродромная и ТЦ Авиа Молл 7 мин пешком! Приходите на просмотр!',
  headline: 'Квартира по площади формата двухкомнатной В квартире выполнен качественный ремонт. Прекрасный панорамный вид на восток и башни МФЦ.',
  createdAt: '2026-07-10T20:16:07+03:00',
  updatedAt: '2026-07-22T13:26:02+03:00',
  metroTime: null,
  metroTimeType: null,
  price: 315000,
  priceCurrency: 933,
  pricePerM2: 7995,
  pricePerM2Max: 0,
  pricePerPerson: 0,
  priceMin: 0,
  priceMax: 0,
  priceChangeDirection: 1,
  priceChangeDate: '2026-07-22T12:57:16+03:00',
  storeys: 25,
  storey: 13,
  rooms: 1,
  contactPhones: [ '375255001717' ],
  images: [
    'https://cdn.realt.by/img/55/479f744a-7c81-11f1-afb1-0242ac120002',
    'https://cdn.realt.by/img/55/c5db486e-7c83-11f1-b2c8-0242ac120002',
    'https://cdn.realt.by/img/55/c5dde132-7c83-11f1-9d8b-0242ac120002',
    'https://cdn.realt.by/img/55/c5e30ce8-7c83-11f1-b15f-0242ac120002',
    'https://cdn.realt.by/img/55/c5e94e14-7c83-11f1-b021-0242ac120002',
    'https://cdn.realt.by/img/55/c5f6b838-7c83-11f1-bb79-0242ac120002',
    'https://cdn.realt.by/img/55/c5f1c85a-7c83-11f1-9e3a-0242ac120002',
    'https://cdn.realt.by/img/55/c607f6de-7c83-11f1-921b-0242ac120002',
    'https://cdn.realt.by/img/55/c60a3f20-7c83-11f1-9624-0242ac120002',
    'https://cdn.realt.by/img/55/c60b9e2e-7c83-11f1-bc1f-0242ac120002',
    'https://cdn.realt.by/img/55/c6097d88-7c83-11f1-a44d-0242ac120002',
    'https://cdn.realt.by/img/55/c6137fb8-7c83-11f1-b09f-0242ac120002',
    'https://cdn.realt.by/img/55/c618be7e-7c83-11f1-b05a-0242ac120002',
    'https://cdn.realt.by/img/55/c61c898c-7c83-11f1-8b1b-0242ac120002',
    'https://cdn.realt.by/img/55/c61b47d4-7c83-11f1-9c66-0242ac120002',
    'https://cdn.realt.by/img/55/c628803e-7c83-11f1-a11d-0242ac120002',
    'https://cdn.realt.by/img/55/c62cdc24-7c83-11f1-9768-0242ac120002',
    'https://cdn.realt.by/img/55/c62e47a8-7c83-11f1-a7fb-0242ac120002',
    'https://cdn.realt.by/img/55/c6304da0-7c83-11f1-a3a0-0242ac120002',
    'https://cdn.realt.by/img/55/c63204b0-7c83-11f1-ac02-0242ac120002',
    'https://cdn.realt.by/img/55/c6322058-7c83-11f1-be06-0242ac120002',
    'https://cdn.realt.by/img/55/c6363134-7c83-11f1-9661-0242ac120002',
    'https://cdn.realt.by/img/55/4de1461c-7c81-11f1-9895-0242ac120002'
  ],
  areaTotal: 39.4,
  areaLiving: 33,
  areaMax: null,
  areaMin: null,
  areaLand: null,
  objectType: null,
  code: 4177949,
  stateRegionName: 'Минская область',
  stateDistrictName: 'Минский',
  townType: 1,
  townName: 'Минск',
  streetUuid: '4c3d1b2b-7b00-11eb-8943-0cc47adabd66',
  streetName: 'Мира просп.',
  address: 'Минск Мира просп. 16',
  contactName: 'Ольга',
  contactEmail: 'bir@bir.by',
  agencyName: 'Бир Бай',
  metroStationName: 'Аэродромная (2024)',
  metroLineId: 3,
  houseNumber: 16,
  buildingNumber: null,
  paymentStatus: 4,
  comments: null,
  isFavorite: false,
  category: 5,
  has3dTour: false,
  hasVideo: false,
  stateRegionUuid: '499f06b8-7b00-11eb-8943-0cc47adabd66',
  numberOfBeds: null,
  directionName: null,
  townDistance: null,
  customSorting: 2000,
  specialComment: null,
  userUuid: '6ffb1556-d02f-11eb-b150-66d8107e7b98',
  agencyUuid: 'c10dd786-d272-11eb-b00f-dee111c4eff3',
  location: [ 27.5381, 53.8628 ],
  townUuid: '4cb07174-7b00-11eb-8943-0cc47adabd66',
  buildingYear: 2021,
  levels: null,
  roofMaterial: null,
  wallMaterial: null,
  heating: null,
  infrastructure: null,
  balconyType: 27,
  houseType: null,
  furniture: 0,
  areaKitchen: null,
  appliances: null,
  objectCategory: null,
  realEstateDevUuid: null,
  availableYear: null,
  availableQuarter: null,
  availableAlready: null,
  availableText: null,
  isSellingCompleted: null,
  communicationMethod: 2,
  interactiveCatalogToken: null,
  interactiveCatalogBaseToken: null,
  isObjectInRealtyDeal: false,
  repairState: 2,
  __typename: 'ObjectData',
  priceRates: {
    '112': 3150000000,
    '643': 8547240,
    '840': 109174,
    '933': 315000,
    '978': 95663
  },
  priceRatesPerM2: {
    '112': 79950000,
    '643': 216937,
    '840': 2771,
    '933': 7995,
    '978': 2428
  },
  priceRatesPerM2Max: null,
  priceRatesPerPerson: null,
  priceRatesMin: null,
  priceRatesMax: null
}

--
ремонт
1 / 0 — Без отделки / Черновая / Строительная отделка (новостройки без ремонта)

2 — Удовлетворительный / Старый ремонт / Стандартный

3 — Хороший ремонт

4 — Отличный / Евроремонт / Дизайнерский

