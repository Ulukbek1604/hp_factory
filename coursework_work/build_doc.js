// Build coursework .docx for HP Factory project (with embedded screenshots)
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, PageOrientation, LevelFormat,
  TabStopType, TabStopPosition, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, ImageRun,
} = require('docx');

// ===== Globals =====
const FONT = "Times New Roman";
const SIZE = 28; // 14pt
const SHOTS = path.join(__dirname, "shots");
const SIZES = JSON.parse(fs.readFileSync(path.join(__dirname, "shot_sizes.json"), "utf-8"));
// Manually include console screenshots size info
function getSize(name) {
  if (SIZES[name]) return SIZES[name];
  const im = fs.readFileSync(path.join(SHOTS, name));
  // fallback: approximate using PNG header
  const w = im.readUInt32BE(16), h = im.readUInt32BE(20);
  return [w, h];
}

// ===== Paragraph helpers =====
function p(text, opts = {}) {
  const { bold = false, italic = false, align = AlignmentType.JUSTIFIED, size = SIZE,
    indent = { firstLine: 720 }, spacing = { line: 360, after: 0 } } = opts;
  return new Paragraph({
    alignment: align, indent, spacing,
    children: [new TextRun({ text, bold, italics: italic, font: FONT, size })],
  });
}
function center(text, opts = {}) {
  return p(text, { ...opts, align: AlignmentType.CENTER, indent: { firstLine: 0 } });
}
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, alignment: AlignmentType.LEFT,
    spacing: { before: 360, after: 240, line: 360 },
    children: [new TextRun({ text, bold: true, font: FONT, size: 32 })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2, alignment: AlignmentType.LEFT,
    spacing: { before: 240, after: 160, line: 360 },
    children: [new TextRun({ text, bold: true, font: FONT, size: 28 })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3, alignment: AlignmentType.LEFT,
    spacing: { before: 160, after: 120, line: 360 },
    children: [new TextRun({ text, bold: true, italics: true, font: FONT, size: 26 })],
  });
}
function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360, after: 0 },
    children: [new TextRun({ text, font: FONT, size: SIZE })],
  });
}
function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numlist", level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360, after: 0 },
    children: [new TextRun({ text, font: FONT, size: SIZE })],
  });
}
function code(text) {
  return text.split('\n').map((line) => new Paragraph({
    alignment: AlignmentType.LEFT, indent: { left: 360 },
    spacing: { line: 276, after: 0 },
    shading: { fill: "F2F2F2", type: ShadingType.CLEAR },
    children: [new TextRun({ text: line || ' ', font: "Consolas", size: 22 })],
  }));
}
function figureCaption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 240, line: 360 },
    children: [new TextRun({ text, italics: true, font: FONT, size: 24 })],
  });
}

// ===== Image helper =====
// Page content width ≈ 16 cm. At 96 DPI that's ~605 px.
// Cap height ≈ 720 px (≈ 19 cm) so a single image doesn't blow up a page.
const MAX_W = 600;
const MAX_H = 720;
function imageParagraph(filename) {
  const data = fs.readFileSync(path.join(SHOTS, filename));
  const [w, h] = getSize(filename);
  let renderW = MAX_W;
  let renderH = Math.round(MAX_W * h / w);
  if (renderH > MAX_H) {
    renderH = MAX_H;
    renderW = Math.round(MAX_H * w / h);
  }
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 0 },
    children: [new ImageRun({
      type: "png", data,
      transformation: { width: renderW, height: renderH },
      altText: { title: filename, description: filename, name: filename },
    })],
  });
}
function fig(filename, caption) {
  return [imageParagraph(filename), figureCaption(caption)];
}

// ===== Table helpers =====
const cellBorder = { style: BorderStyle.SINGLE, size: 6, color: "808080" };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
function tcell(text, width, opts = {}) {
  const { bold = false, shade = null, align = AlignmentType.LEFT } = opts;
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    ...(shade ? { shading: { fill: shade, type: ShadingType.CLEAR } } : {}),
    children: [new Paragraph({
      alignment: align, spacing: { line: 276, after: 0 },
      children: [new TextRun({ text, bold, font: FONT, size: 24 })],
    })],
  });
}
function dbTable(rows, widths) {
  const totalWidth = widths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((row, idx) => new TableRow({
      tableHeader: idx === 0,
      children: row.map((cellText, ci) =>
        tcell(cellText, widths[ci], { bold: idx === 0, shade: idx === 0 ? "D9E2F3" : null })),
    })),
  });
}

// =================================================================
// TITLE PAGE
// =================================================================
const titlePage = [
  center("МИНИСТЕРСТВО НАУКИ, ВЫСШЕГО ОБРАЗОВАНИЯ И ИННОВАЦИЙ", { bold: true, size: 26, spacing: { line: 300, after: 0 } }),
  center("КЫРГЫЗСКОЙ РЕСПУБЛИКИ", { bold: true, size: 26, spacing: { line: 300, after: 0 } }),
  center("КЫРГЫЗСКИЙ ГОСУДАРСТВЕННЫЙ ТЕХНИЧЕСКИЙ УНИВЕРСИТЕТ", { bold: true, size: 26, spacing: { line: 300, after: 0 } }),
  center("ИМЕНИ И. РАЗЗАКОВА", { bold: true, size: 26, spacing: { line: 300, after: 0 } }),
  center("ИНСТИТУТ ИНФОРМАЦИОННЫХ ТЕХНОЛОГИЙ", { bold: true, size: 26, spacing: { line: 300, after: 0 } }),
  center("КАФЕДРА «ПРОГРАММНОЕ ОБЕСПЕЧЕНИЕ КОМПЬЮТЕРНЫХ СИСТЕМ»", { bold: true, size: 26, spacing: { line: 300, after: 600 } }),
  center("", { spacing: { after: 1200 } }),
  center("КУРСОВОЙ ПРОЕКТ", { bold: true, size: 36, spacing: { after: 240 } }),
  center("по дисциплине: Системы управления базами данных", { size: 28, spacing: { after: 240 } }),
  center("Тема: Учёт производства ноутбуков и ПК HP", { bold: true, size: 30, spacing: { after: 1200 } }),
  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { line: 360, after: 120 },
    children: [new TextRun({ text: "Выполнил: студент группы ПИ-4-23", font: FONT, size: 26 })] }),
  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { line: 360, after: 360 },
    children: [new TextRun({ text: "Турдумаматов Улукбек", font: FONT, size: 26, bold: true })] }),
  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { line: 360, after: 120 },
    children: [new TextRun({ text: "Проверила: старший преподаватель", font: FONT, size: 26 })] }),
  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { line: 360, after: 1200 },
    children: [new TextRun({ text: "Абалиева А. Д.", font: FONT, size: 26, bold: true })] }),
  center("Бишкек, 2026", { bold: true, size: 26 }),
  new Paragraph({ children: [new PageBreak()] }),
];

// =================================================================
// TOC
// =================================================================
function tocEntry(text, bold = false) {
  return new Paragraph({ alignment: AlignmentType.LEFT, spacing: { line: 360, after: 0 },
    indent: { firstLine: 0 },
    children: [new TextRun({ text, bold, font: FONT, size: 26 })] });
}
const tocPage = [
  center("Оглавление", { bold: true, size: 32, spacing: { after: 360 } }),
  tocEntry("1. Техническое задание", true),
  tocEntry("    1.1. Введение"),
  tocEntry("    1.2. Цель работы"),
  tocEntry("    1.3. Постановка задачи"),
  tocEntry("    1.4. Цели и задачи создания системы"),
  tocEntry("    1.5. Функциональные требования"),
  tocEntry("    1.6. Требования к клиентской части"),
  tocEntry("2. База данных", true),
  tocEntry("    2.1. Обзор базы данных"),
  tocEntry("    2.2. Таблицы базы данных"),
  tocEntry("3. Хранимые процедуры и триггеры", true),
  tocEntry("    3.1. Хранимая процедура sp_CheckBudget"),
  tocEntry("    3.2. Хранимая процедура sp_CheckMaterialAvailability"),
  tocEntry("    3.3. Триггер trg_AfterPurchaseInsert"),
  tocEntry("    3.4. Триггер trg_AfterProductionInsert"),
  tocEntry("    3.5. Триггер trg_AfterSaleInsert"),
  tocEntry("    3.6. Триггер trg_AfterSalaryInsert"),
  tocEntry("    3.7. Триггеры trg_AfterCreditInsert и trg_AfterCreditPaymentInsert"),
  tocEntry("4. Серверная часть", true),
  tocEntry("    4.1. Технологии и инструменты"),
  tocEntry("    4.2. Структура проекта"),
  tocEntry("    4.3. Модели"),
  tocEntry("    4.4. Представления (Views)"),
  tocEntry("    4.5. Шаблоны (Templates)"),
  tocEntry("    4.6. Обработка исключений и безопасность"),
  tocEntry("5. Клиентская часть", true),
  tocEntry("    5.1. Интерфейс пользователя"),
  tocEntry("    5.2. Ролевая модель доступа"),
  tocEntry("6. Описание основных модулей", true),
  tocEntry("    6.1. Закупка сырья"),
  tocEntry("    6.2. Производство продукции"),
  tocEntry("    6.3. Продажа готовой продукции"),
  tocEntry("    6.4. Заявки на производство"),
  tocEntry("    6.5. Выплата заработной платы"),
  tocEntry("    6.6. Кредиты"),
  tocEntry("    6.7. Отчёты"),
  tocEntry("7. Тестирование", true),
  tocEntry("8. Запуск программы", true),
  tocEntry("9. Скриншоты программы", true),
  tocEntry("10. Заключение", true),
  tocEntry("11. Список использованной литературы", true),
  new Paragraph({ children: [new PageBreak()] }),
];

// =================================================================
// SECTION 1: ТЗ
// =================================================================
const section1 = [
  h1("1. Техническое задание"),
  h2("1.1. Введение"),
  p("В современных условиях рынка вычислительной техники эффективное управление ресурсами производственного предприятия становится ключевым фактором его успешного функционирования. Заводы, специализирующиеся на сборке ноутбуков и персональных компьютеров, сталкиваются с необходимостью не только контролировать собственно сборочный процесс, но и вести строгую финансовую дисциплину, управлять персоналом, контролировать закупки комплектующих и продажи готовой продукции."),
  p("Информационная система «HP Factory» разработана для решения задачи отсутствия единой цифровой среды управления заводом HP. Без такой системы предприятие не могло эффективно отслеживать исполнение бюджета, управлять кредитными обязательствами, вести точный учёт сотрудников с выплатой заработной платы, контролировать закупки комплектующих (материнские платы, процессоры, оперативная память, накопители, корпуса), а также управлять ассортиментом готовой продукции — настольных ПК и ноутбуков HP."),

  h2("1.2. Цель работы"),
  p("Цель работы — проектирование базы данных и разработка веб-приложения для производственного завода HP, специализирующегося на сборке ноутбуков и персональных компьютеров. Основная задача — создать инструменты, позволяющие авторизованным пользователям:"),
  bullet("просматривать и управлять бюджетом предприятия;"),
  bullet("регистрировать и отслеживать кредиты и погашение займов;"),
  bullet("управлять сотрудниками, их должностями и выплатой заработной платы;"),
  bullet("отслеживать закупки комплектующих и единицы их измерения;"),
  bullet("управлять ассортиментом готовой продукции, записями производства и продажами;"),
  bullet("обрабатывать пользовательские заявки на производство ноутбуков и ПК."),

  h2("1.3. Постановка задачи"),
  p("В ходе анализа существующих процессов управления заводом HP были выявлены следующие проблемы:"),
  numbered("Отсутствие единого инструмента учёта бюджета, затрудняющее отслеживание доходов и расходов предприятия."),
  numbered("Отсутствие системы управления кредитами, приводящее к трудностям контроля графика погашений и остатка задолженности."),
  numbered("Отсутствие автоматизированного управления персоналом, осложняющее расчёт заработной платы и отслеживание должностей."),
  numbered("Отсутствие системы отслеживания закупок комплектующих, затрудняющее контроль складских запасов и затрат."),
  numbered("Отсутствие цифрового инструмента управления ассортиментом готовой продукции, её производством и записями о продажах."),
  numbered("Отсутствие механизма автоматической обработки заявок на производство конкретной модели ноутбука или ПК."),

  h2("1.4. Цели и задачи создания системы"),
  p("Назначение: разработка веб-приложения для управления заводом HP с целью предоставления менеджерам и бухгалтерам эффективных инструментов комплексного управления ресурсами."),
  p("Основные задачи:", { indent: { firstLine: 0 }, spacing: { line: 360, after: 80 } }),
  bullet("упрощение процесса учёта бюджета и финансового планирования;"),
  bullet("обеспечение быстрого доступа к информации о кредитах и статусе их погашения;"),
  bullet("автоматизация управления персоналом, выплаты заработной платы и отслеживания должностей;"),
  bullet("обеспечение прозрачного контроля закупок комплектующих и учёта единиц измерения;"),
  bullet("эффективное управление ассортиментом готовой продукции, производством и продажами;"),
  bullet("реализация процесса обработки заявок на сборку продукции с автоматической проверкой склада."),

  h2("1.5. Функциональные требования"),
  numbered("Создание и редактирование записи бюджета."),
  numbered("Просмотр истории операций с фильтрацией и сортировкой."),
  numbered("Регистрация кредитов и погашение активных кредитов с расчётом процентов."),
  numbered("Отслеживание статуса погашения кредитов (active / paid / overdue)."),
  numbered("Создание, редактирование и просмотр записей о сотрудниках."),
  numbered("Расчёт заработной платы и отслеживание должностей."),
  numbered("Регистрация закупок комплектующих и единиц измерения."),
  numbered("Управление ассортиментом готовой продукции (создание, редактирование, запись производства)."),
  numbered("Регистрация и просмотр продаж готовой продукции."),
  numbered("Автоматическое обновление бюджета после закупок, продаж, кредитных операций и выплаты заработной платы (через триггеры)."),
  numbered("Проверка наличия комплектующих перед производством продукции (через хранимую процедуру)."),
  numbered("Пользовательские заявки на производство с автоматической обработкой по этапам."),
  numbered("Отображение последних операций на панели управления (Dashboard)."),
  numbered("Формирование аналитических отчётов и графика изменения бюджета."),

  h2("1.6. Требования к клиентской части"),
  p("Клиент может использовать один из следующих веб-браузеров: Google Chrome, Mozilla Firefox, Yandex Browser, Microsoft Edge и другие современные браузеры с поддержкой HTML5."),
  p("Для работы с системой пользователь должен пройти аутентификацию с действующим именем пользователя и паролем. После входа доступ к конкретным функциям контролируется ролевыми разрешениями (Admin, Accountant, Worker). Сеанс поддерживается безопасно с использованием Django-сессий; интерфейс автоматически адаптируется к роли пользователя."),
  p("Интерфейс должен быть простым, понятным и удобным для ежедневной работы. Главные страницы приложения должны быть доступны через боковую панель навигации. Система должна отображать важную информацию — текущий бюджет и авторизованного пользователя — в видимой области интерфейса."),
  p("Клиентская часть должна поддерживать работу с формами, таблицами, кнопками и динамически отображаемыми данными. Страницы должны поддерживать базовые операции: добавление, редактирование, удаление записей и просмотр истории операций. Сообщения об ошибках должны отображаться в понятном для пользователя виде при нарушении бизнес-правил (например, при недостатке бюджета или сырья)."),
  new Paragraph({ children: [new PageBreak()] }),
];

// =================================================================
// SECTION 2: БД
// =================================================================
const section2 = [
  h1("2. База данных"),
  h2("2.1. Обзор базы данных"),
  p("Работа над проектом началась с проектирования реляционной базы данных HP_Factory под управлением СУБД Microsoft SQL Server. База данных отражает производственный процесс предприятия, которое собирает ноутбуки и ПК HP из комплектующих и реализует готовую продукцию. База данных содержит 14 таблиц, 2 хранимые процедуры и 6 триггеров, обеспечивающих автоматическое поддержание целостности данных."),
  p("Все таблицы создаются скриптом schema.sql с использованием конструкции IF NOT EXISTS, что позволяет повторно запускать сценарий без потери данных. Связи между таблицами построены через внешние ключи. Например, таблица Employees связана с таблицей Positions, таблицы RawMaterialPurchases, ProductProduction и ProductSales связаны с сотрудниками, а таблица Ingredients связывает готовую продукцию с комплектующими (рецептура сборки)."),
  ...fig("00_db_diagram.png", "Рис. 1. Диаграмма базы данных HP_Factory"),

  h2("2.2. Таблицы базы данных"),
  p("Ниже описаны все 14 таблиц базы данных с указанием структуры каждой."),

  h3("Таблица Budget"),
  p("Однострочная таблица, хранящая текущий бюджет предприятия."),
  dbTable([
    ["Столбец", "Тип / Описание"],
    ["id", "INT IDENTITY — первичный ключ (PK)"],
    ["TotalAmount", "DECIMAL(18,2) — общая сумма бюджета предприятия"],
  ], [3000, 6360]),

  h3("Таблица Units"),
  p("Справочная таблица единиц измерения."),
  dbTable([
    ["Столбец", "Тип / Описание"],
    ["id", "INT IDENTITY — первичный ключ (PK)"],
    ["name", "NVARCHAR(50) — название единицы (шт., кг, м и т. д.)"],
  ], [3000, 6360]),

  h3("Таблица Positions"),
  p("Хранит список должностей сотрудников завода."),
  dbTable([
    ["Столбец", "Тип / Описание"],
    ["id", "INT IDENTITY — первичный ключ (PK)"],
    ["title", "NVARCHAR(100) — наименование должности"],
  ], [3000, 6360]),

  h3("Таблица Employees"),
  p("Хранит информацию о сотрудниках предприятия."),
  dbTable([
    ["Столбец", "Тип / Описание"],
    ["id", "INT IDENTITY — первичный ключ (PK)"],
    ["FullName", "NVARCHAR(150) — полное имя сотрудника"],
    ["PositionID", "INT — внешний ключ (FK) → Positions"],
    ["Salary", "DECIMAL(18,2) — заработная плата сотрудника"],
    ["Address", "NVARCHAR(255) — адрес проживания"],
    ["Phone", "NVARCHAR(20) — контактный телефон"],
  ], [3000, 6360]),

  h3("Таблица RawMaterials"),
  p("Хранит информацию о комплектующих и материалах на складе."),
  dbTable([
    ["Столбец", "Тип / Описание"],
    ["id", "INT IDENTITY — первичный ключ (PK)"],
    ["Name", "NVARCHAR(100) — наименование комплектующего"],
    ["UnitID", "INT — внешний ключ (FK) → Units"],
    ["Quantity", "FLOAT — текущий запас на складе"],
    ["SumAmount", "FLOAT — общая стоимость запаса"],
  ], [3000, 6360]),

  h3("Таблица FinishedProducts"),
  p("Хранит информацию о готовой продукции (модели ноутбуков и ПК HP)."),
  dbTable([
    ["Столбец", "Тип / Описание"],
    ["id", "INT IDENTITY — первичный ключ (PK)"],
    ["Name", "NVARCHAR(100) — модель устройства"],
    ["UnitID", "INT — внешний ключ (FK) → Units"],
    ["Quantity", "FLOAT — текущий запас готовой продукции"],
    ["SumAmount", "FLOAT — себестоимость запаса"],
    ["SellingPrice", "DECIMAL(18,2) — цена реализации"],
  ], [3000, 6360]),

  h3("Таблица Ingredients"),
  p("Хранит рецептуру сборки: какие комплектующие и в каком количестве входят в состав каждой модели."),
  dbTable([
    ["Столбец", "Тип / Описание"],
    ["id", "INT IDENTITY — первичный ключ (PK)"],
    ["ProductID", "INT — внешний ключ (FK) → FinishedProducts"],
    ["MaterialID", "INT — внешний ключ (FK) → RawMaterials"],
    ["Quantity", "FLOAT — количество комплектующего на одну единицу продукции"],
  ], [3000, 6360]),

  h3("Таблица RawMaterialPurchases"),
  p("Фиксирует записи о закупках комплектующих у поставщиков."),
  dbTable([
    ["Столбец", "Тип / Описание"],
    ["id", "INT IDENTITY — первичный ключ (PK)"],
    ["MaterialID", "INT — внешний ключ (FK) → RawMaterials"],
    ["Quantity", "FLOAT — закупленное количество"],
    ["SumAmount", "DECIMAL(18,2) — общая сумма закупки"],
    ["PurchaseDate", "DATETIME — дата закупки"],
    ["EmployeeID", "INT — внешний ключ (FK) → Employees"],
  ], [3000, 6360]),

  h3("Таблица ProductProduction"),
  p("Фиксирует операции сборки готовой продукции."),
  dbTable([
    ["Столбец", "Тип / Описание"],
    ["id", "INT IDENTITY — первичный ключ (PK)"],
    ["ProductID", "INT — внешний ключ (FK) → FinishedProducts"],
    ["Quantity", "FLOAT — количество собранной продукции"],
    ["ProductionDate", "DATETIME — дата производства"],
    ["EmployeeID", "INT — внешний ключ (FK) → Employees"],
  ], [3000, 6360]),

  h3("Таблица ProductSales"),
  p("Фиксирует продажи готовой продукции клиентам."),
  dbTable([
    ["Столбец", "Тип / Описание"],
    ["id", "INT IDENTITY — первичный ключ (PK)"],
    ["ProductID", "INT — внешний ключ (FK) → FinishedProducts"],
    ["Quantity", "FLOAT — проданное количество"],
    ["SumAmount", "DECIMAL(18,2) — общая сумма продажи"],
    ["SaleDate", "DATETIME — дата продажи"],
    ["EmployeeID", "INT — внешний ключ (FK) → Employees"],
  ], [3000, 6360]),

  h3("Таблица SalaryPayments"),
  p("Хранит записи о выплатах заработной платы сотрудникам."),
  dbTable([
    ["Столбец", "Тип / Описание"],
    ["id", "INT IDENTITY — первичный ключ (PK)"],
    ["EmployeeID", "INT — внешний ключ (FK) → Employees"],
    ["Amount", "DECIMAL(18,2) — сумма выплаты"],
    ["PaymentDate", "DATETIME — дата выплаты"],
  ], [3000, 6360]),

  h3("Таблица Credits"),
  p("Хранит информацию о кредитах, оформленных предприятием."),
  dbTable([
    ["Столбец", "Тип / Описание"],
    ["id", "INT IDENTITY — первичный ключ (PK)"],
    ["Amount", "DECIMAL(18,2) — сумма основного долга"],
    ["InterestRate", "DECIMAL(5,2) — процентная ставка (% годовых)"],
    ["TermMonths", "INT — срок кредита в месяцах"],
    ["StartDate", "DATETIME — дата начала действия"],
    ["Status", "NVARCHAR(20) — статус (active / paid / overdue)"],
    ["TotalToPay", "DECIMAL(18,2) — общая сумма к выплате (с процентами)"],
    ["CreditDate", "DATETIME — дата оформления"],
  ], [3000, 6360]),

  h3("Таблица CreditPayments"),
  p("Хранит выплаты по кредитам."),
  dbTable([
    ["Столбец", "Тип / Описание"],
    ["id", "INT IDENTITY — первичный ключ (PK)"],
    ["CreditID", "INT — внешний ключ (FK) → Credits"],
    ["Amount", "DECIMAL(18,2) — сумма выплаты"],
    ["PaymentDate", "DATETIME — дата выплаты"],
    ["PaymentType", "NVARCHAR(20) — тип (principal / interest / fine / combined)"],
    ["Note", "NVARCHAR(MAX) — комментарий"],
  ], [3000, 6360]),

  h3("Таблица ProductionRequests"),
  p("Хранит пользовательские заявки на сборку продукции."),
  dbTable([
    ["Столбец", "Тип / Описание"],
    ["id", "INT IDENTITY — первичный ключ (PK)"],
    ["CreationDate", "DATETIME — дата создания заявки"],
    ["UpdatedDate", "DATETIME — дата последнего обновления статуса"],
    ["Status", "NVARCHAR(50) — текущий статус заявки"],
    ["ApplicantID", "INT — внешний ключ (FK) → Employees"],
    ["ApplicantFullName", "NVARCHAR(150) — ФИО заявителя"],
    ["ProductID", "INT — внешний ключ (FK) → FinishedProducts"],
    ["Quantity", "FLOAT — запрошенное количество"],
    ["RejectionReason", "NVARCHAR(MAX) — причина отказа (если есть)"],
  ], [3000, 6360]),
  new Paragraph({ children: [new PageBreak()] }),
];

// =================================================================
// SECTION 3: SP & Triggers
// =================================================================
const sp_checkBudget = `CREATE PROCEDURE sp_CheckBudget
    @RequiredAmount DECIMAL(18,2),
    @IsAllowed      INT OUTPUT
AS
BEGIN
    DECLARE @CurrentBudget DECIMAL(18,2);
    SELECT TOP 1 @CurrentBudget = TotalAmount FROM Budget;

    IF @CurrentBudget >= @RequiredAmount
        SET @IsAllowed = 0;  -- 0 = разрешено
    ELSE
        SET @IsAllowed = 1;  -- 1 = отказано
END;`;

const sp_checkMaterial = `CREATE PROCEDURE sp_CheckMaterialAvailability
    @ProductID  INT,
    @ProductQty FLOAT,
    @IsAllowed  INT OUTPUT
AS
BEGIN
    SET @IsAllowed = 0;

    IF EXISTS (
        SELECT 1
        FROM Ingredients i
        JOIN RawMaterials rm ON i.MaterialID = rm.id
        WHERE i.ProductID = @ProductID
          AND rm.Quantity < (i.Quantity * @ProductQty)
    )
        SET @IsAllowed = 1;  -- 1 = недостаточно сырья
END;`;

const trg_purchase = `CREATE TRIGGER trg_AfterPurchaseInsert
ON RawMaterialPurchases
AFTER INSERT
AS
BEGIN
    -- Уменьшить бюджет на сумму закупки
    UPDATE Budget
       SET TotalAmount = TotalAmount - (SELECT SUM(SumAmount) FROM inserted);

    -- Увеличить остаток комплектующих
    UPDATE rm
       SET rm.Quantity = rm.Quantity + i.Quantity
      FROM RawMaterials rm
      JOIN inserted i ON rm.id = i.MaterialID;
END;`;

const trg_production = `CREATE TRIGGER trg_AfterProductionInsert
ON ProductProduction
AFTER INSERT
AS
BEGIN
    -- Добавить готовую продукцию на склад
    UPDATE fp
       SET fp.Quantity = fp.Quantity + i.Quantity
      FROM FinishedProducts fp
      JOIN inserted i ON fp.id = i.ProductID;

    -- Списать сырьё по рецептуре
    UPDATE rm
       SET rm.Quantity = rm.Quantity - (i.Quantity * ing.Quantity)
      FROM RawMaterials rm
      JOIN Ingredients ing ON ing.MaterialID = rm.id
      JOIN inserted i ON i.ProductID = ing.ProductID;
END;`;

const trg_sale = `CREATE TRIGGER trg_AfterSaleInsert
ON ProductSales
AFTER INSERT
AS
BEGIN
    UPDATE fp
       SET fp.Quantity = fp.Quantity - i.Quantity
      FROM FinishedProducts fp
      JOIN inserted i ON fp.id = i.ProductID;

    UPDATE Budget
       SET TotalAmount = TotalAmount + (SELECT SUM(SumAmount) FROM inserted);
END;`;

const trg_salary = `CREATE TRIGGER trg_AfterSalaryInsert
ON SalaryPayments
AFTER INSERT
AS
BEGIN
    UPDATE Budget
       SET TotalAmount = TotalAmount - (SELECT SUM(Amount) FROM inserted);
END;`;

const trg_credit = `CREATE TRIGGER trg_AfterCreditInsert
ON Credits
AFTER INSERT
AS
BEGIN
    UPDATE Budget
       SET TotalAmount = TotalAmount + (SELECT SUM(Amount) FROM inserted);

    UPDATE Credits
       SET TotalToPay = CASE
            WHEN i.InterestRate IS NOT NULL
             AND i.TermMonths   IS NOT NULL
             AND i.TermMonths   > 0
            THEN i.Amount + (i.Amount * (i.InterestRate / 100.0)
                 * (i.TermMonths / 12.0))
            ELSE i.Amount
         END
      FROM Credits c
      JOIN inserted i ON c.id = i.id;
END;`;

const section3 = [
  h1("3. Хранимые процедуры и триггеры"),
  p("Бизнес-логика, связанная с проверкой бюджета и складских запасов, вынесена на уровень базы данных в виде хранимых процедур. Автоматическое обновление связанных таблиц (бюджет, склад) реализовано через AFTER INSERT-триггеры. Такой подход гарантирует атомарность операций даже в случае одновременной работы нескольких пользователей и снижает вероятность рассинхронизации данных."),

  h2("3.1. Хранимая процедура sp_CheckBudget"),
  p("Процедура sp_CheckBudget вызывается перед операциями, требующими списания средств (закупка сырья, выплата зарплаты, оформление кредита). Она получает требуемую сумму и возвращает результат проверки."),
  dbTable([
    ["Процедура", "Параметры", "Описание"],
    ["sp_CheckBudget",
      "@RequiredAmount DECIMAL(18,2) (in)\n@IsAllowed INT (out)",
      "Сравнивает текущий бюджет с требуемой суммой. Возвращает 0 — разрешено, 1 — отказано."],
  ], [2400, 3000, 3960]),
  p("Код хранимой процедуры:", { indent: { firstLine: 0 } }),
  ...code(sp_checkBudget),

  h2("3.2. Хранимая процедура sp_CheckMaterialAvailability"),
  p("Перед запуском производства вызывается процедура sp_CheckMaterialAvailability, которая по рецептуре (таблица Ingredients) проверяет, хватит ли всех комплектующих для сборки заданного количества единиц продукции."),
  dbTable([
    ["Процедура", "Параметры", "Описание"],
    ["sp_CheckMaterialAvailability",
      "@ProductID INT (in)\n@ProductQty FLOAT (in)\n@IsAllowed INT (out)",
      "Возвращает 0 — все комплектующие в наличии, 1 — хотя бы одного не хватает."],
  ], [2400, 3000, 3960]),
  p("Код хранимой процедуры:", { indent: { firstLine: 0 } }),
  ...code(sp_checkMaterial),

  h2("3.3. Триггер trg_AfterPurchaseInsert"),
  p("Триггер срабатывает после вставки записи в таблицу RawMaterialPurchases: уменьшает бюджет на сумму закупки и увеличивает количество соответствующего комплектующего на складе."),
  dbTable([
    ["Триггер", "Таблица / Событие", "Описание"],
    ["trg_AfterPurchaseInsert", "RawMaterialPurchases AFTER INSERT",
     "Уменьшает бюджет и увеличивает остаток комплектующих."],
  ], [2800, 3200, 3360]),
  ...code(trg_purchase),

  h2("3.4. Триггер trg_AfterProductionInsert"),
  p("После регистрации сборки на склад готовой продукции добавляется собранное количество, а со склада комплектующих списываются комплектующие согласно рецептуре (Ingredients)."),
  ...code(trg_production),

  h2("3.5. Триггер trg_AfterSaleInsert"),
  p("После продажи количество готовой продукции уменьшается, а бюджет предприятия увеличивается на сумму продажи."),
  ...code(trg_sale),

  h2("3.6. Триггер trg_AfterSalaryInsert"),
  p("После регистрации выплаты заработной платы бюджет предприятия уменьшается на сумму выплаты."),
  ...code(trg_salary),

  h2("3.7. Триггеры trg_AfterCreditInsert и trg_AfterCreditPaymentInsert"),
  p("При оформлении кредита бюджет увеличивается на сумму займа, а также рассчитывается итоговая сумма к выплате по формуле простых процентов. При выплате по кредиту бюджет уменьшается, и если суммарные выплаты покрыли TotalToPay — статус кредита автоматически переводится в paid."),
  ...code(trg_credit),
  new Paragraph({ children: [new PageBreak()] }),
];

// =================================================================
// SECTION 4: Server
// =================================================================
const modelExample = `class ProductProduction(models.Model):
    """Производство продукции"""
    product   = models.ForeignKey(FinishedProduct,
                  on_delete=models.CASCADE, db_column='ProductID')
    quantity  = models.FloatField(db_column='Quantity')
    production_date = models.DateTimeField(
                  auto_now_add=True, db_column='ProductionDate')
    employee  = models.ForeignKey(Employee,
                  on_delete=models.SET_NULL, null=True,
                  db_column='EmployeeID')

    class Meta:
        managed = False
        db_table = 'ProductProduction'`;

const viewExample = `@login_required
def dashboard(request):
    """Главная страница — обзор предприятия"""
    budget          = Budget.objects.first()
    raw_count       = RawMaterial.objects.count()
    product_count   = FinishedProduct.objects.count()
    employee_count  = Employee.objects.count()
    recent_purchases = (RawMaterialPurchase.objects
        .select_related('material', 'employee')
        .order_by('-purchase_date')[:5])

    active_credits  = Credit.objects.filter(status='active').count()
    total_credit_debt = sum(c.get_remaining_amount()
                            for c in Credit.objects.all())

    return render(request, 'core/dashboard.html', {
        'budget':           budget,
        'raw_count':        raw_count,
        'product_count':    product_count,
        'employee_count':   employee_count,
        'recent_purchases': recent_purchases,
        'active_credits':   active_credits,
        'total_credit_debt': total_credit_debt,
    })`;

const tmplExample = `<section class="header-section">
    <div class="page-icon">
        <i class="fa-solid fa-gauge-high"></i>
        Панель управления
    </div>
    <h1 class="page-title">
        Контроль ключевых показателей завода HP
    </h1>
</section>

<div class="kpi-cards">
    <div class="card"><strong>Бюджет:</strong> {{ budget.total_amount }}</div>
    <div class="card"><strong>Сырьё:</strong> {{ raw_count }}</div>
    <div class="card"><strong>Продукция:</strong> {{ product_count }}</div>
</div>`;

const section4 = [
  h1("4. Серверная часть"),
  h2("4.1. Технологии и инструменты"),
  p("Серверная часть приложения разработана на языке Python с использованием фреймворка Django. Приложение следует архитектуре MVT (Model–View–Template). В качестве СУБД использован Microsoft SQL Server, подключение к которому осуществляется через драйвер mssql-django и ODBC Driver 17 for SQL Server."),
  p("Используемые технологии:", { indent: { firstLine: 0 } }),
  bullet("Python 3.10 — язык программирования;"),
  bullet("Django 4.2+ — фреймворк для веб-разработки;"),
  bullet("Microsoft SQL Server — система управления базами данных;"),
  bullet("mssql-django + pyodbc — СУБД-адаптер для Django;"),
  bullet("Кастомный CSS (тёмная тема, Bootstrap-подобная сетка) — оформление пользовательского интерфейса;"),
  bullet("Django Templates — шаблонизатор для формирования HTML-страниц;"),
  bullet("Chart.js — построение графиков на странице отчётов;"),
  bullet("Argon2, bcrypt, scrypt, PBKDF2, SHA-384/512 — алгоритмы хеширования паролей."),

  h2("4.2. Структура проекта"),
  p("Проект организован по стандартной структуре Django-приложения:"),
  bullet("hp_factory/ — пакет настроек Django (settings.py, urls.py, wsgi.py);"),
  bullet("core/ — основное приложение (models.py, views.py, forms.py, urls.py, hashers.py, services.py);"),
  bullet("templates/ — HTML-шаблоны (base.html + папка core/ с шаблонами страниц);"),
  bullet("static/ — статические файлы (CSS, JS, изображения);"),
  bullet("schema.sql — DDL-скрипт создания всех таблиц, процедур и триггеров;"),
  bullet("seed_data.sql — скрипт начального заполнения справочников и данных;"),
  bullet("manage.py — командный интерфейс Django."),

  h2("4.3. Модели"),
  p("Каждая таблица базы данных представлена соответствующей моделью Django с параметром managed = False, что соответствует подходу database-first: Django используется как ORM для уже созданной вручную схемы и не делает миграций. Связи между моделями реализованы через ForeignKey. Пример модели ProductProduction:"),
  ...code(modelExample),

  h2("4.4. Представления (Views)"),
  p("Каждая бизнес-функция реализована в отдельном представлении Django. Декораторы @login_required и @user_passes_test ограничивают доступ для неавторизованных пользователей и проверяют роли. Пример представления панели управления:"),
  ...code(viewExample),

  h2("4.5. Шаблоны (Templates)"),
  p("Шаблоны реализованы на движке Django Templates с использованием блоков наследования ({% extends %}, {% block %}). Базовый шаблон base.html содержит навигационную боковую панель, блок для отображения уведомлений Django messages и основной контентный блок. Пример блока шаблона панели управления:"),
  ...code(tmplExample),

  h2("4.6. Обработка исключений и безопасность"),
  p("Авторизация выполняется встроенными средствами Django. Для CSRF-атак включена глобальная защита: во всех POST-формах используется тег {% csrf_token %}. SQL-инъекции исключены: запросы к СУБД выполняются через ORM, а вызовы хранимых процедур производятся с параметризацией:"),
  ...code(`def _check_budget_sp(required_amount):
    with connection.cursor() as cursor:
        cursor.execute(
            "DECLARE @result INT; "
            "EXEC sp_CheckBudget @RequiredAmount=%s, "
            "                    @IsAllowed=@result OUTPUT; "
            "SELECT @result;",
            [required_amount])
        return cursor.fetchone()[0] == 0`),
  p("Для хеширования паролей сконфигурированы несколько алгоритмов: первичный Argon2, а также bcrypt, scrypt, PBKDF2, кастомные SHA-384 и SHA-512 (учебные) и MD5 — для совместимости с устаревшими записями. Сообщения об ошибках выводятся через django.contrib.messages."),
  new Paragraph({ children: [new PageBreak()] }),
];

// =================================================================
// SECTION 5
// =================================================================
const section5 = [
  h1("5. Клиентская часть"),
  h2("5.1. Интерфейс пользователя"),
  p("Пользовательский интерфейс реализован с применением кастомных CSS-стилей в светлой палитре с фирменной графикой HP. Навигация осуществляется через боковую панель: пользователь видит список разделов в зависимости от своей роли. Все основные операции с записями (добавление, редактирование, удаление) выполняются через формы и модальные окна. Сообщения о результате операции отображаются в верхней части страницы средствами django.contrib.messages."),
  p("Главные элементы интерфейса:"),
  bullet("боковая панель навигации с разделами «Сотрудники», «Сырьё», «Продукция», «Производство», «Закупки», «Продажи», «Зарплата», «Кредиты», «Заявки», «Отчёты»;"),
  bullet("шапка с отображением текущего бюджета и имени авторизованного пользователя;"),
  bullet("основная область — таблицы записей с пагинацией, кнопками действий и фильтрами;"),
  bullet("модальные окна и формы для ввода данных с валидацией на стороне клиента и сервера."),

  h2("5.2. Ролевая модель доступа"),
  p("В системе реализовано три роли пользователей с разным набором прав:"),
  bullet("Admin (is_superuser) — полный доступ ко всем разделам, в том числе к справочникам, кадрам и финансам;"),
  bullet("Accountant (is_staff) — доступ к финансовым операциям: закупки, продажи, зарплата, кредиты, отчёты;"),
  bullet("Worker (обычный пользователь) — доступ к Dashboard и подаче заявок на производство."),
  p("Проверка роли реализована через декораторы Django и функции is_admin / is_accountant / is_worker в core/views.py. При попытке обращения к запрещённому разделу пользователь перенаправляется на главную страницу с соответствующим сообщением."),
  new Paragraph({ children: [new PageBreak()] }),
];

// =================================================================
// SECTION 6
// =================================================================
const productionLogic = `# Проверка наличия сырья через хранимую процедуру
with connection.cursor() as cur:
    cur.execute(
        "DECLARE @result INT; "
        "EXEC sp_CheckMaterialAvailability "
        "     @ProductID=%s, @ProductQty=%s, @IsAllowed=@result OUTPUT; "
        "SELECT @result;",
        [product_id, quantity])
    if cur.fetchone()[0] != 0:
        messages.error(request, '❌ Недостаточно комплектующих для сборки.')
        return redirect('production_list')

# Создание записи о производстве — триггер сделает остальное
ProductProduction.objects.create(
    product_id=product_id,
    quantity=quantity,
    employee_id=request.POST.get('employee'))
messages.success(request, '✅ Производство зарегистрировано.')`;

const requestLogic = `def process_production_request(request_obj):
    """Пошаговая обработка заявки на сборку ноутбука/ПК."""
    request_obj.status = 'На проверке наличия сырья'
    request_obj.save(update_fields=['status', 'updated_date'])

    with transaction.atomic():
        product = (FinishedProduct.objects
                   .select_for_update()
                   .get(pk=request_obj.product_id))

        from_stock   = min(product.quantity, request_obj.quantity)
        to_produce   = max(0, request_obj.quantity - from_stock)

        if to_produce > 0:
            request_obj.status = 'На процессе закупки сырья'
            request_obj.save(update_fields=['status', 'updated_date'])
            _purchase_missing_materials(product, to_produce)

            request_obj.status = 'На процессе производства'
            request_obj.save(update_fields=['status', 'updated_date'])
            ProductProduction.objects.create(
                product=product, quantity=to_produce)

        request_obj.status = 'На процессе продажи'
        request_obj.save(update_fields=['status', 'updated_date'])
        ProductSale.objects.create(
            product=product,
            quantity=request_obj.quantity,
            sum_amount=product.selling_price * request_obj.quantity)

        request_obj.status = 'Выполнена'
        request_obj.save(update_fields=['status', 'updated_date'])
    return request_obj`;

const salaryLogic = `employees = Employee.objects.all()
total_salary = sum(e.salary for e in employees)

if not _check_budget_sp(total_salary):
    messages.error(request,
        f"❌ Недостаточно средств! Доступно: {budget.total_amount}, "
        f"требуется: {total_salary}")
else:
    # Создаём записи по каждому сотруднику —
    # триггер trg_AfterSalaryInsert уменьшит бюджет автоматически
    for emp in employees:
        SalaryPayment.objects.create(employee=emp, amount=emp.salary)
    messages.success(request,
        f"✅ Выплачено {total_salary} сом для {employees.count()} сотрудников.")`;

const creditLogic = `# Оформление кредита
if form.is_valid():
    Credit.objects.create(
        amount=form.cleaned_data['amount'],
        interest_rate=form.cleaned_data['interest_rate'],
        term_months=form.cleaned_data['term_months'],
        start_date=timezone.now())
    messages.success(request, '✅ Кредит оформлен, бюджет пополнен.')

# Погашение кредита
def credit_pay(request, credit_id):
    credit = get_object_or_404(Credit, pk=credit_id)
    amount = Decimal(request.POST.get('amount', '0'))

    if not _check_budget_sp(amount):
        messages.error(request, '❌ Недостаточно средств для платежа.')
        return redirect('credits_list')

    CreditPayment.objects.create(
        credit=credit, amount=amount, payment_type='combined')
    credit.update_status()
    messages.success(request, '✅ Платёж по кредиту зарегистрирован.')`;

const reportsLogic = `@login_required
@user_passes_test(is_accountant)
def reports_view(request):
    budget          = Budget.objects.first()
    total_purchases = (RawMaterialPurchase.objects
                       .aggregate(s=Sum('sum_amount'))['s'] or 0)
    total_sales     = (ProductSale.objects
                       .aggregate(s=Sum('sum_amount'))['s'] or 0)
    total_salary    = (SalaryPayment.objects
                       .aggregate(s=Sum('amount'))['s'] or 0)
    active_credits  = Credit.objects.filter(status='active').count()

    budget_timeline = _build_budget_timeline()  # для Chart.js

    return render(request, 'core/reports.html', {
        'budget': budget,
        'total_purchases': total_purchases,
        'total_sales':     total_sales,
        'total_salary':    total_salary,
        'active_credits':  active_credits,
        'budget_timeline': budget_timeline,
    })`;

const section6 = [
  h1("6. Описание основных модулей"),

  h2("6.1. Закупка сырья"),
  p("Модуль закупок позволяет регистрировать поставки комплектующих от поставщиков (материнские платы, процессоры, оперативная память, накопители, корпуса, блоки питания, экраны и т. д.). Перед сохранением вызывается хранимая процедура sp_CheckBudget: если бюджета недостаточно, пользователю выводится сообщение об ошибке и операция отменяется. При успешной закупке триггер trg_AfterPurchaseInsert автоматически увеличивает остаток комплектующих на складе и уменьшает бюджет предприятия."),
  ...fig("10_purchases_list.png", "Рис. 2. Страница списка закупок сырья"),
  ...fig("11_purchase_add.png",   "Рис. 3. Форма добавления закупки"),

  h2("6.2. Производство продукции"),
  p("Модуль производства регистрирует сборку готовых устройств. При добавлении записи о производстве система сначала вызывает хранимую процедуру sp_CheckMaterialAvailability, которая по рецептуре проверяет наличие достаточного количества комплектующих. Только при положительном результате создаётся запись в ProductProduction; триггер trg_AfterProductionInsert списывает комплектующие со склада и увеличивает остаток готовой продукции."),
  p("Фрагмент логики производства:", { indent: { firstLine: 0 } }),
  ...code(productionLogic),
  ...fig("12_production_list.png", "Рис. 4. Страница списка производства"),
  ...fig("13_production_add.png",  "Рис. 5. Форма добавления производственной операции"),

  h2("6.3. Продажа готовой продукции"),
  p("Модуль продаж позволяет реализовать готовые ноутбуки и ПК HP клиентам. Перед продажей проверяется наличие нужного количества товара на складе. После создания записи в ProductSales триггер trg_AfterSaleInsert уменьшает количество готовой продукции и увеличивает бюджет предприятия на сумму продажи."),
  ...fig("14_sales_list.png", "Рис. 6. Страница продаж"),
  ...fig("15_sales_add.png",  "Рис. 7. Форма добавления продажи"),

  h2("6.4. Заявки на производство"),
  p("Обычный пользователь может отправить заявку на сборку выбранной модели. Заявка проходит несколько стадий: Создана → На проверке наличия сырья → На процессе закупки сырья → На процессе производства → На процессе продажи → Выполнена. Логика пошаговой обработки реализована в файле core/services.py и оборачивается в одну транзакцию через transaction.atomic():"),
  ...code(requestLogic),
  ...fig("21_production_request_add.png", "Рис. 8. Подача заявки на производство"),
  ...fig("20_production_requests.png",    "Рис. 9. Список заявок и их статусы"),

  h2("6.5. Выплата заработной платы"),
  p("Модуль зарплаты собирает суммарную потребность по всем сотрудникам, проверяет бюджет через sp_CheckBudget и создаёт записи о выплате для каждого сотрудника. Триггер trg_AfterSalaryInsert автоматически уменьшает бюджет."),
  ...code(salaryLogic),
  ...fig("16_salary_list.png", "Рис. 10. Страница выплат заработной платы"),

  h2("6.6. Кредиты"),
  p("Модуль кредитов позволяет оформить кредит (бюджет пополняется автоматически триггером, а TotalToPay рассчитывается по формуле простых процентов) и зарегистрировать выплаты по нему. Метод update_status() пересчитывает остаток задолженности и переводит кредит в статус paid, если он погашен полностью."),
  ...code(creditLogic),
  ...fig("18_credits_list.png", "Рис. 11. Список оформленных кредитов"),
  ...fig("19_credit_add.png",   "Рис. 12. Форма оформления нового кредита"),

  h2("6.7. Отчёты"),
  p("Страница отчётов собирает ключевые показатели предприятия: текущий бюджет, суммарные закупки, продажи, выплаты зарплаты, активные кредиты, склад комплектующих, склад готовой продукции и историю финансовых операций. Дополнительно с помощью библиотеки Chart.js строится график изменения бюджета во времени."),
  ...code(reportsLogic),
  ...fig("22_reports.png", "Рис. 13. Страница отчётов с графиком бюджета"),
  new Paragraph({ children: [new PageBreak()] }),
];

// =================================================================
// SECTION 7
// =================================================================
const testCode = `class CreditModelTests(SimpleTestCase):
    def test_credit_total_to_pay_simple_interest(self):
        credit = Credit(amount=Decimal('100000'),
                        interest_rate=Decimal('12'),
                        term_months=12)
        self.assertAlmostEqual(
            credit.calculate_total_to_pay(), 112000.0, places=2)

    def test_credit_status_default_active(self):
        credit = Credit(amount=Decimal('50000'))
        self.assertEqual(credit.status, 'active')


class RoleRoutingTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            'admin', 'a@a.kg', 'pwd')
        self.worker = User.objects.create_user('worker', 'w@a.kg', 'pwd')

    def test_admin_sees_reports(self):
        self.client.force_login(self.admin)
        resp = self.client.get(reverse('reports'))
        self.assertEqual(resp.status_code, 200)

    def test_worker_redirected_from_reports(self):
        self.client.force_login(self.worker)
        resp = self.client.get(reverse('reports'))
        self.assertEqual(resp.status_code, 302)`;

const section7 = [
  h1("7. Тестирование"),
  p("Для проверки корректности работы системы добавлены автоматические тесты на базе фреймворка Django Test. Они проверяют расчёт итоговой суммы кредита с процентами, корректность статуса по умолчанию и доступность защищённых разделов в зависимости от роли пользователя."),
  ...code(testCode),
  p("Тесты запускаются командой python manage.py test core. Помимо автотестов проводилось ручное тестирование сценариев: закупка сырья при недостаточном бюджете, попытка производства при нехватке комплектующих, последовательная подача и обработка заявки, оформление и погашение кредита, выплата зарплаты, проверка пересчёта бюджета после каждой операции."),
  ...fig("26_tests.png", "Рис. 14. Результат запуска автотестов"),
  new Paragraph({ children: [new PageBreak()] }),
];

// =================================================================
// SECTION 8
// =================================================================
const section8 = [
  h1("8. Запуск программы"),
  p("Для запуска проекта на локальном компьютере необходимо выполнить следующие шаги:"),
  numbered("Открыть проект в IDE (PyCharm, IntelliJ IDEA или Visual Studio Code)."),
  numbered("Убедиться, что Microsoft SQL Server запущен, а база данных HP_Factory существует. При необходимости создать её и применить скрипт schema.sql."),
  numbered("Проверить параметры подключения в файле hp_factory/settings.py (строки HOST и NAME раздела DATABASES)."),
  numbered("Активировать виртуальное окружение:"),
  ...code(`# Windows (PowerShell)
.venv\\Scripts\\Activate.ps1

# Linux / macOS
source .venv/bin/activate`),
  numbered("Установить зависимости:"),
  ...code(`pip install -r requirements.txt`),
  numbered("Запустить локальный сервер разработки:"),
  ...code(`python manage.py runserver`),
  numbered("Дождаться сообщения в консоли о запуске сервера:"),
  ...fig("25_runserver.png", "Рис. 15. Запуск сервера разработки"),
  numbered("Открыть браузер и перейти по адресу http://localhost:8000."),
  numbered("Войти в систему с существующей учётной записью и приступить к работе."),
  new Paragraph({ children: [new PageBreak()] }),
];

// =================================================================
// SECTION 9: Screenshots
// =================================================================
const section9 = [
  h1("9. Скриншоты программы"),
  p("При запуске приложения пользователь видит страницу авторизации, на которой запрашивается имя пользователя и пароль. Если пароль введён неверно, выводится соответствующее сообщение."),
  ...fig("01_login.png", "Рис. 16. Страница входа"),
  p("Раздел «Регистрация» позволяет новому работнику создать учётную запись. После регистрации пользователь получает базовую роль Worker."),
  ...fig("24_register.png", "Рис. 17. Страница регистрации"),
  p("После успешной авторизации администратор попадает на панель управления Dashboard, на которой отображаются ключевые финансовые показатели завода HP, последние операции, сводка по заявкам на производство и боковая панель навигации."),
  ...fig("02_dashboard.png", "Рис. 18. Панель управления"),
  p("Раздел «Сотрудники» позволяет добавлять, редактировать и удалять записи о персонале завода, а также назначать должности из справочника Positions."),
  ...fig("03_employees.png", "Рис. 19. Страница сотрудников"),
  ...fig("04_positions.png", "Рис. 20. Справочник должностей"),
  ...fig("05_units.png",     "Рис. 21. Справочник единиц измерения"),
  p("Раздел «Комплектующие» содержит список всех материалов с указанием единиц измерения, текущего остатка и стоимости запаса. Раздел «Готовая продукция» отображает модели ноутбуков и ПК с указанием их себестоимости и отпускной цены."),
  ...fig("06_raw_materials.png",     "Рис. 22. Страница комплектующих"),
  ...fig("07_finished_products.png", "Рис. 23. Страница готовой продукции"),
  ...fig("08_ingredients.png",       "Рис. 24. Рецептура сборки (Ingredients)"),
  p("Раздел «Бюджет» содержит текущее значение бюджета предприятия и возможность вручную скорректировать его (только для администратора)."),
  ...fig("09_budget.png", "Рис. 25. Страница бюджета"),
  p("Раздел «Профиль» позволяет пользователю изменить свои персональные данные и пароль."),
  ...fig("23_profile.png", "Рис. 26. Страница профиля пользователя"),
  p("Раздел «Кредиты» детально отображает оформленные кредиты с расчётом остатка задолженности и графиком ежемесячных платежей."),
  ...fig("18_credits_list.png", "Рис. 27. Подробный список кредитов"),
  new Paragraph({ children: [new PageBreak()] }),
];

// =================================================================
// SECTION 10 & 11
// =================================================================
const section10 = [
  h1("10. Заключение"),
  p("В результате выполнения курсового проекта была разработана информационная система учёта производства ноутбуков и ПК HP. Система объединяет реляционную базу данных Microsoft SQL Server и веб-приложение, построенное на фреймворке Django по архитектуре MVT. В проекте реализованы справочники единиц измерения и должностей, кадровый учёт, склад комплектующих и готовой продукции, рецептура сборки, учёт закупок, производство, продажи, выплата заработной платы, оформление и погашение кредитов, обработка пользовательских заявок и формирование аналитических отчётов."),
  p("Разработанное приложение позволяет контролировать основные производственные и финансовые процессы предприятия в едином окне. Использование транзакций, внешних ключей, хранимых процедур и AFTER INSERT-триггеров на уровне СУБД повышает надёжность обработки данных и уменьшает вероятность ошибок при выполнении бизнес-операций, поскольку часть бизнес-логики (изменение бюджета и складских остатков) исполняется атомарно вместе с пользовательскими INSERT-запросами."),
  p("В ходе работы над проектом были получены практические навыки проектирования реляционных баз данных, написания T-SQL-процедур и триггеров, разработки Django-приложений по архитектуре MVT, а также интеграции Python-приложений с Microsoft SQL Server через драйвер mssql-django."),
  new Paragraph({ children: [new PageBreak()] }),
];

const section11 = [
  h1("11. Список использованной литературы"),
  numbered("Django Software Foundation. Django Documentation. — Режим доступа: https://docs.djangoproject.com"),
  numbered("Microsoft. SQL Server Technical Documentation. — Режим доступа: https://docs.microsoft.com/sql"),
  numbered("Microsoft. mssql-django adapter documentation. — Режим доступа: https://github.com/microsoft/mssql-django"),
  numbered("Дейт К. Дж. Введение в системы баз данных. — 8-е издание. — М.: Вильямс, 2018."),
  numbered("Бизли Д. Python. Подробный справочник. — 4-е издание. — СПб.: Символ-Плюс, 2021."),
  numbered("Абалиева А. Д. Материалы по дисциплине «Системы управления базами данных». — Бишкек: КГТУ, 2026."),
  numbered("Методические материалы по выполнению курсового проекта кафедры «Программное обеспечение компьютерных систем». — Бишкек: КГТУ, 2026."),
];

// =================================================================
// DOCUMENT
// =================================================================
const doc = new Document({
  creator: "Турдумаматов Улукбек",
  title: "Курсовой проект: Учёт производства ноутбуков и ПК HP",
  styles: {
    default: { document: { run: { font: FONT, size: SIZE } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: FONT },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: FONT },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, italics: true, font: FONT },
        paragraph: { spacing: { before: 160, after: 120 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numlist", levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1440, right: 1080, bottom: 1440, left: 1700 },
      },
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ font: FONT, size: 22, children: [PageNumber.CURRENT] })],
        })],
      }),
    },
    children: [
      ...titlePage, ...tocPage,
      ...section1, ...section2, ...section3,
      ...section4, ...section5, ...section6,
      ...section7, ...section8, ...section9,
      ...section10, ...section11,
    ],
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = process.argv[2] || "out.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Wrote " + outPath + " (" + buffer.length + " bytes)");
});
