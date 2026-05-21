from decimal import Decimal

from django.db import transaction
from django.db.models import Sum

from .models import (
    Budget,
    Ingredient,
    ProductProduction,
    ProductSale,
    ProductionRequest,
    RawMaterialPurchase,
)


DEFAULT_MATERIAL_PRICE = Decimal('100.00')


def _get_current_budget():
    budget = Budget.objects.first()
    return budget.total_amount if budget else Decimal('0.00')


def _estimate_material_unit_price(material):
    """Estimate material price from purchases; fallback to warehouse average/default."""
    purchase_totals = RawMaterialPurchase.objects.filter(material=material).aggregate(
        total_qty=Sum('quantity'),
        total_sum=Sum('sum_amount'),
    )
    total_qty = purchase_totals.get('total_qty')
    total_sum = purchase_totals.get('total_sum')

    if total_qty and total_qty > 0 and total_sum is not None:
        return Decimal(str(total_sum)) / Decimal(str(total_qty))

    if material.quantity and material.quantity > 0 and material.sum_amount is not None:
        return Decimal(str(material.sum_amount)) / Decimal(str(material.quantity))

    return DEFAULT_MATERIAL_PRICE


def _set_request_error(req, stage, reason):
    req.status = 'Ошибка'
    req.rejection_reason = f'Этап: {stage}. Причина: {reason}'
    req.save(update_fields=['status', 'rejection_reason', 'updated_date'])


def process_production_request(request_id):
    """
    Sequential production request processing:
    materials check -> purchase -> production -> sale.
    """
    req = ProductionRequest.objects.get(id=request_id)
    current_stage = 'создана'

    try:
        current_stage = 'проверка наличия сырья'
        req.status = 'На проверке наличия сырья'
        req.rejection_reason = None
        req.save(update_fields=['status', 'rejection_reason', 'updated_date'])

        ingredients = list(Ingredient.objects.filter(product=req.product).select_related('material'))
        if not ingredients:
            raise ValueError('У выбранной продукции нет рецептуры.')

        shortfalls = []
        for ing in ingredients:
            required_qty = ing.quantity * req.quantity
            material = ing.material
            if material.quantity < required_qty:
                shortfalls.append((material, required_qty - material.quantity))

        if shortfalls:
            current_stage = 'закупка сырья'
            req.status = 'На процессе закупки сырья'
            req.save(update_fields=['status', 'updated_date'])

            purchases_to_make = []
            total_cost = Decimal('0.00')
            for material, missing_qty in shortfalls:
                unit_price = _estimate_material_unit_price(material)
                cost = Decimal(str(missing_qty)) * unit_price
                purchases_to_make.append((material, missing_qty, cost))
                total_cost += cost

            current_budget = _get_current_budget()
            if current_budget < total_cost:
                raise ValueError(
                    f'Недостаток бюджета на закупку сырья. Нужно: {total_cost:.2f}, доступно: {current_budget:.2f}.'
                )

            with transaction.atomic():
                for material, missing_qty, cost in purchases_to_make:
                    RawMaterialPurchase.objects.create(
                        material=material,
                        quantity=missing_qty,
                        sum_amount=cost,
                        employee=req.applicant,
                    )

        current_stage = 'производство'
        req.status = 'На процессе производства'
        req.save(update_fields=['status', 'updated_date'])

        cost_price = Decimal('0.00')
        for ing in ingredients:
            required_qty = ing.quantity * req.quantity
            mat = ing.material
            mat.refresh_from_db()
            unit_price = _estimate_material_unit_price(mat)
            cost_price += Decimal(str(required_qty)) * unit_price

        with transaction.atomic():
            ProductProduction.objects.create(
                product=req.product,
                quantity=req.quantity,
                employee=req.applicant,
            )

        current_stage = 'продажа'
        req.status = 'На процессе продажи'
        req.save(update_fields=['status', 'updated_date'])

        sale_amount = cost_price * Decimal('1.30')
        with transaction.atomic():
            ProductSale.objects.create(
                product=req.product,
                quantity=req.quantity,
                sum_amount=sale_amount,
                employee=req.applicant,
            )

        req.status = 'Выполнена'
        req.save(update_fields=['status', 'updated_date'])
        return True, 'Заявка успешно выполнена.'

    except Exception as exc:
        _set_request_error(req, current_stage, str(exc))
        return False, str(exc)
