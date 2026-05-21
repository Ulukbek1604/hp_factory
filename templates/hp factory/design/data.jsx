// Mock data for HP Factory prototype

const MOCK = {
  user: {
    name: 'Алишер Турсунов',
    role: 'Администратор',
    initials: 'АТ',
  },
  budget: 482_350,
  rawCount: 24,
  productCount: 12,
  employeeCount: 18,
  activeCredits: 2,
  creditDebt: 145_200,
  totalRequests: 287,
  inProgress: 14,
  completed: 246,
  errors: 9,

  totals: {
    sales: 1_243_800,
    purchases: 612_500,
    salary: 384_000,
    credits: 250_000,
    creditPayments: 104_800,
    remainingCredit: 145_200,
  },

  recentRequests: [
    { id: 1287, date: '01.05.2026 09:14', applicant: 'Н. Каримов', product: 'Лепёшка тандырная', qty: 240, status: 'Выполнена' },
    { id: 1286, date: '01.05.2026 08:42', applicant: 'Н. Каримов', product: 'Самса с мясом', qty: 120, status: 'В работе' },
    { id: 1285, date: '30.04.2026 18:03', applicant: 'Г. Юлдашева', product: 'Сухарики', qty: 80, status: 'Выполнена' },
    { id: 1284, date: '30.04.2026 14:51', applicant: 'А. Турсунов', product: 'Лепёшка обычная', qty: 500, status: 'Создана' },
    { id: 1283, date: '30.04.2026 11:22', applicant: 'Г. Юлдашева', product: 'Чак-чак', qty: 30, status: 'Ошибка', reason: 'Недостаточно мёда (нужно 4.5 кг, в наличии 1.2)' },
    { id: 1282, date: '29.04.2026 16:08', applicant: 'Н. Каримов', product: 'Самса с тыквой', qty: 90, status: 'Выполнена' },
    { id: 1281, date: '29.04.2026 09:30', applicant: 'А. Турсунов', product: 'Хворост', qty: 25, status: 'Выполнена' },
  ],

  rawMaterials: [
    { id: 1, name: 'Мука высшего сорта', unit: 'кг', qty: 1240, sum: 38440 },
    { id: 2, name: 'Сахар-песок', unit: 'кг', qty: 320, sum: 19200 },
    { id: 3, name: 'Соль поваренная', unit: 'кг', qty: 145, sum: 2175 },
    { id: 4, name: 'Дрожжи прессованные', unit: 'кг', qty: 28, sum: 5600 },
    { id: 5, name: 'Масло подсолнечное', unit: 'л', qty: 180, sum: 21600 },
    { id: 6, name: 'Молоко цельное', unit: 'л', qty: 95, sum: 8550 },
    { id: 7, name: 'Яйцо куриное', unit: 'шт', qty: 1200, sum: 18000 },
    { id: 8, name: 'Мёд натуральный', unit: 'кг', qty: 1.2, sum: 1440, low: true },
    { id: 9, name: 'Мясо говяжье', unit: 'кг', qty: 64, sum: 25600 },
    { id: 10, name: 'Тыква свежая', unit: 'кг', qty: 30, sum: 1500 },
  ],

  finishedProducts: [
    { id: 1, name: 'Лепёшка тандырная', unit: 'шт', qty: 540, price: 12 },
    { id: 2, name: 'Лепёшка обычная', unit: 'шт', qty: 1200, price: 8 },
    { id: 3, name: 'Самса с мясом', unit: 'шт', qty: 320, price: 25 },
    { id: 4, name: 'Самса с тыквой', unit: 'шт', qty: 180, price: 22 },
    { id: 5, name: 'Сухарики', unit: 'кг', qty: 42, price: 60 },
    { id: 6, name: 'Чак-чак', unit: 'кг', qty: 18, price: 180 },
    { id: 7, name: 'Хворост', unit: 'кг', qty: 12, price: 140 },
  ],

  employees: [
    { id: 1, name: 'Турсунов Алишер Сабирович', position: 'Директор', phone: '+998 90 123-45-67', salary: 14000 },
    { id: 2, name: 'Каримов Нодир Алиевич', position: 'Пекарь старший', phone: '+998 91 234-56-78', salary: 8500 },
    { id: 3, name: 'Юлдашева Гульнара Махмудовна', position: 'Кондитер', phone: '+998 93 345-67-89', salary: 7800 },
    { id: 4, name: 'Назаров Бахтиёр Олимович', position: 'Пекарь', phone: '+998 94 456-78-90', salary: 6200 },
    { id: 5, name: 'Хамидова Зульфия Каримовна', position: 'Бухгалтер', phone: '+998 95 567-89-01', salary: 9500 },
    { id: 6, name: 'Раджабов Илхом Тахирович', position: 'Кладовщик', phone: '+998 97 678-90-12', salary: 5800 },
    { id: 7, name: 'Ахмедов Сардор Юсупович', position: 'Грузчик', phone: '+998 99 789-01-23', salary: 4200 },
  ],

  positions: [
    { id: 1, name: 'Директор', employees: 1 },
    { id: 2, name: 'Пекарь старший', employees: 2 },
    { id: 3, name: 'Пекарь', employees: 5 },
    { id: 4, name: 'Кондитер', employees: 3 },
    { id: 5, name: 'Бухгалтер', employees: 1 },
    { id: 6, name: 'Кладовщик', employees: 2 },
    { id: 7, name: 'Грузчик', employees: 4 },
  ],

  units: [
    { id: 1, name: 'кг', desc: 'Килограмм' },
    { id: 2, name: 'г', desc: 'Грамм' },
    { id: 3, name: 'л', desc: 'Литр' },
    { id: 4, name: 'мл', desc: 'Миллилитр' },
    { id: 5, name: 'шт', desc: 'Штука' },
    { id: 6, name: 'упак', desc: 'Упаковка' },
  ],

  purchases: [
    { id: 247, date: '01.05.2026 07:30', material: 'Мука высшего сорта', qty: 200, sum: 6200, employee: 'И. Раджабов' },
    { id: 246, date: '30.04.2026 14:10', material: 'Масло подсолнечное', qty: 60, sum: 7200, employee: 'И. Раджабов' },
    { id: 245, date: '29.04.2026 09:22', material: 'Сахар-песок', qty: 80, sum: 4800, employee: 'И. Раджабов' },
    { id: 244, date: '28.04.2026 16:45', material: 'Мясо говяжье', qty: 40, sum: 16000, employee: 'А. Турсунов' },
    { id: 243, date: '28.04.2026 11:00', material: 'Дрожжи прессованные', qty: 10, sum: 2000, employee: 'И. Раджабов' },
  ],

  productions: [
    { id: 412, date: '01.05.2026 10:30', product: 'Лепёшка тандырная', qty: 240, employee: 'Н. Каримов' },
    { id: 411, date: '01.05.2026 09:00', product: 'Самса с мясом', qty: 120, employee: 'Н. Каримов' },
    { id: 410, date: '30.04.2026 18:15', product: 'Сухарики', qty: 12, employee: 'Г. Юлдашева' },
    { id: 409, date: '30.04.2026 14:00', product: 'Лепёшка обычная', qty: 480, employee: 'Б. Назаров' },
    { id: 408, date: '29.04.2026 16:40', product: 'Самса с тыквой', qty: 90, employee: 'Н. Каримов' },
  ],

  sales: [
    { id: 583, date: '01.05.2026 11:20', product: 'Лепёшка тандырная', qty: 180, sum: 2160, employee: 'З. Хамидова' },
    { id: 582, date: '01.05.2026 10:05', product: 'Самса с мясом', qty: 80, sum: 2000, employee: 'З. Хамидова' },
    { id: 581, date: '30.04.2026 17:30', product: 'Лепёшка обычная', qty: 320, sum: 2560, employee: 'З. Хамидова' },
    { id: 580, date: '30.04.2026 15:00', product: 'Сухарики', qty: 8, sum: 480, employee: 'З. Хамидова' },
    { id: 579, date: '29.04.2026 12:40', product: 'Чак-чак', qty: 4, sum: 720, employee: 'З. Хамидова' },
  ],

  salaries: [
    { id: 88, date: '30.04.2026', employee: 'Турсунов А.С.', amount: 14000 },
    { id: 87, date: '30.04.2026', employee: 'Каримов Н.А.', amount: 8500 },
    { id: 86, date: '30.04.2026', employee: 'Юлдашева Г.М.', amount: 7800 },
    { id: 85, date: '30.04.2026', employee: 'Назаров Б.О.', amount: 6200 },
    { id: 84, date: '30.04.2026', employee: 'Хамидова З.К.', amount: 9500 },
  ],

  credits: [
    { id: 4, amount: 200_000, rate: 18, term: 12, totalToPay: 220_000, paid: 74_800, remaining: 145_200, status: 'active', date: '15.01.2026' },
    { id: 3, amount: 50_000, rate: 22, term: 6, totalToPay: 55_500, paid: 30_000, remaining: 25_500, status: 'active', date: '20.02.2026', due: true },
    { id: 2, amount: 120_000, rate: 16, term: 18, totalToPay: 132_000, paid: 132_000, remaining: 0, status: 'paid', date: '12.06.2025' },
    { id: 1, amount: 80_000, rate: 24, term: 8, totalToPay: 90_400, paid: 90_400, remaining: 0, status: 'paid', date: '04.03.2025' },
  ],

  creditPayments: [
    { id: 24, date: '15.04.2026', creditId: 4, type: 'principal', amount: 16_667, note: 'Платёж за апрель' },
    { id: 23, date: '15.04.2026', creditId: 4, type: 'interest', amount: 2_750, note: 'Проценты за апрель' },
    { id: 22, date: '20.04.2026', creditId: 3, type: 'mixed', amount: 9_500, note: 'Платёж #3' },
    { id: 21, date: '20.03.2026', creditId: 3, type: 'mixed', amount: 9_500, note: 'Платёж #2' },
  ],

  paymentSchedule: Array.from({ length: 12 }, (_, i) => ({
    n: i + 1,
    date: `15.${String(i + 2).padStart(2, '0')}.2026`,
    principal: 16_667,
    interest: 3_000 - i * 220,
    total: 19_667 - i * 220,
    status: i < 4 ? 'paid' : i === 4 ? 'due' : 'pending',
  })),

  ingredients: [
    { product: 'Лепёшка тандырная', material: 'Мука высшего сорта', qty: 0.18, unit: 'кг' },
    { product: 'Лепёшка тандырная', material: 'Соль поваренная', qty: 0.005, unit: 'кг' },
    { product: 'Лепёшка тандырная', material: 'Дрожжи прессованные', qty: 0.003, unit: 'кг' },
    { product: 'Самса с мясом', material: 'Мука высшего сорта', qty: 0.12, unit: 'кг' },
    { product: 'Самса с мясом', material: 'Мясо говяжье', qty: 0.08, unit: 'кг' },
    { product: 'Самса с мясом', material: 'Масло подсолнечное', qty: 0.02, unit: 'л' },
    { product: 'Чак-чак', material: 'Мука высшего сорта', qty: 0.4, unit: 'кг' },
    { product: 'Чак-чак', material: 'Мёд натуральный', qty: 0.15, unit: 'кг' },
    { product: 'Чак-чак', material: 'Яйцо куриное', qty: 3, unit: 'шт' },
  ],
};

window.MOCK = MOCK;
