from django.urls import path
from . import views

urlpatterns = [
    # Dashboard
    path('', views.dashboard, name='dashboard'),
    # Справочники
    path('units/', views.units_list, name='units_list'),
    path('positions/', views.positions_list, name='positions_list'),
    path('employees/', views.employees_list, name='employees_list'),
    path('budget/', views.budget_view, name='budget'),
    # Рецептура
    path('ingredients/', views.ingredients_list, name='ingredients_list'),
    # Склад
    path('raw-materials/', views.raw_materials_list, name='raw_materials_list'),
    path('finished-products/', views.finished_products_list, name='finished_products_list'),
    # Операции - Лаба 1
    path('purchases/', views.purchases_list, name='purchases_list'),
    path('purchases/add/', views.purchase_add, name='purchase_add'),
    path('purchases/delete/<int:pk>/', views.purchase_delete, name='purchase_delete'),
    
    # Лаба 2
    path('production/', views.production_list, name='production_list'),
    path('production/add/', views.production_add, name='production_add'),
    path('production-requests/', views.production_requests_list, name='production_requests_list'),
    path('production-requests/add/', views.production_request_add, name='production_request_add'),
    
    # Лаба 3
    path('sales/', views.sales_list, name='sales_list'),
    path('sales/add/', views.sales_add, name='sales_add'),
    
    # Лаба 4
    path('salary/', views.salary_list, name='salary_list'),
    path('salary/add/', views.salary_add, name='salary_add'),
    
    # Лаба 5
    path('credits/', views.credits_list, name='credits_list'),
    path('credits/add/', views.credit_add, name='credit_add'),
    path('credits/pay/<int:credit_id>/', views.credit_pay, name='credit_pay'),
    path('credits/schedule/<int:credit_id>/', views.payment_schedule, name='payment_schedule'),
    
    # Лаба 6
    path('reports/', views.reports_view, name='reports'),

    # =======================================================
    # АВТОРИЗАЦИЯ (Практическая работа №3)
    # =======================================================
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path('password-demo/', views.password_hash_demo, name='password_demo'),
]
