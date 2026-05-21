"""
Views for HP Factory core application.
Lab #1: Raw Material Purchase Management with Budget Check via Stored Procedure.
Lab #3 (Security): Authentication, Registration, Profile, Password Hashing Demo.
"""
import json
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.db import connection
from django.db.models import Sum, Q
from django.utils import timezone

def is_admin(user):
    return user.is_authenticated and user.is_superuser

def is_accountant(user):
    return user.is_authenticated and (user.is_staff or user.is_superuser)

def is_worker(user):
    return user.is_authenticated

from .models import (
    Unit, Position, Employee, RawMaterial, FinishedProduct,
    Budget, RawMaterialPurchase, ProductSale, ProductProduction,
    Ingredient, SalaryPayment, Credit, CreditPayment, ProductionRequest
)
from .forms import (
    PurchaseForm, ProductionForm, SaleForm, SalaryPaymentForm, CreditForm, CreditPaymentForm,
    RegisterForm, LoginForm, ProfileEditForm, ProductionRequestForm
)
from .services import process_production_request



# =========================================================
# DASHBOARD
# =========================================================
@login_required
def dashboard(request):
    """Главная страница - обзор предприятия"""
    can_manage_finance = is_accountant(request.user)
    can_manage_staff = is_admin(request.user)

    budget = Budget.objects.first()
    raw_count = RawMaterial.objects.count()
    product_count = FinishedProduct.objects.count()
    employee_count = Employee.objects.count()
    recent_purchases = RawMaterialPurchase.objects.select_related('material', 'employee').order_by('-purchase_date')[:5]

    # Рнформация по кредитам
    active_credits = Credit.objects.filter(status='active').count()
    total_credit_debt = sum(c.get_remaining_amount() for c in Credit.objects.all())
    due_credits = [c for c in Credit.objects.filter(status='active') if c.is_payment_due] if can_manage_finance else []

    # Сводка по заявкам на производство
    requests_qs = ProductionRequest.objects.select_related('product').order_by('-creation_date')
    request_status_order = [
        'Создана',
        'На проверке наличия сырья',
        'На процессе закупки сырья',
        'На процессе производства',
        'На процессе продажи',
        'Выполнена',
        'Ошибка',
    ]
    request_status_stats = [
        {
            'status': status,
            'count': requests_qs.filter(status=status).count(),
        }
        for status in request_status_order
    ]
    total_requests = requests_qs.count()
    requests_in_progress = requests_qs.exclude(status__in=['Выполнена', 'Ошибка']).count()
    requests_completed = requests_qs.filter(status='Выполнена').count()
    requests_errors = requests_qs.filter(status='Ошибка').count()
    recent_requests = requests_qs[:8]

    context = {
        'budget': budget,
        'raw_count': raw_count,
        'product_count': product_count,
        'employee_count': employee_count,
        'recent_purchases': recent_purchases,
        'active_credits': active_credits,
        'total_credit_debt': total_credit_debt,
        'due_credits': due_credits,
        'can_manage_finance': can_manage_finance,
        'can_manage_staff': can_manage_staff,
        'total_requests': total_requests,
        'requests_in_progress': requests_in_progress,
        'requests_completed': requests_completed,
        'requests_errors': requests_errors,
        'request_status_stats': request_status_stats,
        'recent_requests': recent_requests,
    }
    return render(request, 'core/dashboard.html', context)


# =========================================================
# СПРАВОЧНРКР
# =========================================================
@login_required
@user_passes_test(is_admin, login_url='/')
def units_list(request):
    """Единицы измерения"""
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'add':
            name = request.POST.get('name', '').strip()
            if name:
                Unit.objects.create(name=name)
                messages.success(request, f'Единица измерения "{name}" добавлена.')
        elif action == 'delete':
            pk = request.POST.get('pk')
            Unit.objects.filter(pk=pk).delete()
            messages.success(request, 'Запись удалена.')
        elif action == 'edit':
            pk = request.POST.get('pk')
            name = request.POST.get('name', '').strip()
            if name:
                Unit.objects.filter(pk=pk).update(name=name)
                messages.success(request, 'Запись обновлена.')
        return redirect('units_list')

    units = Unit.objects.all()
    return render(request, 'core/units_list.html', {'units': units})


@login_required
@user_passes_test(is_admin, login_url='/')
def positions_list(request):
    """Должности"""
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'add':
            title = request.POST.get('title', '').strip()
            if title:
                Position.objects.create(title=title)
                messages.success(request, f'Должность "{title}" добавлена.')
        elif action == 'delete':
            pk = request.POST.get('pk')
            Position.objects.filter(pk=pk).delete()
            messages.success(request, 'Запись удалена.')
        elif action == 'edit':
            pk = request.POST.get('pk')
            title = request.POST.get('title', '').strip()
            if title:
                Position.objects.filter(pk=pk).update(title=title)
                messages.success(request, 'Запись обновлена.')
        return redirect('positions_list')

    positions = Position.objects.all()
    return render(request, 'core/positions_list.html', {'positions': positions})


@login_required
@user_passes_test(is_admin, login_url='/')
def employees_list(request):
    """Сотрудники"""
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'add':
            Employee.objects.create(
                full_name=request.POST.get('full_name'),
                position_id=request.POST.get('position_id'),
                salary=request.POST.get('salary'),
                address=request.POST.get('address', ''),
                phone=request.POST.get('phone', ''),
            )
            messages.success(request, 'Сотрудник добавлен.')
        elif action == 'delete':
            pk = request.POST.get('pk')
            Employee.objects.filter(pk=pk).delete()
            messages.success(request, 'Запись удалена.')
        elif action == 'edit':
            pk = request.POST.get('pk')
            Employee.objects.filter(pk=pk).update(
                full_name=request.POST.get('full_name'),
                position_id=request.POST.get('position_id'),
                salary=request.POST.get('salary'),
                address=request.POST.get('address', ''),
                phone=request.POST.get('phone', ''),
            )
            messages.success(request, 'Запись обновлена.')
        return redirect('employees_list')

    employees = Employee.objects.select_related('position').all()
    positions = Position.objects.all()
    return render(request, 'core/employees_list.html', {'employees': employees, 'positions': positions})


@login_required
@user_passes_test(is_accountant, login_url='/')
def budget_view(request):
    """Бюджет"""
    budget = Budget.objects.first()
    if request.method == 'POST':
        amount = request.POST.get('amount')
        if budget:
            Budget.objects.filter(pk=budget.pk).update(total_amount=amount)
            messages.success(request, 'Бюджет обновлён.')
        else:
            Budget.objects.create(total_amount=amount)
            messages.success(request, 'Бюджет установлен.')
        return redirect('budget')
    return render(request, 'core/budget.html', {'budget': budget})


# =========================================================
# СКЛАД
# =========================================================
@login_required
@user_passes_test(is_accountant, login_url='/')
def raw_materials_list(request):
    """Список сырья"""
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'add':
            RawMaterial.objects.create(
                name=request.POST.get('name'),
                unit_id=request.POST.get('unit_id'),
                quantity=0,
                sum_amount=0,
            )
            messages.success(request, 'Сырье добавлено.')
        elif action == 'delete':
            pk = request.POST.get('pk')
            RawMaterial.objects.filter(pk=pk).delete()
            messages.success(request, 'Запись удалена.')
        elif action == 'edit':
            pk = request.POST.get('pk')
            RawMaterial.objects.filter(pk=pk).update(
                name=request.POST.get('name'),
                unit_id=request.POST.get('unit_id'),
            )
            messages.success(request, 'Запись обновлена.')
        return redirect('raw_materials_list')

    materials = RawMaterial.objects.select_related('unit').all()
    units = Unit.objects.all()
    return render(request, 'core/raw_materials_list.html', {'materials': materials, 'units': units})


@login_required
@user_passes_test(is_accountant, login_url='/')
def finished_products_list(request):
    """Список готовой продукции"""
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'add':
            FinishedProduct.objects.create(
                name=request.POST.get('name'),
                unit_id=request.POST.get('unit_id'),
                quantity=0,
                sum_amount=0,
                selling_price=request.POST.get('selling_price', 0)
            )
            messages.success(request, 'Продукция добавлена.')
        elif action == 'delete':
            pk = request.POST.get('pk')
            FinishedProduct.objects.filter(pk=pk).delete()
            messages.success(request, 'Запись удалена.')
        elif action == 'edit':
            pk = request.POST.get('pk')
            FinishedProduct.objects.filter(pk=pk).update(
                name=request.POST.get('name'),
                unit_id=request.POST.get('unit_id'),
                selling_price=request.POST.get('selling_price', 0)
            )
            messages.success(request, 'Запись обновлена.')
        return redirect('finished_products_list')

    products = FinishedProduct.objects.select_related('unit').all()
    units = Unit.objects.all()
    return render(request, 'core/finished_products_list.html', {'products': products, 'units': units})


# =========================================================
# ЗАКУПКА СЫРЬЯ (Лаба 1 - Основной функционал)
# =========================================================
def _check_budget_sp(required_amount):
    """
    Calls the stored procedure sp_CheckBudget.
    Returns True if budget is sufficient (SP returns 0), False otherwise (SP returns 1).
    """
    with connection.cursor() as cursor:
        cursor.execute(
            "DECLARE @result INT; "
            "EXEC sp_CheckBudget @RequiredAmount=%s, @IsAllowed=@result OUTPUT; "
            "SELECT @result;",
            [required_amount]
        )
        result = cursor.fetchone()[0]
    return result == 0  # 0 = Yes, 1 = No



# core/views.py — добавляем пагинацию
from django.core.paginator import Paginator

def purchases_list(request):
    qs = RawMaterialPurchase.objects.select_related(
        'material', 'employee'
    ).order_by('-purchase_date')
    paginator = Paginator(qs, 25)  # 25 записей на страницу
    page_number = request.GET.get('page')
    purchases = paginator.get_page(page_number)
    return render(request, 'core/purchases_list.html', {'purchases': purchases})

@login_required
@user_passes_test(is_accountant, login_url='/')
def purchase_add(request):
    """Добавление новой закупки сырья с проверкой бюджета через SP"""
    if request.method == 'POST':
        form = PurchaseForm(request.POST)
        if form.is_valid():
            sum_amount = form.cleaned_data['sum_amount']

            # ---- Вызов Хранимой Процедуры ----
            budget_ok = _check_budget_sp(sum_amount)

            if not budget_ok:
                messages.error(
                    request,
                    f'❌ Недостаточно средств в бюджете для закупки на сумму {sum_amount} сом.'
                )
            else:
                # Сохраняем запись — сработает триггер trg_AfterPurchaseInsert
                purchase = RawMaterialPurchase(
                    material=form.cleaned_data['material'],
                    quantity=form.cleaned_data['quantity'],
                    sum_amount=sum_amount,
                    employee=form.cleaned_data['employee'],
                )
                purchase.save()
                messages.success(
                    request,
                    f'✅ Закупка успешно добавлена! Бюджет уменьшен на {sum_amount} сом. '
                    f'Склад сырья пополнен на {form.cleaned_data["quantity"]} ед.'
                )
                return redirect('purchases_list')
    else:
        form = PurchaseForm()

    budget = Budget.objects.first()
    return render(request, 'core/purchase_add.html', {'form': form, 'budget': budget})


@login_required
@user_passes_test(is_admin, login_url='/')
def purchase_delete(request, pk):
    """Удаление записи о закупке"""
    if request.method == 'POST':
        purchase = get_object_or_404(RawMaterialPurchase, pk=pk)
        purchase.delete()
        messages.success(request, 'Запись о закупке удалена.')
    return redirect('purchases_list')


def _check_material_availability_sp(product_id, quantity):
    """
    Calls sp_CheckMaterialAvailability. Returns True if enough materials.
    """
    with connection.cursor() as cursor:
        cursor.execute(
            "DECLARE @result INT; "
            "EXEC sp_CheckMaterialAvailability @ProductID=%s, @ProductQty=%s, @IsAllowed=@result OUTPUT; "
            "SELECT @result;",
            [product_id, quantity]
        )
        result = cursor.fetchone()[0]
    return result == 0 


# =========================================================
# ПРОРЗВОДСТВО ГОТОВОЙ ПРОДУКЦРР (Лаба 2)
# =========================================================
@login_required
@user_passes_test(is_accountant, login_url='/')
def production_list(request):
    productions = ProductProduction.objects.select_related('product', 'employee').order_by('-production_date')
    return render(request, 'core/production_list.html', {'productions': productions})

@login_required
@user_passes_test(is_accountant, login_url='/')
def production_add(request):
    if request.method == 'POST':
        form = ProductionForm(request.POST)
        if form.is_valid():
            product = form.cleaned_data['product']
            qty = form.cleaned_data['quantity']

            # Проверяем, есть ли хоть один ингредиент в рецептуре
            has_recipe = Ingredient.objects.filter(product=product).exists()
            if not has_recipe:
                messages.error(
                    request,
                    f'❌ У продукта «{product.name}» не задана рецептура. '
                    f'Сначала добавьте ингредиенты на странице Рецептура.'
                )
            else:
                materials_ok = _check_material_availability_sp(product.id, qty)
                if not materials_ok:
                    messages.error(request, '❌ Недостаточно сырья для производства указанного количества продукции.')
                else:
                    ProductProduction.objects.create(
                        product=product,
                        quantity=qty,
                        employee=form.cleaned_data['employee']
                    )
                    messages.success(request, f'✅ Продукция произведена. Сырье списано, склад готовой продукции пополнен.')
                    return redirect('production_list')
    else:
        form = ProductionForm()
    return render(request, 'core/production_add.html', {'form': form})


# =========================================================
# ЗАЯВОЧНАЯ СРСТЕМА НА ПРОРЗВОДСТВО
# =========================================================
@login_required
def production_requests_list(request):
    """Список заявок на производство"""
    base_qs = ProductionRequest.objects.select_related('product', 'applicant').order_by('-creation_date')

    if request.user.is_staff or request.user.is_superuser:
        requests_list = base_qs
        can_view_all_requests = True
    else:
        user_full_name = request.user.get_full_name().strip()
        user_name = request.user.username
        requests_list = base_qs.filter(
            Q(applicant_full_name=user_name) |
            Q(applicant_full_name=user_full_name)
        )
        can_view_all_requests = False

    return render(
        request,
        'core/production_requests_list.html',
        {
            'requests_list': requests_list,
            'can_view_all_requests': can_view_all_requests,
        }
    )

@login_required
def production_request_add(request):
    """Создание заявки на производство и автоматическая обработка."""
    if request.method == 'POST':
        form = ProductionRequestForm(request.POST)
        if form.is_valid():
            if request.user.is_staff or request.user.is_superuser:
                applicant_full_name = form.cleaned_data['applicant_full_name'].strip()
                if not applicant_full_name:
                    applicant_full_name = request.user.get_full_name() or request.user.username
            else:
                applicant_full_name = request.user.get_full_name().strip() or request.user.username

            # 1. Создаём заявку (статус "Создана")
            req = ProductionRequest.objects.create(
                product=form.cleaned_data['product'],
                quantity=form.cleaned_data['quantity'],
                applicant_full_name=applicant_full_name,
                status='Создана'
            )
            
            # 2. Запускаем автоматическую обработку (сервис)
            success, message = process_production_request(req.id)
            
            if success:
                messages.success(request, message)
            else:
                messages.error(request, f'При обработке заявки возникла ошибка: {message}')
                
            return redirect('production_requests_list')
    else:
        initial_full_name = request.user.get_full_name() or request.user.username
        form = ProductionRequestForm(initial={'applicant_full_name': initial_full_name})
        
    return render(request, 'core/production_request_add.html', {'form': form})


# =========================================================
# ПРОДАЖА ГОТОВОЙ ПРОДУКЦРР (Лаба 3)
# =========================================================
@login_required
@user_passes_test(is_accountant, login_url='/')
def sales_list(request):
    sales = ProductSale.objects.select_related('product', 'employee').order_by('-sale_date')
    return render(request, 'core/sales_list.html', {'sales': sales})

@login_required
@user_passes_test(is_accountant, login_url='/')
def sales_add(request):
    if request.method == 'POST':
        form = SaleForm(request.POST)
        if form.is_valid():
            product = form.cleaned_data['product']
            qty = form.cleaned_data['quantity']
            
            if product.quantity < qty:
                messages.error(request, f'❌ Недостаточно продукции на складе. Доступно: {product.quantity}')
            else:
                ProductSale.objects.create(
                    product=product,
                    quantity=qty,
                    sum_amount=form.cleaned_data['sum_amount'],
                    employee=form.cleaned_data['employee']
                )
                messages.success(request, f'✅ Продажа зарегистрирована. Продукция списана, бюджет увеличен.')
                return redirect('sales_list')
    else:
        form = SaleForm()
        
    prices = {p.id: float(p.selling_price) for p in FinishedProduct.objects.all()}
    prices_json = json.dumps(prices)
    return render(request, 'core/sales_add.html', {'form': form, 'prices_json': prices_json})


# =========================================================
# ЗАРПЛАТА (Лаба 4)
# =========================================================
@login_required
@user_passes_test(is_accountant, login_url='/')
def salary_list(request):
    salaries = SalaryPayment.objects.select_related('employee').order_by('-payment_date')
    return render(request, 'core/salary_list.html', {'salaries': salaries})

@login_required
@user_passes_test(is_accountant, login_url='/')
def salary_add(request):
    if request.method == 'POST':
        form = SalaryPaymentForm(request.POST)
        if form.is_valid():
            amount = form.cleaned_data['amount']
            budget_ok = _check_budget_sp(amount)
            if not budget_ok:
                messages.error(request, '❌ Недостаточно средств в бюджете для выплаты зарплаты.')
            else:
                SalaryPayment.objects.create(
                    employee=form.cleaned_data['employee'],
                    amount=amount
                )
                messages.success(request, '✅ Зарплата выплачена. Бюджет уменьшен.')
                return redirect('salary_list')
    else:
        form = SalaryPaymentForm()
        
    budget = Budget.objects.first()
    return render(request, 'core/salary_add.html', {'form': form, 'budget': budget})


# =========================================================
# КРЕДРТЫ (Лаба 5 - Расширенный функционал)
# =========================================================

@login_required
@user_passes_test(is_accountant, login_url='/')
def credits_list(request):
    """Список кредитов с отображением остатка"""
    all_credits = Credit.objects.prefetch_related('payments').order_by('-credit_date')

    # Добавляем информацию об остатке к каждому кредиту
    credits_with_balance = []
    for credit in all_credits:
        remaining = credit.get_remaining_amount()
        total_paid = sum(float(p.amount) for p in credit.payments.all())
        credits_with_balance.append({
            'credit': credit,
            'remaining': remaining,
            'total_paid': total_paid,
            'progress': (total_paid / credit.calculate_total_to_pay() * 100) if credit.calculate_total_to_pay() > 0 else 0
        })

    total_credits = Credit.objects.aggregate(Sum('amount'))['amount__sum'] or 0
    total_remaining = sum(c['remaining'] for c in credits_with_balance)
    due_credits = [c for c in Credit.objects.filter(status='active') if c.is_payment_due]

    return render(request, 'core/credits_list.html', {
        'credits_data': credits_with_balance,
        'total_credits': total_credits,
        'total_remaining': total_remaining,
        'due_credits': due_credits,
    })


@login_required
@user_passes_test(is_accountant, login_url='/')
def credit_add(request):
    """Добавление нового кредита"""
    if request.method == 'POST':
        form = CreditForm(request.POST)
        if form.is_valid():
            amount = form.cleaned_data['amount']
            interest_rate = form.cleaned_data.get('interest_rate')
            term_months = form.cleaned_data.get('term_months')
            start_date = form.cleaned_data.get('start_date') or timezone.now()

            # Создаем кредит
            credit = Credit.objects.create(
                amount=amount,
                interest_rate=interest_rate,
                term_months=term_months,
                start_date=start_date
            )

            # Рассчитываем общую сумму к выплате
            if interest_rate and term_months:
                credit.total_to_pay = credit.calculate_total_to_pay()
                credit.save()

            messages.success(request, f'✅ Кредит на сумму {amount} сом получен. Бюджет увеличен.')
            return redirect('credits_list')
    else:
        form = CreditForm()

    return render(request, 'core/credit_add.html', {'form': form})


@login_required
@user_passes_test(is_accountant, login_url='/')
def credit_pay(request, credit_id):
    """Погашение кредита (выплата)"""
    credit = get_object_or_404(Credit, pk=credit_id)

    if request.method == 'POST':
        form = CreditPaymentForm(request.POST)
        # Фиксируем выплату на конкретном кредите из URL
        form.fields['credit'].queryset = Credit.objects.filter(pk=credit_id)
        if form.is_valid():
            amount = form.cleaned_data['amount']
            payment_type = form.cleaned_data['payment_type']
            note = form.cleaned_data.get('note', '')

            # Проверяем, что сумма не превышает остаток
            remaining = credit.get_remaining_amount()
            if amount > remaining:
                messages.error(request, f'❌ Сумма выплаты ({amount}) превышает остаток задолженности ({remaining}).')
                return redirect('credit_pay', credit_id=credit_id)

            # Проверяем бюджет до проведения выплаты
            budget_ok = _check_budget_sp(amount)
            if not budget_ok:
                messages.error(request, '❌ Недостаточно средств в бюджете для выплаты по кредиту.')
                return redirect('credit_pay', credit_id=credit_id)

            # Создаем запись о выплате только после успешной проверки бюджета
            CreditPayment.objects.create(
                credit=credit,
                amount=amount,
                payment_type=payment_type,
                note=note
            )

            # Обновляем статус кредита
            credit.update_status()

            if credit.status == 'paid':
                messages.success(request, f'✅ Кредит полностью погашен! Выплачено: {amount} сом.')
            else:
                remaining = credit.get_remaining_amount()
                messages.success(request, f'✅ Выплата зарегистрирована. Осталось выплатить: {remaining:.2f} сом.')

            return redirect('credits_list')
    else:
        form = CreditPaymentForm(initial={'credit': credit})
        form.fields['credit'].queryset = Credit.objects.filter(pk=credit_id)
        # Показываем информацию о кредите
        remaining = credit.get_remaining_amount()
        monthly_payment = credit.get_monthly_payment()

    return render(request, 'core/credit_pay.html', {
        'credit': credit,
        'form': form,
        'remaining': remaining,
        'monthly_payment': monthly_payment
    })


@login_required
@user_passes_test(is_accountant, login_url='/')
def payment_schedule(request, credit_id):
    """Просмотр графика платежей по кредиту"""
    credit = get_object_or_404(Credit, pk=credit_id)
    payments = credit.payments.all().order_by('payment_date')
    total_paid = sum(float(p.amount) for p in payments)
    remaining = credit.get_remaining_amount()

    # Рассчитываем прогноз по аннуитетным платежам
    schedule = []
    if credit.term_months and credit.term_months > 0 and credit.interest_rate:
        monthly_payment = credit.get_monthly_payment()
        balance = float(credit.amount)
        monthly_rate = float(credit.interest_rate) / 100 / 12

        for month in range(1, credit.term_months + 1):
            interest_part = balance * monthly_rate
            principal_part = monthly_payment - interest_part
            balance -= principal_part

            schedule.append({
                'month': month,
                'payment': monthly_payment,
                'interest': interest_part,
                'principal': principal_part,
                'balance': max(0, balance)
            })

    return render(request, 'core/payment_schedule.html', {
        'credit': credit,
        'payments': payments,
        'total_paid': total_paid,
        'remaining': remaining,
        'schedule': schedule
    })


# =========================================================
# РЕЦЕПТУРА (Состав продукции)
# =========================================================
@login_required
@user_passes_test(is_accountant, login_url='/')
def ingredients_list(request):
    """Управление рецептурой — список ингредиентов всех продуктов"""
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'add':
            product_id = request.POST.get('product_id')
            material_id = request.POST.get('material_id')
            quantity = request.POST.get('quantity')
            if product_id and material_id and quantity:
                Ingredient.objects.create(
                    product_id=product_id,
                    material_id=material_id,
                    quantity=quantity
                )
                messages.success(request, '✅ Рнгредиент добавлен в рецептуру.')
            else:
                messages.error(request, '❌ Заполните все поля.')
        elif action == 'delete':
            pk = request.POST.get('pk')
            Ingredient.objects.filter(pk=pk).delete()
            messages.success(request, 'Рнгредиент удалён.')
        return redirect('ingredients_list')

    ingredients = Ingredient.objects.select_related('product', 'material', 'material__unit').order_by('product__name')
    products = FinishedProduct.objects.all()
    materials = RawMaterial.objects.select_related('unit').all()
    return render(request, 'core/ingredients_list.html', {
        'ingredients': ingredients,
        'products': products,
        'materials': materials,
    })


# =========================================================
# ОТЧЕТЫ (Лаба 6 - Расширенные)
# =========================================================
@login_required
@user_passes_test(is_accountant, login_url='/')
def reports_view(request):
    # Ртоги
    total_purchases = RawMaterialPurchase.objects.aggregate(Sum('sum_amount'))['sum_amount__sum'] or 0
    total_sales = ProductSale.objects.aggregate(Sum('sum_amount'))['sum_amount__sum'] or 0
    total_salary = SalaryPayment.objects.aggregate(Sum('amount'))['amount__sum'] or 0
    total_credits = Credit.objects.aggregate(Sum('amount'))['amount__sum'] or 0
    total_credit_payments = CreditPayment.objects.aggregate(Sum('amount'))['amount__sum'] or 0

    # Расчет общей задолженности по кредитам
    total_remaining = 0
    for credit in Credit.objects.all():
        total_remaining += credit.get_remaining_amount()

    # Детализация по операциям
    purchases = RawMaterialPurchase.objects.select_related('material', 'employee').order_by('-purchase_date')[:50]
    productions = ProductProduction.objects.select_related('product', 'employee').order_by('-production_date')[:50]
    sales = ProductSale.objects.select_related('product', 'employee').order_by('-sale_date')[:50]
    salaries = SalaryPayment.objects.select_related('employee').order_by('-payment_date')[:50]

    all_credits = Credit.objects.prefetch_related('payments').order_by('-credit_date')[:50]
    credit_payments = CreditPayment.objects.select_related('credit').order_by('-payment_date')[:50]

    context = {
        'total_purchases': total_purchases,
        'total_sales': total_sales,
        'total_salary': total_salary,
        'total_credits': total_credits,
        'total_credit_payments': total_credit_payments,
        'total_remaining_credit': total_remaining,
        'budget': Budget.objects.first(),
        'purchases': purchases,
        'productions': productions,
        'sales': sales,
        'salaries': salaries,
        'credits': all_credits,
        'credit_payments': credit_payments,
    }
    return render(request, 'core/reports.html', context)


# =========================================================
# АВТОРРЗАЦРЯ Р БЕЗОПАСНОСТЬ (Практическая работа №3)
# =========================================================

def register_view(request):
    """Публичная регистрация нового пользователя."""
    if request.user.is_authenticated:
        # Админ может создавать новые аккаунты из интерфейса, оставаясь в системе.
        if not request.user.is_superuser:
            messages.info(request, 'Создание нового аккаунта доступно только администратору.')
            return redirect('dashboard')

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            if request.user.is_authenticated and request.user.is_superuser:
                messages.success(request, f'Аккаунт «{user.username}» успешно создан.')
                return redirect('dashboard')
            messages.success(request, f'Аккаунт «{user.username}» успешно создан. Теперь войдите в систему.')
            return redirect('login')
        messages.error(request, 'Пожалуйста, исправьте ошибки в форме.')
    else:
        form = RegisterForm()
    return render(request, 'core/register.html', {'form': form})


def login_view(request):
    """Вход пользователя в систему."""
    if request.user.is_authenticated:
        return redirect('dashboard')
    if request.method == 'POST':
        form = LoginForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            messages.success(request, f'Добро пожаловать, {user.first_name or user.username}!')
            return redirect('dashboard')
        messages.error(request, 'Неверный логин или пароль.')
    else:
        form = LoginForm()
    return render(request, 'core/login.html', {'form': form})


def logout_view(request):
    """Выход из системы."""
    if request.method == 'POST':
        logout(request)
        messages.success(request, 'Вы вышли из системы.')
    return redirect('login')


@login_required
def profile_view(request):
    """Личный кабинет пользователя — защищён декоратором @login_required.
    Персональные данные (имя, email) доступны только авторизованному владельцу.
    """
    if request.method == 'POST':
        form = ProfileEditForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, '✅ Профиль успешно обновлён.')
            return redirect('profile')
        messages.error(request, '❌ Ошибка при обновлении профиля.')
    else:
        form = ProfileEditForm(instance=request.user)
    return render(request, 'core/profile.html', {'form': form})


@login_required
def password_hash_demo(request):
    """
    Демонстрация всех алгоритмов хэширования пароля.
    Практическая работа №3, Задание 2.
    Показывает: bcrypt, Argon2, scrypt, SHA-256, SHA-384, SHA-512, MD5.
    """
    import hashlib
    results = []
    password = request.GET.get('password', 'MySecretPassword123')

    # --- 1. SHA-256 ---
    sha256_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
    results.append({
        'name': 'SHA-256',
        'category': 'cryptographic',
        'hash': sha256_hash,
        'length': len(sha256_hash),
        'secure': False,
        'note': 'Криптографическая хэш-функция. Быстрая, но не предназначена для паролей — уязвима к brute-force и rainbow-table атакам.',
    })

    # --- 2. SHA-384 ---
    sha384_hash = hashlib.sha384(password.encode('utf-8')).hexdigest()
    results.append({
        'name': 'SHA-384',
        'category': 'cryptographic',
        'hash': sha384_hash,
        'length': len(sha384_hash),
        'secure': False,
        'note': 'Более длинный вариант SHA-2. Лучше SHA-256 по коллизиям, но также не рекомендуется для хранения паролей.',
    })

    # --- 3. SHA-512 ---
    sha512_hash = hashlib.sha512(password.encode('utf-8')).hexdigest()
    results.append({
        'name': 'SHA-512',
        'category': 'cryptographic',
        'hash': sha512_hash,
        'length': len(sha512_hash),
        'secure': False,
        'note': 'Максимальная длина в семействе SHA-2. Всё равно небезопасна для паролей без соли и итераций.',
    })

    # --- 4. MD5 (НЕБЕЗОПАСЕН — только для демонстрации) ---
    md5_hash = hashlib.md5(password.encode('utf-8')).hexdigest()
    results.append({
        'name': 'MD5',
        'category': 'broken',
        'hash': md5_hash,
        'length': len(md5_hash),
        'secure': False,
        'note': '⚠️ УСТАРЕВШРЙ алгоритм! Коллизии найдены. Категорически не рекомендуется для паролей. Только для совместимости.',
    })

    # --- 5. bcrypt ---
    try:
        import bcrypt
        salt = bcrypt.gensalt(rounds=12)  # cost factor 12
        bcrypt_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
        results.append({
            'name': 'bcrypt',
            'category': 'password',
            'hash': bcrypt_hash,
            'length': len(bcrypt_hash),
            'secure': True,
            'note': '✅ Рекомендуется. Медленная адаптивная функция с встроенной солью. Cost factor=12 означает 2В№² итераций.',
        })
    except ImportError:
        results.append({'name': 'bcrypt', 'category': 'password', 'hash': '[Требуется: pip install bcrypt]',
                        'length': 0, 'secure': True, 'note': 'Установите: pip install bcrypt'})

    # --- 6. Argon2 ---
    try:
        from argon2 import PasswordHasher
        ph = PasswordHasher(time_cost=2, memory_cost=65536, parallelism=2)
        argon2_hash = ph.hash(password)
        results.append({
            'name': 'Argon2id',
            'category': 'password',
            'hash': argon2_hash,
            'length': len(argon2_hash),
            'secure': True,
            'note': '✅ Победитель Password Hashing Competition 2015. Наиболее защищённый алгоритм. Устойчив к GPU и ASIC атакам.',
        })
    except ImportError:
        results.append({'name': 'Argon2id', 'category': 'password', 'hash': '[Требуется: pip install argon2-cffi]',
                        'length': 0, 'secure': True, 'note': 'Установите: pip install argon2-cffi'})

    # --- 7. scrypt ---
    import os
    scrypt_salt = os.urandom(16)
    scrypt_hash = hashlib.scrypt(
        password.encode('utf-8'),
        salt=scrypt_salt,
        n=16384,   # CPU/memory cost
        r=8,       # block size
        p=1,       # parallelism
        dklen=64
    ).hex()
    results.append({
        'name': 'scrypt',
        'category': 'password',
        'hash': scrypt_hash + f'  [соль: {scrypt_salt.hex()[:16]}...]',
        'length': len(scrypt_hash),
        'secure': True,
        'note': '✅ Разработан Colin Percival. Требует большой объём памяти, что делает массовые атаки дорогостоящими. N=16384, r=8.',
    })

    # Django использует PBKDF2+SHA256 — покажем это тоже
    from django.contrib.auth.hashers import make_password
    django_hash = make_password(password)
    results.append({
        'name': 'Django PBKDF2+SHA256',
        'category': 'password',
        'hash': django_hash,
        'length': len(django_hash),
        'secure': True,
        'note': '✅ Стандарт Django. Рспользуется при save() пользователя. PBKDF2 с 870000 итерациями и случайной солью.',
    })

    return render(request, 'core/password_demo.html', {
        'results': results,
        'password': password,
    })

