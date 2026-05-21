USE HP_Factory;
GO

-- 1. Единицы измерения
INSERT INTO Units (name) VALUES 
('шт'),
('кг'),
('комплект'),
('упаковка');
GO

-- 2. Должности
INSERT INTO Positions (title) VALUES 
('Директор'),
('Менеджер по закупкам'),
('Инженер-сборщик'),
('Специалист по продажам'),
('Бухгалтер');
GO

-- 3. Сотрудники
INSERT INTO Employees (FullName, PositionID, Salary, Address, Phone) VALUES 
('Иванов Иван Иванович', 1, 150000, 'г. Бишкек, ул. Манаса 10', '+996555123456'),
('Петров Петр Петрович', 2, 80000, 'г. Бишкек, пр. Чуй 45', '+996777654321'),
('Сидоров Сидор Сидорович', 3, 90000, 'г. Ош, ул. Ленина 12', '+996500112233'),
('Смирнова Анна Карловна', 4, 75000, 'г. Бишкек, мкр. Асанбай 1', '+996707998877'),
('Кузнецова Мария Ивановна', 5, 85000, 'г. Бишкек, ул. Киевская 114', '+996551223344');
GO

-- 4. Сырье (Комплектующие для ПК и ноутбуков)
INSERT INTO RawMaterials (Name, UnitID, Quantity, SumAmount) VALUES 
('Процессор Intel Core i7', 1, 100, 1500000),
('Материнская плата HP', 1, 100, 800000),
('Оперативная память 16GB RAM', 1, 200, 600000),
('SSD диск 512GB', 1, 150, 450000),
('Корпус для ноутбука HP Victus', 1, 50, 250000),
('Блок питания 500W', 1, 100, 300000),
('Матрица (Экран) 15.6"', 1, 60, 420000);
GO

-- 5. Готовая продукция
INSERT INTO FinishedProducts (Name, UnitID, Quantity, SumAmount, SellingPrice) VALUES 
('Ноутбук HP Victus 15', 1, 10, 0, 75000),
('Системный блок HP Pavilion', 1, 5, 0, 60000);
GO

-- 6. Рецептура (Ингредиенты)
-- Для Ноутбука HP Victus 15 (ProductID = 1)
INSERT INTO Ingredients (ProductID, MaterialID, Quantity) VALUES 
(1, 1, 1), -- 1 Процессор
(1, 2, 1), -- 1 Материнская плата
(1, 3, 1), -- 1 Плашка RAM
(1, 4, 1), -- 1 SSD
(1, 5, 1), -- 1 Корпус
(1, 7, 1); -- 1 Экран

-- Для Системного блока HP Pavilion (ProductID = 2)
INSERT INTO Ingredients (ProductID, MaterialID, Quantity) VALUES 
(2, 1, 1), -- 1 Процессор
(2, 2, 1), -- 1 Материнская плата
(2, 3, 2), -- 2 Плашки RAM (32GB)
(2, 4, 1), -- 1 SSD
(2, 6, 1); -- 1 Блок питания
GO

PRINT 'Database seeded successfully with initial data!';
GO
