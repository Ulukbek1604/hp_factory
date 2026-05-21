GO

-- =============================================
-- 1. Таблицы-справочники
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Units')
CREATE TABLE Units (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(50) NOT NULL
);
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Positions')
CREATE TABLE Positions (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    title       NVARCHAR(100) NOT NULL
);
GO

-- =============================================
-- 2. Сотрудники
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Employees')
CREATE TABLE Employees (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    FullName    NVARCHAR(150) NOT NULL,
    PositionID  INT NULL REFERENCES Positions(id) ON DELETE SET NULL,
    Salary      DECIMAL(18,2) NOT NULL,
    Address     NVARCHAR(255) NULL,
    Phone       NVARCHAR(20) NULL
);
GO

-- =============================================
-- 3. Бюджет
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Budget')
CREATE TABLE Budget (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    TotalAmount DECIMAL(18,2) NOT NULL
);
GO

-- Вставить начальный бюджет если таблица пустая
IF NOT EXISTS (SELECT 1 FROM Budget)
    INSERT INTO Budget (TotalAmount) VALUES (1000000.00);
GO

-- =============================================
-- 4. Склад
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RawMaterials')
CREATE TABLE RawMaterials (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(100) NOT NULL,
    UnitID      INT NULL REFERENCES Units(id) ON DELETE SET NULL,
    Quantity    FLOAT NOT NULL DEFAULT 0,
    SumAmount   FLOAT NOT NULL DEFAULT 0
);
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FinishedProducts')
CREATE TABLE FinishedProducts (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(100) NOT NULL,
    UnitID      INT NULL REFERENCES Units(id) ON DELETE SET NULL,
    Quantity    FLOAT NOT NULL DEFAULT 0,
    SumAmount   FLOAT NOT NULL DEFAULT 0,
    SellingPrice DECIMAL(18,2) NOT NULL DEFAULT 0
);
GO

IF COL_LENGTH('FinishedProducts', 'SellingPrice') IS NULL
    ALTER TABLE FinishedProducts ADD SellingPrice DECIMAL(18,2) NOT NULL DEFAULT 0;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Ingredients')
CREATE TABLE Ingredients (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    ProductID   INT NOT NULL REFERENCES FinishedProducts(id) ON DELETE CASCADE,
    MaterialID  INT NOT NULL REFERENCES RawMaterials(id) ON DELETE CASCADE,
    Quantity    FLOAT NOT NULL
);
GO

-- =============================================
-- 5. Операции (Лабы 1, 2, 3)
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RawMaterialPurchases')
CREATE TABLE RawMaterialPurchases (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    MaterialID   INT NOT NULL REFERENCES RawMaterials(id) ON DELETE CASCADE,
    Quantity     FLOAT NOT NULL,
    SumAmount    DECIMAL(18,2) NOT NULL,
    PurchaseDate DATETIME NOT NULL DEFAULT GETDATE(),
    EmployeeID   INT NULL REFERENCES Employees(id) ON DELETE SET NULL
);
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductSales')
CREATE TABLE ProductSales (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    ProductID   INT NOT NULL REFERENCES FinishedProducts(id) ON DELETE CASCADE,
    Quantity    FLOAT NOT NULL,
    SumAmount   DECIMAL(18,2) NOT NULL,
    SaleDate    DATETIME NOT NULL DEFAULT GETDATE(),
    EmployeeID  INT NULL REFERENCES Employees(id) ON DELETE SET NULL
);
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductProduction')
CREATE TABLE ProductProduction (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    ProductID       INT NOT NULL REFERENCES FinishedProducts(id) ON DELETE CASCADE,
    Quantity        FLOAT NOT NULL,
    ProductionDate  DATETIME NOT NULL DEFAULT GETDATE(),
    EmployeeID      INT NULL REFERENCES Employees(id) ON DELETE SET NULL
);
GO

-- =============================================
-- 6. Финансовые операции (Лабы 4, 5)
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SalaryPayments')
CREATE TABLE SalaryPayments (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeID  INT NOT NULL REFERENCES Employees(id) ON DELETE CASCADE,
    Amount      DECIMAL(18,2) NOT NULL,
    PaymentDate DATETIME NOT NULL DEFAULT GETDATE()
);
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Credits')
CREATE TABLE Credits (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    Amount          DECIMAL(18,2) NOT NULL,
    InterestRate    DECIMAL(5,2) NULL,
    TermMonths      INT NULL,
    StartDate       DATETIME NULL,
    Status          NVARCHAR(20) NULL DEFAULT 'active',
    TotalToPay      DECIMAL(18,2) NULL,
    CreditDate      DATETIME NOT NULL DEFAULT GETDATE()
);
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'CreditPayments')
CREATE TABLE CreditPayments (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    CreditID        INT NOT NULL REFERENCES Credits(id) ON DELETE CASCADE,
    Amount          DECIMAL(18,2) NOT NULL,
    PaymentDate     DATETIME NOT NULL DEFAULT GETDATE(),
    PaymentType     NVARCHAR(20) NOT NULL DEFAULT 'combined',
    Note            NVARCHAR(MAX) NULL
);
GO

-- =============================================
-- 7. Заявочная система на производство
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProductionRequests')
CREATE TABLE ProductionRequests (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    CreationDate    DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedDate     DATETIME NOT NULL DEFAULT GETDATE(),
    Status          NVARCHAR(50) NOT NULL DEFAULT 'Создана',
    ApplicantID     INT NULL REFERENCES Employees(id) ON DELETE SET NULL,
    ApplicantFullName NVARCHAR(150) NULL,
    ProductID       INT NOT NULL REFERENCES FinishedProducts(id) ON DELETE CASCADE,
    Quantity        FLOAT NOT NULL,
    RejectionReason NVARCHAR(MAX) NULL
);
GO

IF COL_LENGTH('ProductionRequests', 'ApplicantFullName') IS NULL
    ALTER TABLE ProductionRequests ADD ApplicantFullName NVARCHAR(150) NULL;
GO

-- =============================================
-- 8. Хранимые процедуры 
-- =============================================

-- Лаба 1: Процедура 1 - Проверка бюджета
IF OBJECT_ID('sp_CheckBudget', 'P') IS NOT NULL DROP PROCEDURE sp_CheckBudget;
GO
CREATE PROCEDURE sp_CheckBudget
    @RequiredAmount DECIMAL(18,2),
    @IsAllowed      INT OUTPUT
AS
BEGIN
    DECLARE @CurrentBudget DECIMAL(18,2);
    SELECT TOP 1 @CurrentBudget = TotalAmount FROM Budget;

    IF @CurrentBudget >= @RequiredAmount
        SET @IsAllowed = 0;  -- 0 = Да, разрешено
    ELSE
        SET @IsAllowed = 1;  -- 1 = Нет, отказано
END;
GO

-- Лаба 1: Процедура 2 - Проверка сырья (например, для производства)
IF OBJECT_ID('sp_CheckMaterialAvailability', 'P') IS NOT NULL DROP PROCEDURE sp_CheckMaterialAvailability;
GO
CREATE PROCEDURE sp_CheckMaterialAvailability
    @ProductID INT,
    @ProductQty FLOAT,
    @IsAllowed INT OUTPUT
AS
BEGIN
    -- По умолчанию разрешено
    SET @IsAllowed = 0; 

    -- Проверяем, есть ли нехватка хотя бы одного ингредиента
    IF EXISTS (
        SELECT 1
        FROM Ingredients i
        JOIN RawMaterials rm ON i.MaterialID = rm.id
        WHERE i.ProductID = @ProductID
        AND rm.Quantity < (i.Quantity * @ProductQty)
    )
    BEGIN
        SET @IsAllowed = 1; -- 1 = Нет сырья
    END
END;
GO

-- =============================================
-- 8. Триггеры
-- =============================================

-- Лаба 1: Триггер после закупки сырья
IF OBJECT_ID('trg_AfterPurchaseInsert', 'TR') IS NOT NULL DROP TRIGGER trg_AfterPurchaseInsert;
GO
CREATE TRIGGER trg_AfterPurchaseInsert
ON RawMaterialPurchases
AFTER INSERT
AS
BEGIN
    -- Уменьшить бюджет
    UPDATE Budget
    SET TotalAmount = TotalAmount - (SELECT SUM(SumAmount) FROM inserted);

    -- Увеличить количество сырья на складе
    UPDATE rm
    SET rm.Quantity = rm.Quantity + i.Quantity
    FROM RawMaterials rm
    INNER JOIN inserted i ON rm.id = i.MaterialID;
END;
GO

-- Лаба 2: Триггер после производства продукции
IF OBJECT_ID('trg_AfterProductionInsert', 'TR') IS NOT NULL DROP TRIGGER trg_AfterProductionInsert;
GO
CREATE TRIGGER trg_AfterProductionInsert
ON ProductProduction
AFTER INSERT
AS
BEGIN
    -- Добавить готовую продукцию на склад
    UPDATE fp
    SET fp.Quantity = fp.Quantity + i.Quantity
    FROM FinishedProducts fp
    INNER JOIN inserted i ON fp.id = i.ProductID;

    -- Списать сырье по рецептуре (Ingredients)
    UPDATE rm
    SET rm.Quantity = rm.Quantity - (i.Quantity * ing.Quantity)
    FROM RawMaterials rm
    INNER JOIN Ingredients ing ON ing.MaterialID = rm.id
    INNER JOIN inserted i ON i.ProductID = ing.ProductID;
END;
GO

-- Лаба 3: Триггер после продажи продукции
IF OBJECT_ID('trg_AfterSaleInsert', 'TR') IS NOT NULL DROP TRIGGER trg_AfterSaleInsert;
GO
CREATE TRIGGER trg_AfterSaleInsert
ON ProductSales
AFTER INSERT
AS
BEGIN
    -- Уменьшить количество готовой продукции
    UPDATE fp
    SET fp.Quantity = fp.Quantity - i.Quantity
    FROM FinishedProducts fp
    INNER JOIN inserted i ON fp.id = i.ProductID;

    -- Увеличить бюджет с продаж
    UPDATE Budget
    SET TotalAmount = TotalAmount + (SELECT SUM(SumAmount) FROM inserted);
END;
GO

-- Лаба 4: Триггер после выплаты зарплаты
IF OBJECT_ID('trg_AfterSalaryInsert', 'TR') IS NOT NULL DROP TRIGGER trg_AfterSalaryInsert;
GO
CREATE TRIGGER trg_AfterSalaryInsert
ON SalaryPayments
AFTER INSERT
AS
BEGIN
    -- Уменьшить бюджет
    UPDATE Budget
    SET TotalAmount = TotalAmount - (SELECT SUM(Amount) FROM inserted);
END;
GO

-- Лаба 5: Триггер после получения кредита
IF OBJECT_ID('trg_AfterCreditInsert', 'TR') IS NOT NULL DROP TRIGGER trg_AfterCreditInsert;
GO
CREATE TRIGGER trg_AfterCreditInsert
ON Credits
AFTER INSERT
AS
BEGIN
    -- Увеличить бюджет
    UPDATE Budget
    SET TotalAmount = TotalAmount + (SELECT SUM(Amount) FROM inserted);

    -- Обновить TotalToPay для новых кредитов
    UPDATE Credits
    SET TotalToPay = CASE
        WHEN i.InterestRate IS NOT NULL AND i.TermMonths IS NOT NULL AND i.TermMonths > 0
        THEN i.Amount + (i.Amount * (i.InterestRate / 100.0) * (i.TermMonths / 12.0)) -- простые проценты
        ELSE i.Amount
    END
    FROM Credits c
    INNER JOIN inserted i ON c.id = i.id;
END;
GO

-- Триггер после выплаты по кредиту
IF OBJECT_ID('trg_AfterCreditPaymentInsert', 'TR') IS NOT NULL DROP TRIGGER trg_AfterCreditPaymentInsert;
GO
CREATE TRIGGER trg_AfterCreditPaymentInsert
ON CreditPayments
AFTER INSERT
AS
BEGIN
    -- Уменьшить бюджет
    UPDATE Budget
    SET TotalAmount = TotalAmount - (SELECT SUM(Amount) FROM inserted);

    -- Обновить статус кредитов (проставить 'paid' если выплачен полностью)
    UPDATE Credits
    SET Status = 'paid'
    WHERE id IN (SELECT CreditID FROM inserted)
    AND (SELECT SUM(Amount) FROM CreditPayments WHERE CreditID = Credits.id) >= Credits.TotalToPay;
END;
GO

PRINT 'Schema for Labs 1-6 created and updated successfully!';
GO
