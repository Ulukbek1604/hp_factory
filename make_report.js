// Расширенный генератор отчёта HP Factory (40-60 стр, 12pt)
const docx = require('C:/Users/aisbe/AppData/Roaming/npm/node_modules/docx');
const fs = require('fs');
const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    AlignmentType, BorderStyle, WidthType, ShadingType, PageBreak
} = docx;

const FONT = "Times New Roman";
const SIZE = 24;        // 12pt
const SIZE_CODE = 20;   // 10pt
const SIZE_CAPTION = 22;
const SIZE_H1 = 28;     // 14pt
const SIZE_H2 = 26;     // 13pt

// ---------- Базовые элементы ----------
function P(text, opts = {}) {
    const { bold = false, italic = false, size = SIZE,
            align = AlignmentType.JUSTIFIED, indent = true,
            spacing = { line: 360, after: 0 }, color } = opts;
    return new Paragraph({
        alignment: align,
        spacing,
        indent: indent ? { firstLine: 720 } : undefined,
        children: [new TextRun({ text, bold, italic, size, font: FONT, color })]
    });
}
function PL(text, opts = {}) { return P(text, { ...opts, indent: false }); } // без отступа
function H1(text) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 240, after: 240, line: 360 },
        pageBreakBefore: true,
        children: [new TextRun({ text: text.toUpperCase(), bold: true, size: SIZE_H1, font: FONT })]
    });
}
function H2(text) {
    return new Paragraph({
        spacing: { before: 240, after: 120, line: 360 },
        children: [new TextRun({ text, bold: true, size: SIZE_H2, font: FONT })]
    });
}
function H3(text) {
    return new Paragraph({
        spacing: { before: 200, after: 100, line: 360 },
        children: [new TextRun({ text, bold: true, italic: true, size: SIZE, font: FONT })]
    });
}
function CENTER(text, opts = {}) {
    const { bold = false, size = SIZE, spacing = { line: 360, after: 0 } } = opts;
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing,
        children: [new TextRun({ text, bold, size, font: FONT })]
    });
}
function EMPTY() { return new Paragraph({ children: [new TextRun({ text: "", font: FONT, size: SIZE })] }); }
function PHOTO(description) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 160, after: 80, line: 360 },
        shading: { fill: "FFF4CC", type: ShadingType.CLEAR },
        border: {
            top:    { style: BorderStyle.DASHED, size: 8, color: "B58900" },
            bottom: { style: BorderStyle.DASHED, size: 8, color: "B58900" },
            left:   { style: BorderStyle.DASHED, size: 8, color: "B58900" },
            right:  { style: BorderStyle.DASHED, size: 8, color: "B58900" },
        },
        children: [
            new TextRun({ text: "[ СЮДА ВСТАВЬ ФОТО: ", bold: true, size: SIZE_CAPTION, font: FONT, color: "8B4500" }),
            new TextRun({ text: description, size: SIZE_CAPTION, font: FONT, color: "8B4500" }),
            new TextRun({ text: " ]", bold: true, size: SIZE_CAPTION, font: FONT, color: "8B4500" }),
        ]
    });
}
function FIG(num, caption) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 200 },
        children: [new TextRun({ text: `Рисунок ${num} — ${caption}`, italic: true, size: SIZE_CAPTION, font: FONT })]
    });
}
function CODE(linesArg) {
    const arr = Array.isArray(linesArg) ? linesArg : linesArg.split("\n");
    return arr.map(line => new Paragraph({
        spacing: { line: 260, after: 0 },
        shading: { fill: "F4F4F4", type: ShadingType.CLEAR },
        children: [new TextRun({ text: line || " ", font: "Consolas", size: SIZE_CODE })]
    }));
}
function BULLET(text) {
    return new Paragraph({
        spacing: { line: 360, after: 0 },
        indent: { left: 720, hanging: 360 },
        children: [
            new TextRun({ text: "•   ", size: SIZE, font: FONT }),
            new TextRun({ text, size: SIZE, font: FONT })
        ]
    });
}

let figCounter = 0;
function nextFig() { return ++figCounter; }
function SHOT(desc, caption) {
    const n = nextFig();
    return [ PHOTO(desc), FIG(n, caption) ];
}

// =====================================================
// ТРТУЛЬНЫЙ ЛРСТ
// =====================================================
const titlePage = [
    CENTER("МРНРСТЕРСТВО ОБРАЗОВАНРЯ Р НАУКР", { bold: true, size: 24 }),
    CENTER("КЫРГЫЗСКОЙ РЕСПУБЛРКР", { bold: true, size: 24 }),
    EMPTY(),
    CENTER("КЫРГЫЗСКРЙ ГОСУДАРСТВЕННЫЙ ТЕХНРЧЕСКРЙ", { bold: true, size: 24 }),
    CENTER("УНРВЕРСРТЕТ им. Р. РАЗЗАКОВА", { bold: true, size: 24 }),
    EMPTY(),
    CENTER("Рнститут информационных технологий", { size: 24 }),
    CENTER("Кафедра «Программное обеспечение компьютерных систем»", { size: 24 }),
    EMPTY(), EMPTY(), EMPTY(), EMPTY(),
    CENTER("ОТЧЁТ", { bold: true, size: 44 }),
    CENTER("по курсовому проекту", { size: 28 }),
    EMPTY(),
    CENTER("на тему:", { size: 24 }),
    EMPTY(),
    CENTER("«Разработка информационной системы управления", { bold: true, size: 28 }),
    CENTER("производственным предприятием HP Factory»", { bold: true, size: 28 }),
    EMPTY(), EMPTY(),
    CENTER("по дисциплине: «Системы управления базами данных»", { italic: true, size: 24 }),
    EMPTY(), EMPTY(), EMPTY(), EMPTY(),
    new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { line: 360 },
        children: [new TextRun({ text: "Выполнил(а): студент(ка) гр. ПР-3-23", size: 24, font: FONT })]
    }),
    new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { line: 360 },
        children: [new TextRun({ text: "________________________________", size: 24, font: FONT })]
    }),
    EMPTY(),
    new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { line: 360 },
        children: [new TextRun({ text: "Проверил(а): преп. Абалиева А.Д.", size: 24, font: FONT })]
    }),
    new Paragraph({
        alignment: AlignmentType.RIGHT,
        spacing: { line: 360 },
        children: [new TextRun({ text: "________________________________", size: 24, font: FONT })]
    }),
    EMPTY(), EMPTY(), EMPTY(), EMPTY(), EMPTY(),
    CENTER("Бишкек — 2026", { bold: true, size: 26 }),
];

// =====================================================
// СОДЕРЖАНРЕ
// =====================================================
const tocPage = [
    H1("Содержание"),
    PL("Введение ........................................................................................................ 3"),
    PL("1. Описание предметной области и постановка задачи ............................... 4"),
    PL("   1.1. Анализ деятельности предприятия .................................................... 4"),
    PL("   1.2. Постановка задачи .............................................................................. 5"),
    PL("   1.3. Функциональные требования ............................................................. 5"),
    PL("2. Проектирование базы данных .................................................................... 7"),
    PL("   2.1. Создание базы данных ........................................................................ 7"),
    PL("   2.2. Описание таблиц базы данных ........................................................... 8"),
    PL("   2.3. ER-диаграмма базы данных ............................................................... 14"),
    PL("   2.4. Хранимые процедуры ........................................................................ 15"),
    PL("   2.5. Триггеры базы данных ...................................................................... 17"),
    PL("3. Разработка веб-приложения на Django ................................................... 22"),
    PL("   3.1. Создание проекта и настройка окружения ....................................... 22"),
    PL("   3.2. Конфигурация settings.py ................................................................. 23"),
    PL("   3.3. Структура проекта ............................................................................. 25"),
    PL("   3.4. Модели данных (models.py) .............................................................. 26"),
    PL("   3.5. Формы (forms.py) ............................................................................. 32"),
    PL("   3.6. Представления (views.py) ................................................................. 34"),
    PL("   3.7. URL-маршрутизация (urls.py) ........................................................... 40"),
    PL("   3.8. Шаблоны интерфейса (templates) ..................................................... 41"),
    PL("4. Реализованные модули (лабораторные работы) ..................................... 44"),
    PL("   4.1. Лабораторная №1: Закупка сырья ..................................................... 44"),
    PL("   4.2. Лабораторная №2: Производство ..................................................... 46"),
    PL("   4.3. Лабораторная №3: Продажа продукции ........................................... 48"),
    PL("   4.4. Лабораторная №4: Заработная плата ................................................ 49"),
    PL("   4.5. Лабораторная №5: Кредиты ............................................................... 51"),
    PL("   4.6. Лабораторная №6: Отчёты и аналитика ........................................... 53"),
    PL("5. Безопасность и аутентификация ............................................................. 55"),
    PL("6. Тестирование системы ............................................................................ 57"),
    PL("Заключение ................................................................................................. 59"),
    PL("Список использованной литературы ........................................................... 60"),
];

// =====================================================
// ВВЕДЕНРЕ
// =====================================================
const intro = [
    H1("Введение"),
    P("В условиях современного производства эффективное управление ресурсами предприятия невозможно без применения автоматизированных информационных систем. Системы управления базами данных (СУБД) являются ключевым звеном таких решений, обеспечивая надёжное хранение, целостность и быстрый доступ к большим объёмам структурированных данных. Современные предприятия — от небольших мастерских до крупных промышленных корпораций — нуждаются в инструментах учёта движения сырья, контроля производственных циклов, отслеживания продаж, расчётов с персоналом и работы с финансовыми обязательствами."),
    P("Целью настоящего курсового проекта является разработка информационной системы «HP Factory», предназначенной для автоматизации деятельности производственного предприятия, специализирующегося на сборке персональных компьютеров и ноутбуков. Разрабатываемая система должна реализовывать полный бизнес-цикл предприятия: закупка сырья и комплектующих у поставщиков, производство готовой продукции согласно технологическим картам, реализация готовой продукции, выплата заработной платы сотрудникам, работа с банковскими кредитами и формирование аналитической отчётности."),
    P("Особое внимание уделено проектированию серверной части — реляционной базы данных на платформе Microsoft SQL Server. Бизнес-логика максимально вынесена на уровень СУБД: критически важные правила реализованы через хранимые процедуры и триггеры, что обеспечивает целостность данных независимо от клиентского приложения и позволяет легко расширять функциональность без необходимости менять код всех клиентов."),
    P("Для достижения поставленной цели в работе решены следующие задачи:"),
    BULLET("проведён анализ предметной области и сформулированы требования к системе;"),
    BULLET("спроектирована реляционная база данных, включающая 13 связанных таблиц;"),
    BULLET("разработаны хранимые процедуры для проверки достаточности бюджета и наличия сырья;"),
    BULLET("создано 6 триггеров уровня AFTER INSERT, реализующих автоматические побочные эффекты бизнес-операций;"),
    BULLET("разработано веб-приложение на фреймворке Django (Python) с использованием подхода «database-first»;"),
    BULLET("реализован удобный пользовательский интерфейс с системой аутентификации и разграничением доступа;"),
    BULLET("сформированы аналитические отчёты и графики с использованием библиотеки Chart.js;"),
    BULLET("проведено тестирование всех модулей системы."),
    P("Технологический стек проекта: язык программирования Python 3.10+, веб-фреймворк Django 4.2, СУБД Microsoft SQL Server 2019, библиотеки mssql-django и pyodbc для подключения, технологии разметки HTML5/CSS3, язык программирования JavaScript, библиотека построения диаграмм Chart.js, среда разработки Visual Studio Code, среда работы с базой данных SQL Server Management Studio."),
    P("Структура работы. Отчёт состоит из шести основных разделов. Первый раздел посвящён описанию предметной области и формулировке требований. Во втором разделе изложено проектирование базы данных: схема таблиц, ER-диаграмма, хранимые процедуры и триггеры. Третий раздел описывает разработку веб-приложения на Django: настройку проекта, модели, представления, формы и шаблоны. В четвёртом разделе подробно рассмотрена реализация каждой из шести лабораторных работ. Пятый раздел посвящён вопросам безопасности и аутентификации. Шестой раздел содержит описание процесса тестирования и демонстрацию работы системы."),
];

// =====================================================
// РАЗДЕЛ 1
// =====================================================
const sec1 = [
    H1("1. Описание предметной области и постановка задачи"),

    H2("1.1. Анализ деятельности предприятия"),
    P("Предметной областью разрабатываемой системы является производственное предприятие «HP Factory», специализирующееся на сборке компьютерной техники — настольных персональных компьютеров и ноутбуков. Деятельность предприятия охватывает несколько взаимосвязанных бизнес-процессов, каждый из которых требует учёта и контроля."),
    P("Основной производственный цикл предприятия начинается с закупки комплектующих и сырья у поставщиков. Это могут быть как готовые компоненты (процессоры, оперативная память, накопители, материнские платы, корпуса, блоки питания), так и расходные материалы (термопаста, провода, винты, упаковочные материалы). Каждая закупка фиксируется в системе с указанием количества, цены за единицу и общей суммы; ответственный за закупку сотрудник также регистрируется."),
    P("После накопления необходимого запаса сырья запускается производственный процесс. Каждое изделие имеет свою технологическую карту (рецептуру), описывающую, какие комплектующие и в каком количестве требуются для его сборки. Например, для производства одной единицы ноутбука «HP ProBook» может потребоваться: 1 процессор, 1 материнская плата, 2 модуля памяти, 1 SSD-накопитель, 1 корпус и т.д. Производство возможно только при наличии всех необходимых комплектующих в достаточном количестве."),
    P("Готовая продукция размещается на складе и может быть продана покупателям. Каждая продажа фиксируется с указанием модели, количества и общей суммы выручки. Полученные средства поступают в бюджет предприятия. Регулярно с этого бюджета выплачивается заработная плата сотрудникам согласно их должностным окладам."),
    P("При необходимости расширения производства или покрытия временных кассовых разрывов предприятие может привлекать кредитные средства. Кредит характеризуется суммой, процентной ставкой, сроком, и порождает обязательства по периодическим выплатам, состоящим из погашения основного долга и процентов."),

    H2("1.2. Постановка задачи"),
    P("Перед разработчиком стоит задача спроектировать и реализовать информационную систему, которая будет автоматизировать перечисленные бизнес-процессы. Система должна предоставлять удобный пользовательский интерфейс для регистрации всех видов операций, автоматически поддерживать целостность данных (например, не допускать продажу продукции, которой нет на складе, или выплату зарплаты при недостатке средств в бюджете) и формировать аналитическую отчётность для руководства."),

    H2("1.3. Функциональные требования"),
    P("Система должна обеспечивать выполнение следующих функциональных требований:"),
    BULLET("ведение справочников: сотрудники, должности, единицы измерения, сырьё, готовая продукция, рецептуры;"),
    BULLET("регистрация закупок сырья с автоматическим обновлением остатков и уменьшением бюджета;"),
    BULLET("регистрация производственных операций с автоматическим списанием сырья и пополнением запасов готовой продукции;"),
    BULLET("регистрация продаж с автоматическим уменьшением запасов и пополнением бюджета;"),
    BULLET("учёт выплат заработной платы с проверкой достаточности средств;"),
    BULLET("работа с кредитами: получение, начисление процентов, регистрация платежей, отслеживание статуса;"),
    BULLET("аутентификация пользователей с защищённым хранением паролей;"),
    BULLET("формирование сводных отчётов с визуализацией данных в виде графиков;"),
    BULLET("проверка достаточности бюджета перед расходными операциями;"),
    BULLET("проверка наличия сырья перед запуском производства."),
    P("К нефункциональным требованиям относятся: устойчивая работа при одновременном доступе нескольких пользователей; защита от несанкционированного доступа; целостность данных; локализация интерфейса на русском языке; адаптивный дизайн, корректно отображающийся на различных устройствах."),
    ...SHOT("Главная страница системы (Dashboard) после входа", "Главная страница (Dashboard) — обзор показателей предприятия"),
];

// =====================================================
// РАЗДЕЛ 2 — БАЗА ДАННЫХ
// =====================================================
const sec2 = [
    H1("2. Проектирование базы данных"),

    H2("2.1. Создание базы данных"),
    P("База данных HP_Factory разработана в среде Microsoft SQL Server Management Studio (SSMS). Создание базы данных выполняется простой командой языка T-SQL:"),
    ...CODE([
        "CREATE DATABASE HP_Factory;",
        "GO",
        "USE HP_Factory;",
        "GO"
    ]),
    EMPTY(),
    P("После создания базы данных выполняется скрипт schema.sql, содержащий полное описание схемы: создание всех таблиц, ограничений целостности, индексов, хранимых процедур и триггеров. Скрипт построен таким образом, чтобы его можно было запускать многократно без потери данных — каждый объект создаётся с проверкой существования через конструкцию IF NOT EXISTS."),
    ...SHOT("Окно SQL Server Management Studio с подключением к серверу и базой HP_Factory в Object Explorer", "Подключение к Microsoft SQL Server в SSMS"),
    ...SHOT("Запуск скрипта CREATE DATABASE HP_Factory в окне New Query SSMS с сообщением \"Commands completed successfully\"", "Создание базы данных HP_Factory"),
    ...SHOT("Раскрытый узел Databases → HP_Factory → Tables со списком всех 13 таблиц в Object Explorer", "Список таблиц базы данных в Object Explorer"),

    H2("2.2. Описание таблиц базы данных"),
    P("База данных содержит 13 основных таблиц, охватывающих все аспекты деятельности предприятия. Ниже приведено подробное описание каждой таблицы с указанием её назначения, состава полей и связей с другими таблицами."),

    H3("Таблица Budget — Бюджет предприятия"),
    P("Назначение: хранит текущее состояние финансового бюджета предприятия. Содержит ровно одну строку (с id = 1), значение которой обновляется автоматически триггерами при выполнении расходных и доходных операций."),
    ...CODE([
        "CREATE TABLE Budget (",
        "    id INT IDENTITY(1,1) PRIMARY KEY,",
        "    TotalAmount DECIMAL(18,2) NOT NULL DEFAULT 0",
        ");",
        "INSERT INTO Budget (TotalAmount) VALUES (1000000);"
    ]),
    EMPTY(),

    H3("Таблица Units — Единицы измерения"),
    P("Назначение: справочник единиц измерения, используемых для сырья и готовой продукции (штука, килограмм, литр, метр и т.д.). На эту таблицу ссылаются справочники RawMaterials и FinishedProducts."),
    ...CODE([
        "CREATE TABLE Units (",
        "    id INT IDENTITY(1,1) PRIMARY KEY,",
        "    Name NVARCHAR(50) NOT NULL UNIQUE",
        ");"
    ]),
    EMPTY(),

    H3("Таблица Positions — Должности"),
    P("Назначение: справочник должностей сотрудников предприятия (директор, менеджер, кладовщик, сборщик и т.д.). На эту таблицу ссылается таблица Employees."),
    ...CODE([
        "CREATE TABLE Positions (",
        "    id INT IDENTITY(1,1) PRIMARY KEY,",
        "    Title NVARCHAR(100) NOT NULL",
        ");"
    ]),
    EMPTY(),

    H3("Таблица Employees — Сотрудники"),
    P("Назначение: содержит информацию обо всех работниках предприятия: полное имя, должность, оклад, адрес проживания и контактный телефон. Сотрудники указываются как ответственные при регистрации закупок, производства, продаж."),
    ...CODE([
        "CREATE TABLE Employees (",
        "    id INT IDENTITY(1,1) PRIMARY KEY,",
        "    FullName NVARCHAR(150) NOT NULL,",
        "    PositionID INT NULL,",
        "    Salary DECIMAL(18,2) NOT NULL,",
        "    Address NVARCHAR(255) NULL,",
        "    Phone NVARCHAR(20) NULL,",
        "    CONSTRAINT FK_Employees_Positions",
        "        FOREIGN KEY (PositionID) REFERENCES Positions(id)",
        ");"
    ]),
    EMPTY(),

    H3("Таблица RawMaterials — Сырьё"),
    P("Назначение: справочник комплектующих и расходных материалов с указанием текущего остатка на складе и общей стоимости. Поле Quantity автоматически увеличивается при закупках и уменьшается при производстве."),
    ...CODE([
        "CREATE TABLE RawMaterials (",
        "    id INT IDENTITY(1,1) PRIMARY KEY,",
        "    Name NVARCHAR(100) NOT NULL,",
        "    UnitID INT NULL,",
        "    Quantity FLOAT NOT NULL DEFAULT 0,",
        "    SumAmount FLOAT NOT NULL DEFAULT 0,",
        "    CONSTRAINT FK_RawMaterials_Units",
        "        FOREIGN KEY (UnitID) REFERENCES Units(id)",
        ");"
    ]),
    EMPTY(),
    ...SHOT("Окно дизайнера таблицы RawMaterials в SSMS со всеми столбцами, типами данных и внешним ключом", "Структура таблицы RawMaterials"),

    H3("Таблица FinishedProducts — Готовая продукция"),
    P("Назначение: справочник готовых изделий, выпускаемых предприятием (модели ноутбуков, ПК). Содержит наименование, единицу измерения, текущий остаток на складе и цену реализации. Остаток увеличивается при производстве и уменьшается при продаже."),
    ...CODE([
        "CREATE TABLE FinishedProducts (",
        "    id INT IDENTITY(1,1) PRIMARY KEY,",
        "    Name NVARCHAR(100) NOT NULL,",
        "    UnitID INT NULL,",
        "    Quantity FLOAT NOT NULL DEFAULT 0,",
        "    SumAmount FLOAT NOT NULL DEFAULT 0,",
        "    SellingPrice DECIMAL(18,2) NOT NULL DEFAULT 0,",
        "    CONSTRAINT FK_FinishedProducts_Units",
        "        FOREIGN KEY (UnitID) REFERENCES Units(id)",
        ");"
    ]),
    EMPTY(),

    H3("Таблица Ingredients — Рецептура"),
    P("Назначение: реализует понятие \"Bill of Materials\" (BOM) — описывает, какое сырьё и в каком количестве требуется на единицу выпуска готовой продукции. Каждая запись связывает один продукт с одним материалом и указывает норму расхода."),
    ...CODE([
        "CREATE TABLE Ingredients (",
        "    id INT IDENTITY(1,1) PRIMARY KEY,",
        "    ProductID INT NOT NULL,",
        "    MaterialID INT NOT NULL,",
        "    Quantity FLOAT NOT NULL,",
        "    CONSTRAINT FK_Ingredients_Product",
        "        FOREIGN KEY (ProductID) REFERENCES FinishedProducts(id),",
        "    CONSTRAINT FK_Ingredients_Material",
        "        FOREIGN KEY (MaterialID) REFERENCES RawMaterials(id)",
        ");"
    ]),
    EMPTY(),

    H3("Таблица RawMaterialPurchases — Закупки сырья"),
    P("Назначение: журнал всех операций по закупке сырья. Каждая запись содержит ссылку на тип закупленного материала, количество, общую сумму, дату операции и идентификатор сотрудника, оформившего закупку."),
    ...CODE([
        "CREATE TABLE RawMaterialPurchases (",
        "    id INT IDENTITY(1,1) PRIMARY KEY,",
        "    MaterialID INT NOT NULL,",
        "    Quantity FLOAT NOT NULL,",
        "    SumAmount DECIMAL(18,2) NOT NULL,",
        "    PurchaseDate DATETIME NOT NULL DEFAULT GETDATE(),",
        "    EmployeeID INT NULL,",
        "    CONSTRAINT FK_Purchases_Material",
        "        FOREIGN KEY (MaterialID) REFERENCES RawMaterials(id),",
        "    CONSTRAINT FK_Purchases_Employee",
        "        FOREIGN KEY (EmployeeID) REFERENCES Employees(id)",
        ");"
    ]),
    EMPTY(),

    H3("Таблица ProductProduction — Производство"),
    P("Назначение: журнал производственных операций. Каждая запись фиксирует выпуск определённого количества готовой продукции с указанием даты и ответственного сотрудника."),
    ...CODE([
        "CREATE TABLE ProductProduction (",
        "    id INT IDENTITY(1,1) PRIMARY KEY,",
        "    ProductID INT NOT NULL,",
        "    Quantity FLOAT NOT NULL,",
        "    ProductionDate DATETIME NOT NULL DEFAULT GETDATE(),",
        "    EmployeeID INT NULL,",
        "    CONSTRAINT FK_Production_Product",
        "        FOREIGN KEY (ProductID) REFERENCES FinishedProducts(id),",
        "    CONSTRAINT FK_Production_Employee",
        "        FOREIGN KEY (EmployeeID) REFERENCES Employees(id)",
        ");"
    ]),
    EMPTY(),

    H3("Таблица ProductSales — Продажи"),
    P("Назначение: журнал продаж готовой продукции. Содержит ссылку на проданный продукт, количество, сумму выручки, дату продажи и сотрудника-продавца."),
    ...CODE([
        "CREATE TABLE ProductSales (",
        "    id INT IDENTITY(1,1) PRIMARY KEY,",
        "    ProductID INT NOT NULL,",
        "    Quantity FLOAT NOT NULL,",
        "    SumAmount DECIMAL(18,2) NOT NULL,",
        "    SaleDate DATETIME NOT NULL DEFAULT GETDATE(),",
        "    EmployeeID INT NULL,",
        "    CONSTRAINT FK_Sales_Product",
        "        FOREIGN KEY (ProductID) REFERENCES FinishedProducts(id),",
        "    CONSTRAINT FK_Sales_Employee",
        "        FOREIGN KEY (EmployeeID) REFERENCES Employees(id)",
        ");"
    ]),
    EMPTY(),

    H3("Таблица SalaryPayments — Выплаты заработной платы"),
    P("Назначение: журнал выплат заработной платы сотрудникам. Каждая запись связывает сотрудника с фактически выплаченной ему суммой и датой выплаты."),
    ...CODE([
        "CREATE TABLE SalaryPayments (",
        "    id INT IDENTITY(1,1) PRIMARY KEY,",
        "    EmployeeID INT NOT NULL,",
        "    Amount DECIMAL(18,2) NOT NULL,",
        "    PaymentDate DATETIME NOT NULL DEFAULT GETDATE(),",
        "    CONSTRAINT FK_Salary_Employee",
        "        FOREIGN KEY (EmployeeID) REFERENCES Employees(id)",
        ");"
    ]),
    EMPTY(),

    H3("Таблица Credits — Кредиты"),
    P("Назначение: журнал кредитов, полученных предприятием. Каждый кредит характеризуется суммой, процентной ставкой, сроком в месяцах, статусом (активный / погашен / просрочен), общей суммой к выплате и датой получения."),
    ...CODE([
        "CREATE TABLE Credits (",
        "    id INT IDENTITY(1,1) PRIMARY KEY,",
        "    Amount DECIMAL(18,2) NOT NULL,",
        "    InterestRate DECIMAL(5,2) NULL,",
        "    TermMonths INT NULL,",
        "    StartDate DATETIME NULL,",
        "    Status NVARCHAR(20) NOT NULL DEFAULT 'active',",
        "    TotalToPay DECIMAL(18,2) NULL,",
        "    CreditDate DATETIME NOT NULL DEFAULT GETDATE()",
        ");"
    ]),
    EMPTY(),

    H3("Таблица CreditPayments — Выплаты по кредитам"),
    P("Назначение: журнал платежей по кредитам. Каждая выплата связана с конкретным кредитом, содержит сумму, дату, тип (основной долг, проценты, штраф или совместная выплата) и текстовое примечание."),
    ...CODE([
        "CREATE TABLE CreditPayments (",
        "    id INT IDENTITY(1,1) PRIMARY KEY,",
        "    CreditID INT NOT NULL,",
        "    Amount DECIMAL(18,2) NOT NULL,",
        "    PaymentDate DATETIME NOT NULL DEFAULT GETDATE(),",
        "    PaymentType NVARCHAR(20) NOT NULL DEFAULT 'combined',",
        "    Note NVARCHAR(MAX) NULL,",
        "    CONSTRAINT FK_CreditPayments_Credit",
        "        FOREIGN KEY (CreditID) REFERENCES Credits(id)",
        ");"
    ]),
    EMPTY(),
    ...SHOT("Окно SSMS с открытой таблицей Credits в режиме редактирования (Edit Top 200 Rows) с несколькими записями кредитов", "Просмотр содержимого таблицы Credits"),

    H2("2.3. ER-диаграмма базы данных"),
    P("Все таблицы базы данных HP_Factory связаны между собой через систему внешних ключей, образуя единую реляционную модель. На приведённой ниже ER-диаграмме показаны все сущности и связи между ними. Центральное место занимает таблица Employees — на сотрудников ссылаются журналы операций (закупки, производство, продажи, выплаты)."),
    ...SHOT("ER-диаграмма базы данных HP_Factory из Database Diagrams в SSMS со всеми таблицами и связями", "ER-диаграмма базы данных HP_Factory"),
    P("Диаграмма позволяет наглядно увидеть основные группы таблиц: справочники (Units, Positions, Employees, RawMaterials, FinishedProducts, Ingredients), журналы операций (RawMaterialPurchases, ProductProduction, ProductSales, SalaryPayments), модуль кредитов (Credits, CreditPayments) и таблицу финансового состояния (Budget)."),

    H2("2.4. Хранимые процедуры"),
    P("Для централизованной реализации бизнес-логики на стороне сервера базы данных созданы две хранимые процедуры. Использование процедур позволяет инкапсулировать сложную логику и гарантировать её применение независимо от клиентского приложения."),

    H3("Процедура sp_CheckBudget — Проверка достаточности бюджета"),
    P("Назначение: процедура принимает требуемую сумму расхода и возвращает через выходной параметр код результата (0 — операция разрешена, 1 — недостаточно средств). Вызывается перед операциями закупки сырья, выплаты зарплаты и платежей по кредитам."),
    ...CODE([
        "CREATE PROCEDURE sp_CheckBudget",
        "    @RequiredAmount DECIMAL(18,2),",
        "    @IsAllowed INT OUTPUT",
        "AS",
        "BEGIN",
        "    SET NOCOUNT ON;",
        "    DECLARE @Current DECIMAL(18,2);",
        "    SELECT @Current = TotalAmount",
        "      FROM Budget WHERE id = 1;",
        "    IF @Current >= @RequiredAmount",
        "        SET @IsAllowed = 0;  -- средств достаточно",
        "    ELSE",
        "        SET @IsAllowed = 1;  -- средств не хватает",
        "END;"
    ]),
    EMPTY(),

    H3("Процедура sp_CheckMaterialAvailability — Проверка наличия сырья"),
    P("Назначение: процедура проверяет, достаточно ли всех необходимых ингредиентов на складе для производства заданного количества единиц указанного продукта согласно его рецептуре. Возвращает код результата."),
    ...CODE([
        "CREATE PROCEDURE sp_CheckMaterialAvailability",
        "    @ProductID INT,",
        "    @Quantity FLOAT,",
        "    @IsAvailable INT OUTPUT",
        "AS",
        "BEGIN",
        "    SET NOCOUNT ON;",
        "    DECLARE @Missing INT = 0;",
        "    SELECT @Missing = COUNT(*)",
        "    FROM Ingredients i",
        "    INNER JOIN RawMaterials rm ON rm.id = i.MaterialID",
        "    WHERE i.ProductID = @ProductID",
        "      AND rm.Quantity < i.Quantity * @Quantity;",
        "    IF @Missing = 0",
        "        SET @IsAvailable = 0;",
        "    ELSE",
        "        SET @IsAvailable = 1;",
        "END;"
    ]),
    EMPTY(),
    ...SHOT("Список хранимых процедур в Object Explorer SSMS: Programmability → Stored Procedures", "Хранимые процедуры в Object Explorer"),
    ...SHOT("Окно редактирования процедуры sp_CheckBudget в SSMS", "Код хранимой процедуры sp_CheckBudget"),

    H2("2.5. Триггеры базы данных"),
    P("Триггеры являются ключевым элементом бизнес-логики системы. Они автоматически выполняются при изменении данных в определённых таблицах и обеспечивают побочные эффекты — обновление связанных таблиц. Благодаря триггерам клиентское приложение должно выполнять только операции INSERT, не заботясь об обновлении бюджета и складских остатков."),

    H3("Триггер trg_AfterPurchaseInsert"),
    P("Назначение: срабатывает после добавления записи в таблицу RawMaterialPurchases (закупка сырья). Выполняет два действия: уменьшает бюджет предприятия на сумму закупки и увеличивает остаток соответствующего сырья на складе."),
    ...CODE([
        "CREATE TRIGGER trg_AfterPurchaseInsert",
        "ON RawMaterialPurchases",
        "AFTER INSERT",
        "AS",
        "BEGIN",
        "    SET NOCOUNT ON;",
        "    -- 1) уменьшаем бюджет",
        "    UPDATE Budget",
        "    SET TotalAmount = TotalAmount - i.SumAmount",
        "    FROM Budget b CROSS JOIN inserted i",
        "    WHERE b.id = 1;",
        "    -- 2) увеличиваем запас сырья",
        "    UPDATE rm",
        "    SET rm.Quantity = rm.Quantity + i.Quantity,",
        "        rm.SumAmount = rm.SumAmount + i.SumAmount",
        "    FROM RawMaterials rm",
        "    INNER JOIN inserted i ON rm.id = i.MaterialID;",
        "END;"
    ]),
    EMPTY(),

    H3("Триггер trg_AfterProductionInsert"),
    P("Назначение: срабатывает после добавления записи в таблицу ProductProduction (выпуск продукции). Выполняет два действия: увеличивает запас готовой продукции и списывает со склада сырьё в соответствии с рецептурой."),
    ...CODE([
        "CREATE TRIGGER trg_AfterProductionInsert",
        "ON ProductProduction",
        "AFTER INSERT",
        "AS",
        "BEGIN",
        "    SET NOCOUNT ON;",
        "    -- 1) увеличиваем количество готовой продукции",
        "    UPDATE fp",
        "    SET fp.Quantity = fp.Quantity + i.Quantity",
        "    FROM FinishedProducts fp",
        "    INNER JOIN inserted i ON fp.id = i.ProductID;",
        "    -- 2) списываем сырьё по рецептуре",
        "    UPDATE rm",
        "    SET rm.Quantity = rm.Quantity",
        "        - (ing.Quantity * i.Quantity)",
        "    FROM RawMaterials rm",
        "    INNER JOIN Ingredients ing ON ing.MaterialID = rm.id",
        "    INNER JOIN inserted i ON i.ProductID = ing.ProductID;",
        "END;"
    ]),
    EMPTY(),

    H3("Триггер trg_AfterSaleInsert"),
    P("Назначение: срабатывает после добавления записи в таблицу ProductSales (продажа). Выполняет два действия: уменьшает количество готовой продукции на складе и увеличивает бюджет предприятия на сумму выручки."),
    ...CODE([
        "CREATE TRIGGER trg_AfterSaleInsert",
        "ON ProductSales",
        "AFTER INSERT",
        "AS",
        "BEGIN",
        "    SET NOCOUNT ON;",
        "    -- 1) уменьшаем складские остатки",
        "    UPDATE fp",
        "    SET fp.Quantity = fp.Quantity - i.Quantity",
        "    FROM FinishedProducts fp",
        "    INNER JOIN inserted i ON fp.id = i.ProductID;",
        "    -- 2) пополняем бюджет",
        "    UPDATE Budget",
        "    SET TotalAmount = TotalAmount + i.SumAmount",
        "    FROM Budget b CROSS JOIN inserted i",
        "    WHERE b.id = 1;",
        "END;"
    ]),
    EMPTY(),

    H3("Триггер trg_AfterSalaryInsert"),
    P("Назначение: срабатывает после добавления записи в таблицу SalaryPayments (выплата ЗП). Уменьшает бюджет предприятия на сумму выплаченной заработной платы."),
    ...CODE([
        "CREATE TRIGGER trg_AfterSalaryInsert",
        "ON SalaryPayments",
        "AFTER INSERT",
        "AS",
        "BEGIN",
        "    SET NOCOUNT ON;",
        "    UPDATE Budget",
        "    SET TotalAmount = TotalAmount - i.Amount",
        "    FROM Budget b CROSS JOIN inserted i",
        "    WHERE b.id = 1;",
        "END;"
    ]),
    EMPTY(),

    H3("Триггер trg_AfterCreditInsert"),
    P("Назначение: срабатывает после добавления записи в таблицу Credits (получение кредита). Выполняет два действия: увеличивает бюджет предприятия на сумму выданного кредита и автоматически рассчитывает поле TotalToPay (общая сумма к возврату с учётом процентов)."),
    ...CODE([
        "CREATE TRIGGER trg_AfterCreditInsert",
        "ON Credits",
        "AFTER INSERT",
        "AS",
        "BEGIN",
        "    SET NOCOUNT ON;",
        "    -- 1) пополняем бюджет",
        "    UPDATE Budget",
        "    SET TotalAmount = TotalAmount + i.Amount",
        "    FROM Budget b CROSS JOIN inserted i",
        "    WHERE b.id = 1;",
        "    -- 2) рассчитываем сумму к выплате (простой процент)",
        "    UPDATE c",
        "    SET TotalToPay = i.Amount +",
        "        (i.Amount * ISNULL(i.InterestRate,0)/100/12",
        "         * ISNULL(i.TermMonths,0))",
        "    FROM Credits c",
        "    INNER JOIN inserted i ON c.id = i.id;",
        "END;"
    ]),
    EMPTY(),

    H3("Триггер trg_AfterCreditPaymentInsert"),
    P("Назначение: срабатывает после добавления записи в таблицу CreditPayments (платёж по кредиту). Выполняет два действия: уменьшает бюджет предприятия на сумму платежа и обновляет статус соответствующего кредита (если задолженность полностью погашена — статус меняется на 'paid')."),
    ...CODE([
        "CREATE TRIGGER trg_AfterCreditPaymentInsert",
        "ON CreditPayments",
        "AFTER INSERT",
        "AS",
        "BEGIN",
        "    SET NOCOUNT ON;",
        "    -- 1) уменьшаем бюджет",
        "    UPDATE Budget",
        "    SET TotalAmount = TotalAmount - i.Amount",
        "    FROM Budget b CROSS JOIN inserted i",
        "    WHERE b.id = 1;",
        "    -- 2) если полный возврат — обновляем статус",
        "    UPDATE c",
        "    SET Status = 'paid'",
        "    FROM Credits c",
        "    INNER JOIN inserted i ON c.id = i.CreditID",
        "    WHERE (SELECT ISNULL(SUM(Amount),0) FROM CreditPayments",
        "           WHERE CreditID = c.id)",
        "          >= ISNULL(c.TotalToPay, c.Amount);",
        "END;"
    ]),
    EMPTY(),
    ...SHOT("Список всех триггеров в Object Explorer (раскрытые узлы Triggers под каждой таблицей)", "Триггеры в Object Explorer SSMS"),
    ...SHOT("Открытый код триггера trg_AfterPurchaseInsert в окне редактирования SSMS", "Код триггера trg_AfterPurchaseInsert"),
];

// =====================================================
// РАЗДЕЛ 3 — DJANGO
// =====================================================
const sec3 = [
    H1("3. Разработка веб-приложения на Django"),

    H2("3.1. Создание проекта и настройка окружения"),
    P("В качестве платформы для разработки клиентской части системы выбран фреймворк Django — один из самых популярных и зрелых веб-фреймворков для языка Python. Django реализует архитектурный паттерн MVT (Model-View-Template), близкий к классическому MVC, и предоставляет богатый набор готовых компонентов: ORM, систему аутентификации, формы, шаблонизатор, административный интерфейс."),
    P("Для разработки создаётся виртуальное окружение Python, в которое устанавливаются необходимые зависимости:"),
    ...CODE([
        "python -m venv .venv",
        ".\\.venv\\Scripts\\Activate.ps1",
        "pip install django==4.2",
        "pip install mssql-django",
        "pip install pyodbc",
        "pip install argon2-cffi"
    ]),
    EMPTY(),
    P("После установки зависимостей создаётся новый Django-проект и приложение внутри него:"),
    ...CODE([
        "django-admin startproject hp_factory",
        "cd hp_factory",
        "python manage.py startapp core"
    ]),
    EMPTY(),
    ...SHOT("Окно PowerShell с выполнением команд создания виртуального окружения и установки пакетов pip", "Создание виртуального окружения и установка зависимостей"),
    ...SHOT("Окно PowerShell с выполнением команд django-admin startproject и startapp core", "Создание Django-проекта и приложения"),

    H2("3.2. Конфигурация settings.py"),
    P("Главный файл конфигурации проекта — hp_factory/settings.py. В нём настраиваются подключение к базе данных, список установленных приложений, шаблоны, локализация, статические файлы и алгоритмы хеширования паролей. Особое внимание уделяется настройке подключения к Microsoft SQL Server:"),
    ...CODE([
        "DATABASES = {",
        "    'default': {",
        "        'ENGINE': 'mssql',",
        "        'NAME': 'HP_Factory',",
        "        'HOST': '.\\\\SQLEXPRESS',",
        "        'PORT': '',",
        "        'USER': '',",
        "        'PASSWORD': '',",
        "        'OPTIONS': {",
        "            'driver': 'ODBC Driver 17 for SQL Server',",
        "            'Trusted_Connection': 'yes',",
        "        },",
        "    }",
        "}"
    ]),
    EMPTY(),
    P("Параметр Trusted_Connection=yes означает использование интегрированной аутентификации Windows. Для работы подключения требуется установленный на компьютере драйвер ODBC Driver 17 for SQL Server."),
    P("В список INSTALLED_APPS добавляется созданное приложение 'core':"),
    ...CODE([
        "INSTALLED_APPS = [",
        "    'django.contrib.admin',",
        "    'django.contrib.auth',",
        "    'django.contrib.contenttypes',",
        "    'django.contrib.sessions',",
        "    'django.contrib.messages',",
        "    'django.contrib.staticfiles',",
        "    'core',",
        "]"
    ]),
    EMPTY(),
    P("Локализация устанавливается на русский язык и часовой пояс Алматы:"),
    ...CODE([
        "LANGUAGE_CODE = 'ru'",
        "TIME_ZONE = 'Asia/Almaty'",
        "USE_I18N = True",
        "USE_TZ = True"
    ]),
    EMPTY(),
    ...SHOT("Файл settings.py, открытый в Visual Studio Code, с подсвеченным блоком настроек DATABASES", "Настройки подключения к SQL Server в settings.py"),

    H2("3.3. Структура проекта"),
    P("После выполнения команд создания проект имеет следующую структуру каталогов и файлов:"),
    ...CODE([
        "hp_factory/",
        "├── .venv/                 # виртуальное окружение Python",
        "├── core/                  # основное приложение",
        "│   ├── __init__.py",
        "│   ├── admin.py           # настройки админ-панели",
        "│   ├── apps.py",
        "│   ├── forms.py           # формы для ввода данных",
        "│   ├── hashers.py         # пользовательские хешеры паролей",
        "│   ├── models.py          # модели данных (ORM)",
        "│   ├── services.py        # бизнес-логика заявок",
        "│   ├── urls.py            # маршруты приложения",
        "│   └── views.py           # представления (контроллеры)",
        "├── hp_factory/            # настройки проекта",
        "│   ├── __init__.py",
        "│   ├── settings.py",
        "│   ├── urls.py",
        "│   └── wsgi.py",
        "├── static/                # CSS, JS, изображения",
        "│   └── design/styles.css",
        "├── templates/             # HTML-шаблоны",
        "│   ├── base.html",
        "│   ├── base_auth.html",
        "│   └── core/",
        "│       ├── dashboard.html",
        "│       ├── login.html",
        "│       ├── register.html",
        "│       ├── purchases_list.html",
        "│       ├── purchase_add.html",
        "│       ├── production_list.html",
        "│       ├── sales_list.html",
        "│       ├── salary_list.html",
        "│       ├── credits_list.html",
        "│       ├── reports.html",
        "│       └── ... (~25 шаблонов)",
        "├── schema.sql             # SQL-скрипт схемы БД",
        "├── seed_data.sql          # начальные данные",
        "├── manage.py              # CLI-утилита Django",
        "└── requirements.txt"
    ]),
    EMPTY(),
    ...SHOT("Окно VS Code с раскрытым деревом проекта в боковой панели Explorer", "Структура проекта в Visual Studio Code"),

    H2("3.4. Модели данных (models.py)"),
    P("Файл core/models.py содержит описание всех моделей данных приложения. Поскольку база данных создаётся внешним SQL-скриптом, во всех моделях указан параметр managed = False — это означает, что Django не управляет схемой таблиц (не создаёт миграции и не выполняет команды CREATE TABLE), а только обеспечивает объектно-реляционное отображение существующих таблиц."),
    P("Ниже приведено описание всех 13 моделей с пояснением назначения каждой."),

    H3("Модель Unit — Единицы измерения"),
    P("Назначение: справочник единиц измерения. Простая модель с одним полем — наименование. Используется как внешний ключ в моделях RawMaterial и FinishedProduct."),
    ...CODE([
        "class Unit(models.Model):",
        "    name = models.CharField(max_length=50)",
        "    class Meta:",
        "        managed = False",
        "        db_table = 'Units'",
        "    def __str__(self):",
        "        return self.name"
    ]),
    EMPTY(),

    H3("Модель Position — Должности"),
    P("Назначение: справочник должностей сотрудников."),
    ...CODE([
        "class Position(models.Model):",
        "    title = models.CharField(max_length=100)",
        "    class Meta:",
        "        managed = False",
        "        db_table = 'Positions'"
    ]),
    EMPTY(),

    H3("Модель Employee — Сотрудники"),
    P("Назначение: содержит полные данные о сотрудниках предприятия. Связана с моделью Position через внешний ключ. Поле full_name содержит ФРО, salary — оклад, address и phone — контактные данные."),
    ...CODE([
        "class Employee(models.Model):",
        "    full_name = models.CharField(",
        "        max_length=150, db_column='FullName')",
        "    position = models.ForeignKey(",
        "        Position, on_delete=models.SET_NULL,",
        "        null=True, db_column='PositionID')",
        "    salary = models.DecimalField(",
        "        max_digits=18, decimal_places=2,",
        "        db_column='Salary')",
        "    address = models.CharField(",
        "        max_length=255, blank=True, null=True,",
        "        db_column='Address')",
        "    phone = models.CharField(",
        "        max_length=20, blank=True, null=True,",
        "        db_column='Phone')",
        "    class Meta:",
        "        managed = False",
        "        db_table = 'Employees'"
    ]),
    EMPTY(),

    H3("Модель RawMaterial — Сырьё"),
    P("Назначение: справочник комплектующих и материалов. Содержит наименование, единицу измерения и текущий остаток на складе."),
    ...CODE([
        "class RawMaterial(models.Model):",
        "    name = models.CharField(max_length=100)",
        "    unit = models.ForeignKey(Unit, null=True,",
        "        on_delete=models.SET_NULL)",
        "    quantity = models.FloatField(default=0)",
        "    sum_amount = models.FloatField(default=0)",
        "    class Meta:",
        "        managed = False",
        "        db_table = 'RawMaterials'"
    ]),
    EMPTY(),

    H3("Модель FinishedProduct — Готовая продукция"),
    P("Назначение: справочник готовых изделий с указанием цены реализации."),
    ...CODE([
        "class FinishedProduct(models.Model):",
        "    name = models.CharField(max_length=100)",
        "    unit = models.ForeignKey(Unit, null=True,",
        "        on_delete=models.SET_NULL)",
        "    quantity = models.FloatField(default=0)",
        "    selling_price = models.DecimalField(",
        "        max_digits=18, decimal_places=2, default=0)",
        "    class Meta:",
        "        managed = False",
        "        db_table = 'FinishedProducts'"
    ]),
    EMPTY(),

    H3("Модель Ingredient — Рецептура"),
    P("Назначение: описывает состав готовой продукции (BOM). Каждая запись связывает один продукт с одним материалом и указывает норму расхода на единицу."),
    ...CODE([
        "class Ingredient(models.Model):",
        "    product = models.ForeignKey(FinishedProduct,",
        "        on_delete=models.CASCADE)",
        "    material = models.ForeignKey(RawMaterial,",
        "        on_delete=models.CASCADE)",
        "    quantity = models.FloatField()",
        "    class Meta:",
        "        managed = False",
        "        db_table = 'Ingredients'"
    ]),
    EMPTY(),

    H3("Модель Budget — Бюджет"),
    P("Назначение: хранит текущее значение бюджета предприятия."),
    ...CODE([
        "class Budget(models.Model):",
        "    total_amount = models.DecimalField(",
        "        max_digits=18, decimal_places=2)",
        "    class Meta:",
        "        managed = False",
        "        db_table = 'Budget'"
    ]),
    EMPTY(),

    H3("Модели операций: закупка, производство, продажа, зарплата"),
    P("Эти четыре модели имеют схожую структуру — они являются журналами операций со ссылками на справочники и автоматически устанавливаемой датой:"),
    ...CODE([
        "class RawMaterialPurchase(models.Model):",
        "    material = models.ForeignKey(RawMaterial,",
        "        on_delete=models.CASCADE)",
        "    quantity = models.FloatField()",
        "    sum_amount = models.DecimalField(",
        "        max_digits=18, decimal_places=2)",
        "    purchase_date = models.DateTimeField(",
        "        auto_now_add=True)",
        "    employee = models.ForeignKey(Employee,",
        "        on_delete=models.SET_NULL, null=True)",
        "    class Meta:",
        "        managed = False",
        "        db_table = 'RawMaterialPurchases'"
    ]),
    EMPTY(),
    ...CODE([
        "class ProductProduction(models.Model):",
        "    product = models.ForeignKey(FinishedProduct,",
        "        on_delete=models.CASCADE)",
        "    quantity = models.FloatField()",
        "    production_date = models.DateTimeField(",
        "        auto_now_add=True)",
        "    employee = models.ForeignKey(Employee,",
        "        on_delete=models.SET_NULL, null=True)"
    ]),
    EMPTY(),
    ...CODE([
        "class ProductSale(models.Model):",
        "    product = models.ForeignKey(FinishedProduct,",
        "        on_delete=models.CASCADE)",
        "    quantity = models.FloatField()",
        "    sum_amount = models.DecimalField(",
        "        max_digits=18, decimal_places=2)",
        "    sale_date = models.DateTimeField(auto_now_add=True)"
    ]),
    EMPTY(),
    ...CODE([
        "class SalaryPayment(models.Model):",
        "    employee = models.ForeignKey(Employee,",
        "        on_delete=models.CASCADE)",
        "    amount = models.DecimalField(",
        "        max_digits=18, decimal_places=2)",
        "    payment_date = models.DateTimeField(",
        "        auto_now_add=True)"
    ]),
    EMPTY(),

    H3("Модель Credit — Кредиты"),
    P("Назначение: самая сложная модель системы. Содержит сумму, процентную ставку, срок, статус, дату начала и общую сумму к выплате. Реализует методы расчёта остаточной задолженности и ежемесячного аннуитетного платежа."),
    ...CODE([
        "class Credit(models.Model):",
        "    STATUS_CHOICES = [",
        "        ('active', 'Активный'),",
        "        ('paid', 'Погашен'),",
        "        ('overdue', 'Просрочен'),",
        "    ]",
        "    amount = models.DecimalField(",
        "        max_digits=18, decimal_places=2)",
        "    interest_rate = models.DecimalField(",
        "        max_digits=5, decimal_places=2, null=True)",
        "    term_months = models.IntegerField(null=True)",
        "    status = models.CharField(",
        "        max_length=20, choices=STATUS_CHOICES,",
        "        default='active')",
        "    total_to_pay = models.DecimalField(",
        "        max_digits=18, decimal_places=2, null=True)",
        "    credit_date = models.DateTimeField(",
        "        auto_now_add=True)",
        "",
        "    def get_remaining_amount(self):",
        "        total_paid = sum(float(p.amount)",
        "            for p in self.payments.all())",
        "        return max(0,",
        "            self.calculate_total_to_pay() - total_paid)",
        "",
        "    def get_monthly_payment(self):",
        "        # формула аннуитета",
        "        ..."
    ]),
    EMPTY(),

    H3("Модель CreditPayment — Выплаты по кредитам"),
    P("Назначение: журнал платежей по кредитам. Каждый платёж имеет тип: основной долг, проценты, штраф или совместная выплата."),
    ...CODE([
        "class CreditPayment(models.Model):",
        "    PAYMENT_TYPE_CHOICES = [",
        "        ('principal', 'Основной долг'),",
        "        ('interest', 'Проценты'),",
        "        ('fine', 'Штраф/просрочка'),",
        "        ('combined', 'Совместная выплата'),",
        "    ]",
        "    credit = models.ForeignKey(Credit,",
        "        related_name='payments',",
        "        on_delete=models.CASCADE)",
        "    amount = models.DecimalField(",
        "        max_digits=18, decimal_places=2)",
        "    payment_date = models.DateTimeField(",
        "        auto_now_add=True)",
        "    payment_type = models.CharField(",
        "        max_length=20,",
        "        choices=PAYMENT_TYPE_CHOICES)"
    ]),
    EMPTY(),
    ...SHOT("Файл models.py, открытый в VS Code, со всеми классами моделей", "Файл models.py — все модели системы"),

    H2("3.5. Формы (forms.py)"),
    P("Для удобного ввода данных пользователем используются формы Django. В проекте применены обычные формы (forms.Form), а не ModelForm — это даёт большую гибкость в валидации и взаимодействии с хранимыми процедурами. Каждая форма содержит описание полей с указанием типа, метки и правил валидации."),

    H3("Форма PurchaseForm"),
    P("Назначение: форма для регистрации закупки сырья. Поля: сырьё (выбор из справочника), количество, цена за единицу, сотрудник."),
    ...CODE([
        "class PurchaseForm(forms.Form):",
        "    material = forms.ModelChoiceField(",
        "        queryset=RawMaterial.objects.all(),",
        "        label='Сырьё')",
        "    quantity = forms.DecimalField(",
        "        min_value=0.001, label='Количество')",
        "    price_per_unit = forms.DecimalField(",
        "        min_value=0.01, label='Цена за ед.')",
        "    employee = forms.ModelChoiceField(",
        "        queryset=Employee.objects.all(),",
        "        required=False, label='Сотрудник')"
    ]),
    EMPTY(),

    H3("Форма ProductionForm"),
    P("Назначение: форма регистрации выпуска готовой продукции. Поля: продукция, количество, сотрудник."),
    ...CODE([
        "class ProductionForm(forms.Form):",
        "    product = forms.ModelChoiceField(",
        "        queryset=FinishedProduct.objects.all(),",
        "        label='Продукция')",
        "    quantity = forms.FloatField(",
        "        min_value=0.001, label='Количество')"
    ]),
    EMPTY(),

    H3("Форма SaleForm"),
    P("Назначение: форма регистрации продажи. Содержит автоматический расчёт суммы по цене реализации."),

    H3("Форма SalaryPaymentForm"),
    P("Назначение: форма выплаты заработной платы конкретному сотруднику. Поля: сотрудник, сумма выплаты."),

    H3("Форма CreditForm"),
    P("Назначение: форма получения кредита. Поля: сумма, процентная ставка, срок в месяцах."),

    H3("Форма CreditPaymentForm"),
    P("Назначение: форма внесения платежа по кредиту. Поля: сумма, тип платежа, примечание."),

    H3("Формы RegisterForm и LoginForm"),
    P("Назначение: формы регистрации нового пользователя и входа в систему. RegisterForm выполняет проверку совпадения паролей и уникальности имени пользователя."),
    ...CODE([
        "class RegisterForm(forms.Form):",
        "    username = forms.CharField(max_length=150)",
        "    first_name = forms.CharField(max_length=30)",
        "    last_name = forms.CharField(max_length=30)",
        "    email = forms.EmailField()",
        "    password1 = forms.CharField(",
        "        widget=forms.PasswordInput,",
        "        min_length=8, label='Пароль')",
        "    password2 = forms.CharField(",
        "        widget=forms.PasswordInput,",
        "        label='Повторите пароль')",
        "",
        "    def clean(self):",
        "        data = super().clean()",
        "        if data.get('password1') != data.get('password2'):",
        "            raise forms.ValidationError(",
        "                'Пароли не совпадают')",
        "        return data"
    ]),
    EMPTY(),
    ...SHOT("Файл forms.py, открытый в VS Code, со списком форм", "Формы для ввода данных (forms.py)"),

    H2("3.6. Представления (views.py)"),
    P("Представления (views) — это функции, отвечающие за обработку HTTP-запросов от пользователя. Каждое представление принимает объект request, выполняет необходимую логику (чтение/запись в БД, вызов процедур, валидацию форм) и возвращает HTTP-ответ — чаще всего отрендеренный HTML-шаблон. Ниже описаны ключевые представления системы."),

    H3("Представление dashboard"),
    P("Назначение: главная страница системы. Отображает сводные показатели предприятия: текущий бюджет, количество позиций сырья и продукции, число сотрудников, активные кредиты, последние операции и заявки на производство. Защищено декоратором @login_required."),
    ...CODE([
        "@login_required",
        "def dashboard(request):",
        "    budget = Budget.objects.first()",
        "    raw_count = RawMaterial.objects.count()",
        "    product_count = FinishedProduct.objects.count()",
        "    employee_count = Employee.objects.count()",
        "    recent_purchases = RawMaterialPurchase.objects",
        "        .select_related('material', 'employee')",
        "        .order_by('-purchase_date')[:5]",
        "    active_credits = Credit.objects",
        "        .filter(status='active').count()",
        "    context = {",
        "        'budget': budget,",
        "        'raw_count': raw_count,",
        "        'product_count': product_count,",
        "        'employee_count': employee_count,",
        "        'recent_purchases': recent_purchases,",
        "        'active_credits': active_credits,",
        "    }",
        "    return render(request,",
        "        'core/dashboard.html', context)"
    ]),
    EMPTY(),

    H3("Вспомогательная функция _check_budget_sp"),
    P("Назначение: вызывает хранимую процедуру sp_CheckBudget для проверки достаточности средств перед расходной операцией. Использует cursor с параметризованным запросом для защиты от SQL-инъекций."),
    ...CODE([
        "def _check_budget_sp(required_amount):",
        "    with connection.cursor() as cursor:",
        "        cursor.execute(",
        "            'DECLARE @result INT; '",
        "            'EXEC sp_CheckBudget '",
        "            '@RequiredAmount=%s, '",
        "            '@IsAllowed=@result OUTPUT; '",
        "            'SELECT @result;',",
        "            [required_amount])",
        "        result = cursor.fetchone()[0]",
        "    return result == 0  # True если средств хватает"
    ]),
    EMPTY(),

    H3("Представление purchase_add — Регистрация закупки"),
    P("Назначение: обрабатывает форму добавления закупки сырья. Проверяет бюджет через SP, создаёт запись в БД (триггер автоматически обновит бюджет и склад)."),
    ...CODE([
        "@login_required",
        "def purchase_add(request):",
        "    if request.method == 'POST':",
        "        form = PurchaseForm(request.POST)",
        "        if form.is_valid():",
        "            d = form.cleaned_data",
        "            total = d['quantity'] * d['price_per_unit']",
        "            if not _check_budget_sp(total):",
        "                messages.error(request,",
        "                    'Недостаточно средств в бюджете!')",
        "                return redirect('purchase_add')",
        "            RawMaterialPurchase.objects.create(",
        "                material=d['material'],",
        "                quantity=d['quantity'],",
        "                sum_amount=total,",
        "                employee=d.get('employee'))",
        "            messages.success(request,",
        "                'Закупка зарегистрирована')",
        "            return redirect('purchases_list')",
        "    else:",
        "        form = PurchaseForm()",
        "    return render(request,",
        "        'core/purchase_add.html', {'form': form})"
    ]),
    EMPTY(),

    H3("Представление production_add — Запуск производства"),
    P("Назначение: регистрирует выпуск продукции. Перед сохранением вызывает SP sp_CheckMaterialAvailability для проверки наличия сырья по рецептуре. Если сырья хватает, создаёт запись — триггер списывает сырьё и увеличивает остатки продукции."),

    H3("Представление sale_add — Регистрация продажи"),
    P("Назначение: фиксирует факт продажи. Проверяет наличие достаточного количества готовой продукции на складе. После создания записи триггер автоматически уменьшает остатки и пополняет бюджет."),

    H3("Представление salary_add — Выплата зарплаты"),
    P("Назначение: оформляет выплату ЗП сотруднику. Проверяет бюджет через SP, создаёт запись (триггер уменьшает бюджет)."),

    H3("Представление credits_list — Список кредитов"),
    P("Назначение: отображает все полученные кредиты со сводной аналитикой — общая сумма кредитов, сумма остатков задолженности, кредиты, по которым подошёл срок очередного платежа."),

    H3("Представление credit_add — Получение кредита"),
    P("Назначение: оформляет получение нового кредита. После создания записи триггер увеличивает бюджет на сумму кредита и рассчитывает общую сумму к возврату."),

    H3("Представление credit_pay — Платёж по кредиту"),
    P("Назначение: регистрирует очередной платёж по кредиту с указанием типа (основной долг, проценты, штраф). Триггер уменьшает бюджет и обновляет статус кредита."),

    H3("Представление payment_schedule — График платежей"),
    P("Назначение: строит план-график платежей по конкретному кредиту с указанием ежемесячного аннуитетного взноса, остаточной задолженности и фактически внесённых платежей."),

    H3("Представление reports_view — Отчёты"),
    P("Назначение: формирует сводный аналитический отчёт по всем модулям системы. Подсчитывает агрегатные показатели (общие суммы продаж, закупок, зарплат, кредитов) и передаёт в шаблон для построения графиков Chart.js."),
    ...CODE([
        "@login_required",
        "def reports_view(request):",
        "    total_sales = ProductSale.objects",
        "        .aggregate(Sum('sum_amount'))",
        "        ['sum_amount__sum'] or 0",
        "    total_purchases = RawMaterialPurchase.objects",
        "        .aggregate(Sum('sum_amount'))",
        "        ['sum_amount__sum'] or 0",
        "    total_salary = SalaryPayment.objects",
        "        .aggregate(Sum('amount'))",
        "        ['amount__sum'] or 0",
        "    total_credits = Credit.objects",
        "        .aggregate(Sum('amount'))",
        "        ['amount__sum'] or 0",
        "    return render(request,",
        "        'core/reports.html', {",
        "            'total_sales': total_sales,",
        "            'total_purchases': total_purchases,",
        "            'total_salary': total_salary,",
        "            'total_credits': total_credits,",
        "            'budget': Budget.objects.first(),",
        "        })"
    ]),
    EMPTY(),

    H3("Представления аутентификации: login_view, register_view, logout_view"),
    P("Назначение: реализуют функции входа, регистрации и выхода пользователя. Используют встроенные функции Django authenticate, login, logout и формы UserCreationForm/AuthenticationForm."),
    ...CODE([
        "def login_view(request):",
        "    if request.method == 'POST':",
        "        form = LoginForm(request.POST)",
        "        if form.is_valid():",
        "            user = authenticate(",
        "                username=form.cleaned_data['username'],",
        "                password=form.cleaned_data['password'])",
        "            if user is not None:",
        "                login(request, user)",
        "                return redirect('dashboard')",
        "            messages.error(request,",
        "                'Неверный логин или пароль')",
        "    else:",
        "        form = LoginForm()",
        "    return render(request,",
        "        'core/login.html', {'form': form})"
    ]),
    EMPTY(),

    H3("Представления CRUD для справочников"),
    P("Для каждого справочника (Units, Positions, Employees, RawMaterials, FinishedProducts, Ingredients) реализованы операции добавления, редактирования и удаления записей. Все операции выполняются на одной странице с использованием модальных окон."),
    ...SHOT("Файл views.py с прокруткой основных функций представлений в VS Code", "Файл views.py — представления приложения"),

    H2("3.7. URL-маршрутизация (urls.py)"),
    P("Соответствие URL-адресов и функций-представлений настраивается в файле core/urls.py. Каждому маршруту присваивается имя, по которому можно получать его URL в шаблонах и других местах кода."),
    ...CODE([
        "from django.urls import path",
        "from . import views",
        "",
        "urlpatterns = [",
        "    path('', views.dashboard, name='dashboard'),",
        "    path('login/', views.login_view, name='login'),",
        "    path('logout/', views.logout_view, name='logout'),",
        "    path('register/', views.register_view,",
        "         name='register'),",
        "    path('profile/', views.profile, name='profile'),",
        "    # Закупки",
        "    path('purchases/', views.purchases_list,",
        "         name='purchases_list'),",
        "    path('purchases/add/', views.purchase_add,",
        "         name='purchase_add'),",
        "    # Производство",
        "    path('production/', views.production_list,",
        "         name='production_list'),",
        "    path('production/add/', views.production_add,",
        "         name='production_add'),",
        "    # Продажи",
        "    path('sales/', views.sales_list,",
        "         name='sales_list'),",
        "    path('sales/add/', views.sale_add,",
        "         name='sale_add'),",
        "    # Зарплата",
        "    path('salary/', views.salary_list,",
        "         name='salary_list'),",
        "    path('salary/add/', views.salary_add,",
        "         name='salary_add'),",
        "    # Кредиты",
        "    path('credits/', views.credits_list,",
        "         name='credits_list'),",
        "    path('credits/add/', views.credit_add,",
        "         name='credit_add'),",
        "    path('credits/<int:pk>/pay/', views.credit_pay,",
        "         name='credit_pay'),",
        "    # Отчёты",
        "    path('reports/', views.reports_view,",
        "         name='reports'),",
        "    # Справочники",
        "    path('raw-materials/', views.raw_materials_list,",
        "         name='raw_materials_list'),",
        "    path('products/', views.finished_products_list,",
        "         name='finished_products_list'),",
        "    path('employees/', views.employees_list,",
        "         name='employees_list'),",
        "    path('positions/', views.positions_list,",
        "         name='positions_list'),",
        "    path('units/', views.units_list,",
        "         name='units_list'),",
        "    path('ingredients/', views.ingredients_list,",
        "         name='ingredients_list'),",
        "    path('budget/', views.budget_view,",
        "         name='budget'),",
        "]"
    ]),
    EMPTY(),

    H2("3.8. Шаблоны интерфейса (templates)"),
    P("Внешний вид страниц приложения определяется HTML-шаблонами, расположенными в каталоге templates/. Базовый шаблон base.html содержит общую разметку: боковое меню навигации, верхнюю панель с информацией о пользователе и область основного контента. Все остальные шаблоны расширяют base.html через директиву {% extends 'base.html' %} и переопределяют блок {% block content %}."),
    P("Пример базового шаблона:"),
    ...CODE([
        "<!DOCTYPE html>",
        "<html lang=\"ru\">",
        "<head>",
        "  <meta charset=\"UTF-8\">",
        "  <title>{% block title %}HP Factory{% endblock %}</title>",
        "  <link rel=\"stylesheet\"",
        "        href=\"{% static 'design/styles.css' %}\">",
        "</head>",
        "<body>",
        "  <aside class=\"sidebar\">",
        "    <a href=\"{% url 'dashboard' %}\">Главная</a>",
        "    <a href=\"{% url 'purchases_list' %}\">Закупки</a>",
        "    <a href=\"{% url 'production_list' %}\">Производство</a>",
        "    <a href=\"{% url 'sales_list' %}\">Продажи</a>",
        "    <a href=\"{% url 'salary_list' %}\">Зарплата</a>",
        "    <a href=\"{% url 'credits_list' %}\">Кредиты</a>",
        "    <a href=\"{% url 'reports' %}\">Отчёты</a>",
        "  </aside>",
        "  <main>",
        "    {% for msg in messages %}",
        "      <div class=\"alert\">{{ msg }}</div>",
        "    {% endfor %}",
        "    {% block content %}{% endblock %}",
        "  </main>",
        "</body>",
        "</html>"
    ]),
    EMPTY(),
    P("Пример шаблона страницы списка закупок (purchases_list.html):"),
    ...CODE([
        "{% extends 'base.html' %}",
        "{% block title %}Закупки{% endblock %}",
        "{% block content %}",
        "<div class=\"page-head\">",
        "  <h2 class=\"page-title\">Закупки сырья</h2>",
        "  <a href=\"{% url 'purchase_add' %}\"",
        "     class=\"btn btn-primary\">+ Закупить</a>",
        "</div>",
        "<section class=\"panel\">",
        "  <table class=\"table\">",
        "    <thead>",
        "      <tr>",
        "        <th>№</th><th>Дата</th><th>Сырьё</th>",
        "        <th>Кол-во</th><th>Сумма</th>",
        "      </tr>",
        "    </thead>",
        "    <tbody>",
        "      {% for p in purchases %}",
        "      <tr>",
        "        <td>#{{ p.id }}</td>",
        "        <td>{{ p.purchase_date|date:\"d.m.Y\" }}</td>",
        "        <td>{{ p.material.name }}</td>",
        "        <td>{{ p.quantity }}</td>",
        "        <td>{{ p.sum_amount }} сом</td>",
        "      </tr>",
        "      {% endfor %}",
        "    </tbody>",
        "  </table>",
        "</section>",
        "{% endblock %}"
    ]),
    EMPTY(),
    ...SHOT("Окно VS Code с открытым каталогом templates/core и списком всех HTML-шаблонов", "Каталог шаблонов templates/core в VS Code"),
    ...SHOT("Открытый файл base.html в VS Code", "Базовый шаблон base.html"),
];

// =====================================================
// РАЗДЕЛ 4 — ЛАБОРАТОРНЫЕ
// =====================================================
const sec4 = [
    H1("4. Реализованные модули (лабораторные работы)"),
    P("Проект структурирован в виде шести лабораторных работ, каждая из которых реализует один из ключевых бизнес-процессов предприятия. Ниже приведено подробное описание каждой лабораторной работы с демонстрацией работающих интерфейсов."),

    H2("4.1. Лабораторная работа №1: Закупка сырья и управление бюджетом"),
    P("В рамках первой лабораторной работы реализован базовый функционал учёта закупок сырья и контроля бюджета. Это самая фундаментальная часть системы, на которую опираются все остальные модули."),
    P("Бизнес-процесс закупки сырья реализован следующим образом. Пользователь открывает страницу списка закупок и нажимает кнопку «+ Закупить». Открывается форма добавления, где он выбирает тип сырья из выпадающего списка, вводит количество и цену за единицу. Система автоматически рассчитывает общую сумму. При нажатии кнопки «Сохранить» происходит следующая последовательность действий:"),
    BULLET("Django-форма выполняет первичную валидацию (проверка типов, минимальных значений);"),
    BULLET("вызывается вспомогательная функция _check_budget_sp, которая обращается к хранимой процедуре sp_CheckBudget;"),
    BULLET("процедура сравнивает текущий бюджет с требуемой суммой и возвращает результат;"),
    BULLET("если средств недостаточно — пользователь получает сообщение об ошибке;"),
    BULLET("если средств достаточно — выполняется INSERT в таблицу RawMaterialPurchases;"),
    BULLET("после INSERT автоматически срабатывает триггер trg_AfterPurchaseInsert, который уменьшает бюджет и увеличивает остаток сырья;"),
    BULLET("пользователь перенаправляется на страницу списка закупок с сообщением об успехе."),
    ...SHOT("Страница списка закупок (purchases_list.html) в браузере с таблицей операций", "Страница «Закупки сырья» — список операций"),
    ...SHOT("Открытая форма «Добавить закупку» с заполненными полями", "Форма регистрации закупки сырья"),
    ...SHOT("Сообщение об успешной регистрации закупки на странице списка", "Сообщение об успешной операции"),
    ...SHOT("Сообщение об ошибке «Недостаточно средств в бюджете» при попытке закупки", "Проверка достаточности бюджета"),

    H2("4.2. Лабораторная работа №2: Производство продукции"),
    P("Вторая лабораторная работа реализует производственный процесс. Ключевое новшество — введение понятия рецептуры (Ingredient): для каждой модели готовой продукции задаётся список комплектующих с указанием нормы расхода на единицу выпуска."),
    P("Перед запуском производства система обращается к хранимой процедуре sp_CheckMaterialAvailability, которая последовательно проверяет наличие каждого ингредиента согласно рецептуре. Только если все ингредиенты в достаточном количестве на складе, операция разрешается."),
    P("После создания записи в ProductProduction срабатывает триггер trg_AfterProductionInsert, который выполняет две операции:"),
    BULLET("увеличивает количество готовой продукции на складе на количество единиц, указанное в записи;"),
    BULLET("для каждого ингредиента из рецептуры списывает соответствующее количество сырья (норма расхода × количество единиц)."),
    ...SHOT("Страница «Рецептуры» (ingredients_list.html) со списком ингредиентов для каждого продукта", "Страница «Рецептуры» — состав готовой продукции"),
    ...SHOT("Форма добавления ингредиента в рецептуру", "Добавление ингредиента в рецептуру"),
    ...SHOT("Страница «Производство продукции» со списком производственных операций", "Страница «Производство продукции»"),
    ...SHOT("Форма «Произвести продукцию» с выбором модели и количества", "Форма регистрации производственной операции"),
    ...SHOT("Сообщение об ошибке «Недостаточно сырья для производства» при попытке выпустить продукцию", "Проверка наличия сырья перед производством"),

    H2("4.3. Лабораторная работа №3: Продажа готовой продукции"),
    P("Третья лабораторная работа реализует модуль продаж — операции, которые приносят предприятию доход. При продаже сначала проверяется наличие требуемого количества продукции на складе, после чего создаётся запись в журнале продаж."),
    P("Триггер trg_AfterSaleInsert выполняет:"),
    BULLET("уменьшение количества готовой продукции на складе на проданное количество;"),
    BULLET("увеличение бюджета предприятия на сумму выручки."),
    P("Сумма выручки рассчитывается на стороне клиента: при выборе продукции в форме автоматически подставляется её цена реализации (SellingPrice), и при изменении количества JavaScript-обработчик пересчитывает общую сумму. Это обеспечивает прозрачность для пользователя."),
    ...SHOT("Страница «Продажи готовой продукции» (sales_list.html) с таблицей сделок", "Страница «Продажи готовой продукции»"),
    ...SHOT("Форма «Зарегистрировать продажу» с автоматическим расчётом суммы", "Форма регистрации продажи"),
    ...SHOT("Список готовой продукции (finished_products_list.html) с остатками на складе", "Страница «Готовая продукция» — складские остатки"),

    H2("4.4. Лабораторная работа №4: Управление персоналом и заработная плата"),
    P("Четвёртая лабораторная работа охватывает кадровый учёт и расчёты с сотрудниками. Реализованы справочники должностей (Positions) и сотрудников (Employees), а также модуль выплат заработной платы. Каждый сотрудник имеет назначенный оклад (Salary), который служит подсказкой при оформлении выплат."),
    P("При выплате ЗП пользователь выбирает сотрудника, и поле «Сумма» автоматически заполняется его окладом (с возможностью изменения). Перед сохранением вызывается sp_CheckBudget. После успешной вставки триггер trg_AfterSalaryInsert уменьшает бюджет."),
    ...SHOT("Страница «Должности» (positions_list.html) со списком позиций предприятия", "Страница справочника «Должности»"),
    ...SHOT("Страница «Сотрудники» (employees_list.html) со списком работников", "Страница «Сотрудники» — список персонала"),
    ...SHOT("Форма добавления нового сотрудника с выбором должности", "Форма добавления сотрудника"),
    ...SHOT("Страница «Выплата зарплат» (salary_list.html) с историей выплат", "Страница «Выплата зарплат»"),
    ...SHOT("Форма «Выплатить зарплату» с выбором сотрудника", "Форма выплаты заработной платы"),

    H2("4.5. Лабораторная работа №5: Управление кредитами"),
    P("Пятая лабораторная работа — самый сложный модуль системы. Реализована полная схема работы с кредитами: получение, расчёт графика платежей, регистрация платежей разных типов (основной долг, проценты, штраф), отслеживание статуса кредита."),
    P("При получении кредита пользователь указывает сумму, процентную ставку и срок в месяцах. Триггер trg_AfterCreditInsert при создании записи:"),
    BULLET("увеличивает бюджет предприятия на сумму выданного кредита;"),
    BULLET("рассчитывает общую сумму к выплате с учётом процентов и записывает её в поле TotalToPay."),
    P("Для расчёта используется формула простых процентов: TotalToPay = Amount + (Amount × InterestRate / 100 / 12 × TermMonths). На стороне Django также реализован метод get_monthly_payment, который вычисляет ежемесячный аннуитетный платёж по классической банковской формуле."),
    P("Каждый платёж по кредиту классифицируется по типу: погашение основного долга (principal), уплата процентов (interest), штраф за просрочку (fine) или совместная выплата (combined). Это позволяет вести детализированный учёт обслуживания долга."),
    P("Триггер trg_AfterCreditPaymentInsert при регистрации платежа:"),
    BULLET("уменьшает бюджет на сумму платежа;"),
    BULLET("проверяет, не достигла ли суммарная выплата величины TotalToPay; если да — меняет статус кредита на 'paid' (погашен)."),
    ...SHOT("Страница «Кредиты» (credits_list.html) со сводной информацией о всех займах", "Страница «Кредиты» — общий список"),
    ...SHOT("Форма «Взять кредит» с полями суммы, ставки и срока", "Форма получения нового кредита"),
    ...SHOT("Страница «Внести платёж» (credit_pay.html) для конкретного кредита", "Страница регистрации платежа по кредиту"),
    ...SHOT("Страница «График платежей» (payment_schedule.html) с подробным планом-графиком", "Страница «График платежей»"),

    H2("4.6. Лабораторная работа №6: Отчёты и аналитика"),
    P("Завершающая лабораторная работа реализует страницу сводной отчётности с визуализацией данных. На этой странице руководство предприятия может в едином окне увидеть все ключевые финансовые показатели и динамику деятельности."),
    P("В верхней части страницы располагается семь карточек с агрегатными показателями: общая сумма продаж (доходы), общая сумма закупок сырья (расходы), общая сумма выплаченных зарплат, общая сумма полученных кредитов, общая сумма платежей по кредитам, текущий остаток долга, текущий бюджет."),
    P("Ниже карточек размещены две диаграммы, построенные с помощью JavaScript-библиотеки Chart.js:"),
    BULLET("столбчатая диаграмма «Финансовый обзор» — сравнивает все ключевые показатели в виде столбцов;"),
    BULLET("кольцевая диаграмма «Структура расходов» — показывает доли закупок, зарплат и выплат по кредитам в общей сумме расходов."),
    P("Под диаграммами размещены подробные таблицы операций по каждой лабораторной работе. Реализована функция «Печать / PDF», использующая стандартный механизм печати браузера для сохранения отчёта в PDF."),
    ...SHOT("Верхняя часть страницы отчётов с семью карточками показателей", "Сводные карточки финансовых показателей"),
    ...SHOT("Две диаграммы Chart.js — столбчатая и кольцевая", "Графики «Финансовый обзор» и «Структура расходов»"),
    ...SHOT("Подробная таблица закупок на странице отчётов", "Детализация операций — таблица закупок"),
    ...SHOT("Подробная таблица производства и продаж", "Детализация операций — производство и продажи"),
    ...SHOT("Подробная таблица кредитов и платежей по ним", "Детализация операций — кредиты и платежи"),
];

// =====================================================
// РАЗДЕЛ 5 — БЕЗОПАСНОСТЬ
// =====================================================
const sec5 = [
    H1("5. Безопасность и аутентификация"),
    P("Защита информационной системы от несанкционированного доступа — обязательное требование к любому корпоративному приложению. В проекте HP Factory реализован комплексный набор мер безопасности."),

    H2("5.1. Система аутентификации"),
    P("Аутентификация пользователей реализована средствами встроенной системы Django (django.contrib.auth). Регистрация новых пользователей выполняется через специальную форму RegisterForm с двойным вводом пароля и проверкой его соответствия. Минимальная длина пароля — 8 символов."),
    P("После успешной регистрации пользователь автоматически входит в систему. При входе вызывается функция authenticate, которая проверяет соответствие имени пользователя и пароля. Если данные верны, функция login создаёт сессию пользователя."),
    P("Все страницы системы (кроме страниц входа и регистрации) защищены декоратором @login_required. Неавторизованные пользователи автоматически перенаправляются на страницу входа с указанием в URL параметра next — после успешного входа они вернутся на запрошенную страницу."),

    H2("5.2. Хеширование паролей"),
    P("Пароли пользователей никогда не хранятся в базе данных в открытом виде. Вместо этого хранится их криптографический хеш с солью. В проекте настроена иерархия хешеров (PASSWORD_HASHERS в settings.py):"),
    ...CODE([
        "PASSWORD_HASHERS = [",
        "    'django.contrib.auth.hashers.Argon2PasswordHasher',",
        "    'django.contrib.auth.hashers.BCryptSHA256PasswordHasher',",
        "    'django.contrib.auth.hashers.ScryptPasswordHasher',",
        "    'django.contrib.auth.hashers.PBKDF2PasswordHasher',",
        "    'core.hashers.SHA512PasswordHasher',",
        "    'core.hashers.SHA384PasswordHasher',",
        "    'django.contrib.auth.hashers.MD5PasswordHasher',",
        "]"
    ]),
    EMPTY(),
    P("Первый в списке хешер — Argon2 — используется по умолчанию для новых паролей. Argon2 является победителем соревнования Password Hashing Competition (2015) и считается наиболее устойчивым к перебору паролей на специализированном оборудовании (GPU, ASIC)."),
    P("В учебных целях в файле core/hashers.py реализованы собственные хешеры на основе алгоритмов SHA-384 и SHA-512:"),
    ...CODE([
        "import hashlib",
        "from django.contrib.auth.hashers import BasePasswordHasher",
        "from django.utils.crypto import get_random_string",
        "",
        "class SHA512PasswordHasher(BasePasswordHasher):",
        "    algorithm = 'sha512'",
        "",
        "    def encode(self, password, salt):",
        "        h = hashlib.sha512()",
        "        h.update((salt + password).encode('utf-8'))",
        "        return f'{self.algorithm}${salt}${h.hexdigest()}'",
        "",
        "    def verify(self, password, encoded):",
        "        algorithm, salt, hash_value = encoded.split('$', 2)",
        "        return self.encode(password, salt) == encoded"
    ]),
    EMPTY(),

    H2("5.3. Защита от CSRF-атак"),
    P("Все формы в системе защищены от атак типа Cross-Site Request Forgery (CSRF) с помощью встроенного механизма Django. В каждой форме в шаблонах присутствует тег {% csrf_token %}, генерирующий уникальный токен для текущей сессии. При обработке POST-запроса Django проверяет наличие и корректность токена; запросы без токена или с неверным токеном отклоняются с ошибкой 403."),

    H2("5.4. Защита от SQL-инъекций"),
    P("В проекте используется Django ORM, который автоматически экранирует все параметры запросов. В тех редких случаях, когда необходимо выполнить «сырой» SQL (например, вызов хранимой процедуры), используется параметризованный вызов через cursor.execute с передачей значений отдельным аргументом — это полностью исключает возможность SQL-инъекций."),

    H2("5.5. Разграничение доступа"),
    P("В системе предусмотрены три уровня доступа:"),
    BULLET("обычный пользователь (worker) — может просматривать данные и оформлять текущие операции;"),
    BULLET("бухгалтер (accountant, флаг is_staff) — может работать с бюджетом, кредитами, выплатами;"),
    BULLET("администратор (admin, флаг is_superuser) — полный доступ ко всем функциям, включая управление пользователями."),
    ...SHOT("Страница входа в систему (login.html) с формой авторизации", "Страница входа в систему"),
    ...SHOT("Страница регистрации нового пользователя (register.html) с двойным паролем", "Страница регистрации"),
    ...SHOT("Страница профиля пользователя", "Страница профиля пользователя"),
];

// =====================================================
// РАЗДЕЛ 6 — ТЕСТРРОВАНРЕ
// =====================================================
const sec6 = [
    H1("6. Тестирование системы"),
    P("Тестирование системы выполнялось вручную через интерфейс веб-приложения. Был разработан сценарий полного цикла, охватывающий все ключевые операции:"),
    PL("1. Запуск сервера разработки командой python manage.py runserver."),
    PL("2. Открытие браузера по адресу http://127.0.0.1:8000/."),
    PL("3. Регистрация нового пользователя через страницу /register/."),
    PL("4. Автоматический вход в систему и переход на главную страницу."),
    PL("5. Внесение начального бюджета через раздел «Бюджет»."),
    PL("6. Заполнение справочников: единицы измерения, должности, сотрудники."),
    PL("7. Добавление сырья и готовой продукции с указанием цен."),
    PL("8. Создание рецептур для каждой модели продукции."),
    PL("9. Оформление закупки сырья — проверка уменьшения бюджета."),
    PL("10. Запуск производства — проверка списания сырья и пополнения склада продукции."),
    PL("11. Оформление продажи — проверка увеличения бюджета."),
    PL("12. Выплата зарплаты сотруднику — проверка уменьшения бюджета."),
    PL("13. Получение кредита — проверка увеличения бюджета и расчёта суммы к выплате."),
    PL("14. Внесение платежей по кредиту с разными типами."),
    PL("15. Просмотр сводных отчётов и проверка корректности агрегатов."),
    PL("16. Печать отчёта в PDF через функцию «Печать»."),
    ...SHOT("Окно PowerShell с запущенным сервером python manage.py runserver", "Запуск сервера разработки Django"),
    ...SHOT("Главная страница системы (Dashboard) после входа", "Главная страница системы"),
    ...SHOT("Боковое меню навигации с разделами системы", "Боковое меню (сайдбар)"),
    ...SHOT("Страница «Бюджет» с формой пополнения", "Страница управления бюджетом"),
    ...SHOT("Заполненный справочник «Единицы измерения»", "Справочник «Единицы измерения»"),
    ...SHOT("Заполненный справочник «Должности»", "Справочник «Должности»"),
    ...SHOT("Список «Сырьё» с заполненными позициями и остатками", "Заполненный справочник сырья"),
    ...SHOT("Список «Готовая продукция» с моделями ноутбуков", "Заполненный справочник готовой продукции"),
    ...SHOT("Заполненная рецептура для одной из моделей", "Заполненные рецептуры"),
    ...SHOT("История операций на странице «Закупки» после нескольких закупок", "Журнал закупок сырья"),
    ...SHOT("История операций на странице «Производство»", "Журнал производственных операций"),
    ...SHOT("История операций на странице «Продажи»", "Журнал продаж"),
    ...SHOT("История выплат на странице «Зарплаты»", "Журнал выплат заработной платы"),
    ...SHOT("Активный кредит на странице «Кредиты» с расчётом графика", "Активный кредит со списком платежей"),
    ...SHOT("Итоговая страница отчётов после полного цикла операций", "Финальный отчёт по результатам тестирования"),
];

// =====================================================
// ЗАКЛЮЧЕНРЕ Р ЛРТЕРАТУРА
// =====================================================
const conclusion = [
    H1("Заключение"),
    P("В ходе выполнения курсового проекта была разработана полнофункциональная информационная система «HP Factory» для управления производственным предприятием, специализирующимся на сборке компьютерной техники. Все поставленные цели достигнуты, а функциональные и нефункциональные требования выполнены в полном объёме."),
    P("Спроектирована и реализована реляционная база данных в системе управления базами данных Microsoft SQL Server. База данных включает 13 связанных таблиц, охватывающих все аспекты деятельности предприятия: справочники сотрудников, должностей, единиц измерения, сырья и готовой продукции; рецептуры продукции; журналы закупок, производства, продаж, выплат заработной платы; модуль работы с кредитами и таблицу финансового состояния."),
    P("Создано 2 хранимые процедуры (sp_CheckBudget, sp_CheckMaterialAvailability), реализующие наиболее критичную бизнес-логику — проверку достаточности средств в бюджете и наличия сырья перед запуском производства. Разработаны 6 триггеров уровня AFTER INSERT, автоматически выполняющих побочные эффекты всех бизнес-операций — обновление бюджета, складских остатков и статусов кредитов. Размещение бизнес-логики на стороне базы данных обеспечивает её применение независимо от клиентского приложения и упрощает добавление новых интерфейсов."),
    P("Клиентская часть системы реализована в виде веб-приложения на фреймворке Django (Python). Применён архитектурный паттерн MVT (Model-View-Template) и подход «database-first», при котором схема базы данных является источником истины, а Django-модели лишь обеспечивают её объектное отображение. Разработано более 25 страниц приложения, обеспечивающих удобный пользовательский интерфейс для работы со всеми модулями системы."),
    P("Реализована полноценная система аутентификации с современным алгоритмом хеширования паролей Argon2, защита от CSRF-атак, исключена возможность SQL-инъекций благодаря использованию параметризованных запросов и ORM. Все основные страницы защищены проверкой авторизации."),
    P("В рамках шести лабораторных работ реализованы все основные бизнес-процессы: закупка сырья и контроль бюджета (лабораторная №1), производство продукции согласно рецептурам (№2), реализация готовой продукции (№3), учёт персонала и выплата заработной платы (№4), управление кредитами (№5), формирование сводной отчётности с визуализацией данных в виде графиков Chart.js (№6)."),
    P("Проект продемонстрировал на практике основные принципы построения корпоративных информационных систем: размещение бизнес-логики на стороне базы данных, обеспечение целостности данных через триггеры и ограничения, использование хранимых процедур для централизации правил, разделение представления и логики, защищённое хранение учётных данных пользователей. Полученные при выполнении проекта навыки могут быть применены при разработке реальных коммерческих систем учёта, ERP-решений и других информационных систем класса предприятия."),
];

const refs = [
    H1("Список использованной литературы"),
    PL("1. Дейт К. Дж. Введение в системы баз данных. — 8-е изд. — М.: Вильямс, 2005. — 1328 с."),
    PL("2. Карпов В. Э. Базы данных: учебное пособие. — М.: Юрайт, 2020. — 261 с."),
    PL("3. Грофф Дж., Вайнберг П., Оппель Э. SQL: полное руководство. — 3-е изд. — М.: Вильямс, 2015. — 960 с."),
    PL("4. Бен-Ган Р. Microsoft SQL Server 2019: основы T-SQL. — М.: Русская редакция, 2020. — 480 с."),
    PL("5. Лутц М. Рзучаем Python. — 5-е изд. — М.: Символ-Плюс, 2019. — 1600 с."),
    PL("6. Хольцнер С. Django: подробное руководство. — М.: Символ-Плюс, 2010. — 560 с."),
    PL("7. Документация Microsoft SQL Server. — URL: https://docs.microsoft.com/sql/ (дата обращения: 15.05.2026)."),
    PL("8. Документация Django. — URL: https://docs.djangoproject.com/ (дата обращения: 15.05.2026)."),
    PL("9. Документация mssql-django. — URL: https://github.com/microsoft/mssql-django (дата обращения: 15.05.2026)."),
    PL("10. Документация библиотеки Chart.js. — URL: https://www.chartjs.org/docs/ (дата обращения: 15.05.2026)."),
    PL("11. RFC 9106. Argon2 Memory-Hard Function for Password Hashing and Proof-of-Work Applications. — URL: https://tools.ietf.org/rfc/rfc9106.txt (дата обращения: 15.05.2026)."),
    PL("12. Документация Python. — URL: https://docs.python.org/3/ (дата обращения: 15.05.2026)."),
    PL("13. Стандарт ISO/IEC 9075:2016. Information technology — Database languages — SQL."),
    PL("14. Конноли Т., Бегг К. Базы данных: проектирование, реализация и сопровождение. — 3-е изд. — М.: Вильямс, 2003. — 1440 с."),
    PL("15. Гэри Б. ASP.NET MVC, Web API и Knockout: разработка веб-приложений с использованием современных технологий. — М.: ДМК Пресс, 2014. — 480 с."),
];

// =====================================================
// СБОРКА
// =====================================================
const doc = new Document({
    creator: "HP Factory",
    title: "Отчёт по курсовому проекту HP Factory",
    styles: {
        default: { document: { run: { font: FONT, size: SIZE } } }
    },
    sections: [{
        properties: {
            page: {
                size: { width: 11906, height: 16838 },
                margin: { top: 1134, right: 851, bottom: 1134, left: 1701 }
            }
        },
        children: [
            ...titlePage,
            ...tocPage,
            ...intro,
            ...sec1,
            ...sec2,
            ...sec3,
            ...sec4,
            ...sec5,
            ...sec6,
            ...conclusion,
            ...refs,
        ]
    }]
});

Packer.toBuffer(doc).then(buffer => {
    const out = "C:\\Users\\aisbe\\Downloads\\HP_Factory_Отчет.docx";
    fs.writeFileSync(out, buffer);
    console.log("Готово:", out, "(" + (buffer.length/1024).toFixed(1) + " КБ)");
    console.log("Скриншотов в документе:", figCounter);
});
