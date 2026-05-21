# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

**HP Factory** is a Django-based enterprise resource management system for a laptop/PC manufacturing factory. The project implements a full business workflow: raw material procurement, production, sales, payroll, and credit management.

**Tech Stack:**
- Django 4.2+ (Python web framework)
- Microsoft SQL Server (via mssql-django)
- Database-first approach (schema.sql defines structure, managed=False models)
- Stored procedures & triggers for business logic
- Bootstrap-like custom CSS (dark theme)

---

## Architecture

### High-Level Structure

```
hp_factory/
├── core/                    # Main Django app
│   ├── models.py           # All database models (managed=False)
│   ├── views.py            # Controller functions (MVC pattern)
│   ├── forms.py            # Django forms for data entry
│   ├── urls.py             # URL routing
│   ├── hashers.py          # Custom password hashers (SHA384, SHA512)
│   └── apps.py             # App configuration
├── templates/
│   ├── base.html           # Master template with sidebar navigation
│   └── core/               # App-specific templates
├── static/                 # CSS, JS, images
├── hp_factory/             # Django project settings
│   └── settings.py        # DB config, password hashers, i18n
├── schema.sql              # Complete SQL Server schema
├── seed_data.sql           # Initial data seeding
└── manage.py              # Django CLI entrypoint
```

### Database Architecture

**Key Tables:**
- `Budget` - single-row table storing current budget
- `RawMaterials` / `FinishedProducts` - inventory
- `Employees` / `Positions` - HR data
- `RawMaterialPurchases` - material acquisitions
- `ProductProduction` - manufacturing records
- `ProductSales` - sales transactions
- `SalaryPayments` - payroll
- `Credits` / `CreditPayments` - loan management
- `Ingredients` - product recipes (BOM)

**Business Logic Location:**
1. **Stored Procedures** (schema.sql):
   - `sp_CheckBudget` - validates budget before purchases/salaries
   - `sp_CheckMaterialAvailability` - checks if enough raw materials for production
2. **Triggers** (AFTER INSERT):
   - `trg_AfterPurchaseInsert` - decreases budget, increases raw material stock
   - `trg_AfterProductionInsert` - increases finished goods, decreases raw materials
   - `trg_AfterSaleInsert` - decreases inventory, increases budget
   - `trg_AfterSalaryInsert` - decreases budget
   - `trg_AfterCreditInsert` - increases budget, calculates total_to_pay
   - `trg_AfterCreditPaymentInsert` - decreases budget, updates credit status

**Important:** All triggers automatically modify related tables. Do NOT duplicate this logic in views.

### Model Pattern

All models use `managed = False` because the database is managed externally via SQL scripts. Django models are read-only definitions that map to existing tables.

```python
class ModelName(models.Model):
    field = models.Field(..., db_column='ActualColumnName')

    class Meta:
        managed = False
        db_table = 'TableName'
```

---

## Development Setup

### Prerequisites
- Python 3.10+
- SQL Server (LocalDB or full instance)
- ODBC Driver 17 for SQL Server
- Virtual environment (already created at `.venv/`)

### Database Configuration

1. **Update `hp_factory/settings.py`:**
   - Line 67: Change `HOST` to your SQL Server instance
   - Line 66: Ensure `NAME` matches your database (default: `HP_Factory`)

2. **Create database and apply schema:**
```bash
# Connect to SQL Server, create DB if needed
sqlcmd -S .\SQLEXPRESS -Q "CREATE DATABASE HP_Factory"

# Run schema script
sqlcmd -S .\SQLEXPRESS -d HP_Factory -i schema.sql
```

3. **Optional: Seed initial data**
```bash
sqlcmd -S .\SQLEXPRESS -d HP_Factory -i seed_data.sql
```

4. **Verify connection:**
```bash
python manage.py check
```

### Virtual Environment

The project includes `.venv/`. Activate it:

**Windows (PowerShell):**
```powershell
.\.venv\Scripts\Activate.ps1
```

**Linux/Mac:**
```bash
source .venv/bin/activate
```

---

## Common Commands

### Development Server
```bash
python manage.py runserver
```
Access at http://localhost:8000

### Create Superuser
```bash
python manage.py createsuperuser
```
Follow prompts for username, email, password.

### Database Check
```bash
python manage.py check
python manage.py inspectdb  # Shows model definitions from existing DB
```

### Application-Specific Tasks

**Update Budget:**
- Via UI: Settings → Budget page
- Via SQL: `UPDATE Budget SET TotalAmount = <value> WHERE id = 1`

**Add New Raw Material:**
- Via UI: Core → Raw Materials → Add
- Via SQL: `INSERT INTO RawMaterials (Name, UnitID) VALUES ('...', 1)`

**Add Credit:**
- Via UI: Core → Credits → "Взять кредит"
- Via SQL: `INSERT INTO Credits (Amount, InterestRate, TermMonths) VALUES (100000, 12.5, 12)`

---

## Testing Approach

The project currently has **no automated test suite**. All testing is manual through the Django development server.

**If adding tests:**
- Place tests in `core/tests.py` or `core/tests/` directory
- Use Django's test framework: `python manage.py test core`
- For single test: `python manage.py test core.tests.TestClassName.test_method_name`

**Manual Testing Checklist:**
1. Create employee → Assign position → Verify salary field
2. Purchase raw materials → Check budget decrease → Check stock increase
3. Production → Verify recipe exists → Check material consumption → Check finished goods increase
4. Sales → Verify stock availability → Check budget increase
5. Salary payment → Verify budget decrease
6. Credit → Take loan → Verify budget increase → Make payment → Verify status change

---

## Important Implementation Patterns

### 1. Budget Validation Pattern
Before operations that spend money (purchases, salaries, credit payments), views call stored procedure:

```python
def _check_budget_sp(required_amount):
    with connection.cursor() as cursor:
        cursor.execute(
            "DECLARE @result INT; "
            "EXEC sp_CheckBudget @RequiredAmount=%s, @IsAllowed=@result OUTPUT; "
            "SELECT @result;",
            [required_amount]
        )
        result = cursor.fetchone()[0]
    return result == 0  # 0 = allowed
```

**Do not** add additional budget checks in Python; trust the SP.

### 2. Auto-Updating Patterns
Triggers handle side effects automatically:
- Purchase → budget down, stock up
- Production → stock down (materials), stock up (products)
- Sale → stock down, budget up
- Salary → budget down
- Credit → budget up, calculate total_to_pay
- CreditPayment → budget down, update status

**Views should only INSERT** and let triggers handle updates.

### 3. Status Management
Credits have three statuses:
- `active` - has remaining balance
- `paid` - fully paid (set automatically by trigger)
- `overdue` - manually set if payment late (no auto-detection yet)

Use `credit.update_status()` method in views when needed outside of trigger context.

### 4. Form Validation
Forms are Django `forms.Form` (not `ModelForm`). Data is manually saved via `Model.objects.create()`. This allows custom validation before DB write.

Always check `form.is_valid()` and access `form.cleaned_data`.

### 5. Messages Framework
User feedback uses Django's messages:
```python
messages.success(request, '✅ Operation completed')
messages.error(request, '❌ Error occurred')
```
Messages display in `base.html` automatically.

---

## Code Organization by Lab (Educational Context)

The project appears to be a semester-long lab series:

| Lab | Feature | Files |
|-----|---------|-------|
| 1 | Material Purchases + Budget | models.py (RawMaterial, RawMaterialPurchase), views.py (purchase_*), triggers (trg_AfterPurchaseInsert), SP (sp_CheckBudget) |
| 2 | Production + Recipes | models.py (Ingredient, ProductProduction), views.py (production_*), trigger (trg_AfterProductionInsert), SP (sp_CheckMaterialAvailability) |
| 3 | Sales + Security | models.py (ProductSale), views.py (sales_*), forms.py (RegisterForm, LoginForm), hashers.py, password_demo view |
| 4 | Payroll | models.py (Employee, SalaryPayment), views.py (salary_*), trigger (trg_AfterSalaryInsert) |
| 5 | Credits (enhanced) | models.py (Credit, CreditPayment), views.py (credits_*, credit_pay, payment_schedule), forms.py (CreditForm, CreditPaymentForm) |
| 6 | Reports | views.py (reports_view), template (reports.html) with Chart.js |

**Do not refactor across lab boundaries** unless explicitly requested; each lab builds on previous.

---

## Extension Points

### Adding a New Business Operation (e.g., "Expense")

1. Add model to `models.py`:
```python
class Expense(models.Model):
    description = models.CharField(...)
    amount = models.DecimalField(...)
    expense_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False
        db_table = 'Expenses'
```

2. Add SQL to `schema.sql`:
```sql
CREATE TABLE Expenses (...);
```

3. Add form to `forms.py` (or create simple inline form)

4. Add views to `views.py`:
   - `expenses_list()` - list view
   - `expense_add()` - create with budget check

5. Add URL pattern to `urls.py`

6. Create template `templates/core/expenses_list.html` and `expense_add.html`

7. If operation affects budget, use `_check_budget_sp(amount)` BEFORE save, and let trigger handle budget decrement (or create new trigger)

### Adding a New Report

1. Add aggregation logic to `reports_view()`
2. Update `templates/core/reports.html` with new card/table section
3. Add to context dict and template

---

## Conventions

### Naming
- **Models:** PascalCase, singular (Employee, RawMaterial)
- **Database tables:** snake_case, plural (Employees, RawMaterials)
- **Views:** snake_case with `_list` / `_add` suffix
- **URLs:** snake_case, trailing slash
- **Templates:** `<app>/<view>.html`

### Currency
All monetary values use `DECIMAL(18,2)` in SQL, `DecimalField` in Python. Display with `|floatformat:2` filter.

### Timezones
Django `USE_TZ = True`, timezone set to `Asia/Almaty`. Use `timezone.now()` for current time in views.

### Static Files
Custom CSS lives in `templates/base.html` (embedded). If adding new static assets (images, JS), place in `/static/` and reference via `{% static 'path' %}` (requires `{% load static %}`).

---

## Security Notes

- **Password hashers:** Argon2 (primary), bcrypt, scrypt, PBKDF2, SHA384/512 (custom educational), MD5 (fallback). See `settings.py` line 89-97.
- **Authentication:** Django's built-in auth system, decorated with `@login_required`
- **CSRF protection:** Enabled globally, `{% csrf_token %}` in all POST forms
- **SQL Injection:** No raw SQL in views except SP calls with parameterized queries. Never use `cursor.execute(f"...{var}...")`.

---

## Deployment Notes

This is a **development/educational** project. For production:

1. Set `DEBUG = False`
2. Change `SECRET_KEY` to environment variable
3. Configure proper `ALLOWED_HOSTS`
4. Use production-ready DB (not LocalDB)
5. Collect static files: `python manage.py collectstatic`
6. Configure WSGI (e.g., Gunicorn + Nginx)
7. Use `migrate` is NOT needed (managed=False), but ensure schema.sql is executed separately

---

## Troubleshooting

### "Login failed for user..."
Check SQL Server authentication mode. `Trusted_Connection=yes` uses Windows Auth. For SQL auth, change to:
```python
'OPTIONS': {
    'driver': 'ODBC Driver 17 for SQL Server',
    'UID': 'username',
    'PWD': 'password',
}
```

### "Cannot connect to database"
Verify SQL Server instance name in settings.py. Test with `sqlcmd -S <instance>`.

### "Column not found" or "Invalid column name"
Schema may be out of sync. Re-run `schema.sql` (it uses `IF NOT EXISTS` and won't drop data).

### "No module named 'mssql'"
Install dependencies: `pip install mssql-django pyodbc`

### "Stored procedure not found"
Ensure you executed `schema.sql` which contains SP definitions.

---

## Key Files to Read

To understand the codebase quickly, read in this order:

1. `schema.sql` - See full database structure and business logic in SQL
2. `core/models.py` - Understand the Django model mappings
3. `core/views.py` - See how operations are orchestrated
4. `hp_factory/settings.py` - Configuration, especially DB and password hashers
5. `templates/base.html` - UI layout and navigation
6. `core/forms.py` - Data validation rules

---

## Student/Developer Tips

This is an **educational project** from a university course (likely "Database Systems" or "Enterprise Application Development"). The focus is on:
- Database design (tables, relationships, constraints)
- Stored procedures and triggers
- Transaction atomicity
- Django ORM with legacy databases

**Do not over-engineer.** Simple is better. The architecture is intentionally straightforward (fat database, thin views).

When extending:
- Prefer SQL stored procedures for complex data manipulations
- Use triggers for automatic side effects
- Keep views simple: validate form → call SP/INSERT → redirect with message

---

## Known Limitations

1. **No delete cascades** on some operations (budget can go negative via direct SQL)
2. **No audit trail** - all changes are logged only via transaction logs in DB
3. **No API endpoints** - pure server-side rendering (Django templates)
4. **Currency hard-coded** to "сом" (Kyrgyzstan som)
5. **No pagination** on reports - could be slow with large datasets
6. **Status transitions** manual for overdue (no cron job checking dates)
7. **Credit interest calculation** uses simple interest, not compound

---
