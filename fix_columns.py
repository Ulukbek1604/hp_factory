import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hp_factory.settings')
django.setup()

from django.db import connection

fixes = [
    "ALTER TABLE Employees ALTER COLUMN Phone NVARCHAR(50);",
    "ALTER TABLE Employees ALTER COLUMN Address NVARCHAR(500);",
]

with connection.cursor() as cursor:
    for sql in fixes:
        cursor.execute(sql)
        print(f"OK: {sql}")

print("\nAll columns updated successfully!")
