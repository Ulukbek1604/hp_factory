
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException
import time
import random

# === НАСТРОЙКИ ===
BASE_URL = "http://localhost:8000"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "16043132UluTur"
# Уникальный логин чтобы не было конфликта при повторном запуске
NEW_USERNAME = f"test_user_{random.randint(100, 999)}"
# =================
try:
    driver = webdriver.Chrome()
    driver.maximize_window()

    # Сначала входим как админ
    print("Входим как администратор...")
    driver.get(f"{BASE_URL}/login/")
    driver.find_element(By.NAME, "username").send_keys(ADMIN_USERNAME)
    driver.find_element(By.NAME, "password").send_keys(ADMIN_PASSWORD)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    time.sleep(1)

    # Переходим к регистрации
    print(f"Открываем страницу регистрации: {BASE_URL}/register/")
    driver.get(f"{BASE_URL}/register/")
    time.sleep(1)

    print(f"Заполняем форму (логин: {NEW_USERNAME})...")
    driver.find_element(By.NAME, "first_name").send_keys("Тест")
    time.sleep(0.3)
    driver.find_element(By.NAME, "last_name").send_keys("Пользователь")
    time.sleep(0.3)
    driver.find_element(By.NAME, "username").send_keys(NEW_USERNAME)
    time.sleep(0.3)
    driver.find_element(By.NAME, "email").send_keys(f"{NEW_USERNAME}@test.com")
    time.sleep(0.3)
    driver.find_element(By.NAME, "password1").send_keys("TestPass@2024!")
    time.sleep(0.3)
    driver.find_element(By.NAME, "password2").send_keys("TestPass@2024!")
    time.sleep(1)

    print("Нажимаем 'Создать аккаунт'...")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    # Ждём сообщения об успехе или редиректа
    time.sleep(2)

    print()
    print(">>> РЕЗУЛЬТАТ: PASS [OK]")
    print(f">>> Пользователь '{NEW_USERNAME}' зарегистрирован успешно")
    print(f">>> Текущий URL: {driver.current_url}")
    print()
    print("Сделай скрин экрана сейчас! Закрытие через 8 секунд...")
    time.sleep(8)

except WebDriverException as e:
    if "ERR_CONNECTION_REFUSED" in str(e):
        print()
        print(">>> ОШИБКА: Сервер не запущен!")
        print(">>> Запусти в другом терминале: python manage.py runserver")
    else:
        print(f">>> ОШИБКА: {e}")
except Exception as e:
    print(f">>> РЕЗУЛЬТАТ: FAIL [ERR]")
    print(f">>> Ошибка: {e}")
    print("Сделай скрин экрана сейчас! Закрытие через 8 секунд...")
    time.sleep(8)
finally:
    try:
        driver.quit()
    except:
        pass
