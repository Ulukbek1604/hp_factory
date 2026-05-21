import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "hp_factory.settings")
django.setup()

from django.contrib.auth.models import User, Group

def create_roles_and_admin():
    # 1. Создание ролей (Групп)
    roles = [
        "Администратор",
        "Бухгалтер",
        "Работник склада",
        "Сотрудник производства"
    ]
    
    for role_name in roles:
        group, created = Group.objects.get_or_create(name=role_name)
        if created:
            print(f"✅ Создана роль: {role_name}")
        else:
            print(f"ℹ️ Роль уже существует: {role_name}")

    # 2. Создание суперпользователя (Админа)
    admin_username = "admin"
    admin_password = "adminpassword123"
    admin_email = "admin@hpfactory.local"

    if not User.objects.filter(username=admin_username).exists():
        admin_user = User.objects.create_superuser(
            username=admin_username,
            email=admin_email,
            password=admin_password,
            first_name="Главный",
            last_name="Администратор"
        )
        
        # Добавляем админа в группу "Администратор"
        admin_group = Group.objects.get(name="Администратор")
        admin_user.groups.add(admin_group)
        
        print(f"\n✅ Успешно создан аккаунт Администратора!")
        print(f"   Логин: {admin_username}")
        print(f"   Пароль: {admin_password}")
    else:
        print(f"\nℹ️ Пользователь {admin_username} уже существует.")
        # На всякий случай убедимся, что он в группе
        admin_user = User.objects.get(username=admin_username)
        admin_group = Group.objects.get(name="Администратор")
        admin_user.groups.add(admin_group)

if __name__ == "__main__":
    create_roles_and_admin()
