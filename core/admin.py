from django.contrib import admin
from .models import (
    Unit, Position, Employee, RawMaterial, FinishedProduct,
    Ingredient, Budget, RawMaterialPurchase, ProductSale, ProductProduction
)

admin.site.register(Unit)
admin.site.register(Position)
admin.site.register(Employee)
admin.site.register(RawMaterial)
admin.site.register(FinishedProduct)
admin.site.register(Ingredient)
admin.site.register(Budget)
admin.site.register(RawMaterialPurchase)
admin.site.register(ProductSale)
admin.site.register(ProductProduction)

