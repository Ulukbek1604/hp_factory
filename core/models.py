"""
Models for HP Factory database.
All tables are managed=False (database-first approach).
The schema is defined in schema.sql and must be applied manually in SSMS.
"""
from django.db import models


class Unit(models.Model):
    """Единицы измерения"""
    name = models.CharField(max_length=50, verbose_name='Наименование')

    class Meta:
        managed = False
        db_table = 'Units'
        verbose_name = 'Единица измерения'
        verbose_name_plural = 'Единицы измерения'

    def __str__(self):
        return self.name


class Position(models.Model):
    """Должности"""
    title = models.CharField(max_length=100, verbose_name='Должность')

    class Meta:
        managed = False
        db_table = 'Positions'
        verbose_name = 'Должность'
        verbose_name_plural = 'Должности'

    def __str__(self):
        return self.title


class Employee(models.Model):
    """Сотрудники"""
    full_name = models.CharField(max_length=150, verbose_name='Полное имя', db_column='FullName')
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True, db_column='PositionID', verbose_name='Должность')
    salary = models.DecimalField(max_digits=18, decimal_places=2, verbose_name='Зарплата', db_column='Salary')
    address = models.CharField(max_length=255, blank=True, null=True, verbose_name='Адрес', db_column='Address')
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name='Телефон', db_column='Phone')

    class Meta:
        managed = False
        db_table = 'Employees'
        verbose_name = 'Сотрудник'
        verbose_name_plural = 'Сотрудники'

    def __str__(self):
        return self.full_name


class RawMaterial(models.Model):
    """Сырье"""
    name = models.CharField(max_length=100, verbose_name='Наименование', db_column='Name')
    unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, db_column='UnitID', verbose_name='Ед. измерения')
    quantity = models.FloatField(default=0, verbose_name='Количество', db_column='Quantity')
    sum_amount = models.FloatField(default=0, verbose_name='Сумма', db_column='SumAmount')

    class Meta:
        managed = False
        db_table = 'RawMaterials'
        verbose_name = 'Сырье'
        verbose_name_plural = 'Сырье'

    def __str__(self):
        return self.name


class FinishedProduct(models.Model):
    """Готовая продукция"""
    name = models.CharField(max_length=100, verbose_name='Наименование', db_column='Name')
    unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, db_column='UnitID', verbose_name='Ед. измерения')
    quantity = models.FloatField(default=0, verbose_name='Количество', db_column='Quantity')
    sum_amount = models.FloatField(default=0, verbose_name='Сумма', db_column='SumAmount')
    selling_price = models.DecimalField(max_digits=18, decimal_places=2, default=0, verbose_name='Цена (сом)', db_column='SellingPrice')

    class Meta:
        managed = False
        db_table = 'FinishedProducts'
        verbose_name = 'Готовая продукция'
        verbose_name_plural = 'Готовая продукция'

    def __str__(self):
        return self.name


class Ingredient(models.Model):
    """Рнгредиенты (Рецептура)"""
    product = models.ForeignKey(FinishedProduct, on_delete=models.CASCADE, db_column='ProductID', verbose_name='Продукция')
    material = models.ForeignKey(RawMaterial, on_delete=models.CASCADE, db_column='MaterialID', verbose_name='Сырье')
    quantity = models.FloatField(verbose_name='Количество', db_column='Quantity')

    class Meta:
        managed = False
        db_table = 'Ingredients'
        verbose_name = 'Рнгредиент'
        verbose_name_plural = 'Рнгредиенты'

    def __str__(self):
        return f'{self.product} - {self.material}'


class Budget(models.Model):
    """Бюджет предприятия"""
    total_amount = models.DecimalField(max_digits=18, decimal_places=2, verbose_name='Сумма бюджета', db_column='TotalAmount')

    class Meta:
        managed = False
        db_table = 'Budget'
        verbose_name = 'Бюджет'
        verbose_name_plural = 'Бюджет'

    def __str__(self):
        return f'Бюджет: {self.total_amount}'


class RawMaterialPurchase(models.Model):
    """Закупка сырья"""
    material = models.ForeignKey(RawMaterial, on_delete=models.CASCADE, db_column='MaterialID', verbose_name='Сырье')
    quantity = models.FloatField(verbose_name='Количество', db_column='Quantity')
    sum_amount = models.DecimalField(max_digits=18, decimal_places=2, verbose_name='Сумма', db_column='SumAmount')
    purchase_date = models.DateTimeField(auto_now_add=True, verbose_name='Дата', db_column='PurchaseDate')
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, db_column='EmployeeID', verbose_name='Сотрудник')

    class Meta:
        managed = False
        db_table = 'RawMaterialPurchases'
        verbose_name = 'Закупка сырья'
        verbose_name_plural = 'Закупки сырья'

    def __str__(self):
        return f'Закупка {self.material} - {self.quantity}'


class ProductSale(models.Model):
    """Продажа продукции"""
    product = models.ForeignKey(FinishedProduct, on_delete=models.CASCADE, db_column='ProductID', verbose_name='Продукция')
    quantity = models.FloatField(verbose_name='Количество', db_column='Quantity')
    sum_amount = models.DecimalField(max_digits=18, decimal_places=2, verbose_name='Сумма', db_column='SumAmount')
    sale_date = models.DateTimeField(auto_now_add=True, verbose_name='Дата', db_column='SaleDate')
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, db_column='EmployeeID', verbose_name='Сотрудник')

    class Meta:
        managed = False
        db_table = 'ProductSales'
        verbose_name = 'Продажа продукции'
        verbose_name_plural = 'Продажи продукции'

    def __str__(self):
        return f'Продажа {self.product} - {self.quantity}'


class ProductProduction(models.Model):
    """Производство продукции"""
    product = models.ForeignKey(FinishedProduct, on_delete=models.CASCADE, db_column='ProductID', verbose_name='Продукция')
    quantity = models.FloatField(verbose_name='Количество', db_column='Quantity')
    production_date = models.DateTimeField(auto_now_add=True, verbose_name='Дата', db_column='ProductionDate')
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, db_column='EmployeeID', verbose_name='Сотрудник')

    class Meta:
        managed = False
        db_table = 'ProductProduction'
        verbose_name = 'Производство продукции'
        verbose_name_plural = 'Производство продукции'

    def __str__(self):
        return f'Производство {self.product} - {self.quantity}'


class SalaryPayment(models.Model):
    """Выплата зарплаты"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, db_column='EmployeeID', verbose_name='Сотрудник')
    amount = models.DecimalField(max_digits=18, decimal_places=2, verbose_name='Сумма', db_column='Amount')
    payment_date = models.DateTimeField(auto_now_add=True, verbose_name='Дата', db_column='PaymentDate')

    class Meta:
        managed = False
        db_table = 'SalaryPayments'
        verbose_name = 'Выплата ЗП'
        verbose_name_plural = 'Выплаты ЗП'

    def __str__(self):
        return f'ЗП {self.employee} - {self.amount}'


class Credit(models.Model):
    """Кредит для бизнеса"""
    STATUS_CHOICES = [
        ('active', 'Активный'),
        ('paid', 'Погашен'),
        ('overdue', 'Просрочен'),
    ]

    amount = models.DecimalField(max_digits=18, decimal_places=2, verbose_name='Сумма кредита', db_column='Amount')
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, verbose_name='Процентная ставка (%)', db_column='InterestRate')
    term_months = models.IntegerField(null=True, blank=True, verbose_name='Срок (месяцев)', db_column='TermMonths')
    start_date = models.DateTimeField(null=True, blank=True, verbose_name='Дата начала', db_column='StartDate')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', verbose_name='Статус', db_column='Status')
    total_to_pay = models.DecimalField(max_digits=18, decimal_places=2, null=True, blank=True, verbose_name='Общая сумма к выплате', db_column='TotalToPay')
    credit_date = models.DateTimeField(auto_now_add=True, verbose_name='Дата получения', db_column='CreditDate')

    class Meta:
        managed = False
        db_table = 'Credits'
        verbose_name = 'Кредит'
        verbose_name_plural = 'Кредиты'

    def __str__(self):
        return f'Кредит {self.amount} от {self.credit_date}'

    @property
    def next_payment_date(self):
        from datetime import timedelta
        if not self.start_date:
            return None
        # Примерный расчет: 1 месяц = 30 дней
        return self.start_date + timedelta(days=30 * (self.payments.count() + 1))

    @property
    def is_payment_due(self):
        from django.utils import timezone
        next_date = self.next_payment_date
        if next_date and self.status == 'active':
            return timezone.now() >= next_date
        return False

    def calculate_total_to_pay(self):
        """Расчет общей суммы к выплате (простой процент)"""
        if self.interest_rate and self.term_months:
            monthly_rate = float(self.interest_rate) / 100 / 12
            total_interest = float(self.amount) * monthly_rate * self.term_months
            return float(self.amount) + total_interest
        return float(self.amount)

    def get_remaining_amount(self):
        """Расчет оставшейся задолженности"""
        payments = self.payments.all()
        if self.interest_rate and self.term_months:
            # Считаем по принципу простых процентов
            total_paid = sum(float(p.amount) for p in payments)
            total_expected = self.calculate_total_to_pay()
            remaining = total_expected - total_paid
            return max(0, remaining)
        else:
            total_paid = sum(float(p.amount) for p in payments)
            remaining = float(self.amount) - total_paid
            return max(0, remaining)

    def get_monthly_payment(self):
        """Расчет ежемесячного платежа (аннуитет)"""
        if self.term_months and self.term_months > 0 and self.interest_rate:
            principal = float(self.amount)
            monthly_rate = float(self.interest_rate) / 100 / 12
            if monthly_rate == 0:
                return principal / self.term_months
            # Формула аннуитета
            monthly = principal * (monthly_rate * (1 + monthly_rate) ** self.term_months) / \
                      ((1 + monthly_rate) ** self.term_months - 1)
            return monthly
        return 0

    def update_status(self):
        """Обновление статуса кредита на основе выплат"""
        remaining = self.get_remaining_amount()
        if remaining <= 0:
            self.status = 'paid'
        else:
            self.status = 'active'
        self.save()


class CreditPayment(models.Model):
    """Выплата по кредиту"""
    PAYMENT_TYPE_CHOICES = [
        ('principal', 'Основной долг'),
        ('interest', 'Проценты'),
        ('fine', 'Штраф/просрочка'),
        ('combined', 'Совместная выплата'),
    ]

    credit = models.ForeignKey(Credit, on_delete=models.CASCADE, related_name='payments', db_column='CreditID', verbose_name='Кредит')
    amount = models.DecimalField(max_digits=18, decimal_places=2, db_column='Amount', verbose_name='Сумма выплаты')
    payment_date = models.DateTimeField(auto_now_add=True, db_column='PaymentDate', verbose_name='Дата выплаты')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='combined', db_column='PaymentType', verbose_name='Тип платежа')
    note = models.TextField(blank=True, db_column='Note', verbose_name='Примечание')

    class Meta:
        managed = False
        db_table = 'CreditPayments'
        verbose_name = 'Выплата по кредиту'
        verbose_name_plural = 'Выплаты по кредитам'

    def __str__(self):
        return f'{self.credit}: {self.amount} ({self.get_payment_type_display()})'


class ProductionRequest(models.Model):
    """Заявка на производство (Заявочная система)"""
    STATUS_CHOICES = [
        ('Создана', 'Создана'),
        ('На проверке наличия сырья', 'На проверке наличия сырья'),
        ('На процессе закупки сырья', 'На процессе закупки сырья'),
        ('На процессе производства', 'На процессе производства'),
        ('На процессе продажи', 'На процессе продажи'),
        ('Выполнена', 'Выполнена'),
        ('Ошибка', 'Ошибка'),
    ]

    creation_date = models.DateTimeField(auto_now_add=True, db_column='CreationDate', verbose_name='Дата создания')
    updated_date = models.DateTimeField(auto_now=True, db_column='UpdatedDate', verbose_name='Дата обновления')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Создана', db_column='Status', verbose_name='Статус')
    applicant = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, db_column='ApplicantID', verbose_name='ФРО заявителя')
    applicant_full_name = models.CharField(max_length=150, blank=True, null=True, db_column='ApplicantFullName', verbose_name='ФИО заявителя')
    product = models.ForeignKey(FinishedProduct, on_delete=models.CASCADE, db_column='ProductID', verbose_name='Продукция')
    quantity = models.FloatField(verbose_name='Количество', db_column='Quantity')
    rejection_reason = models.TextField(blank=True, null=True, db_column='RejectionReason', verbose_name='Причина отказа')

    class Meta:
        managed = False
        db_table = 'ProductionRequests'
        verbose_name = 'Заявка на производство'
        verbose_name_plural = 'Заявки на производство'

    def __str__(self):
        return f'Заявка №{self.id} от {self.creation_date.strftime("%d.%m.%Y")} - {self.product.name} ({self.status})'
