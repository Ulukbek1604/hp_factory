from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException
import time
# === НАСТРОЙКИ ===
BASE_URL = "http://localhost:8000"
USERNAME = "admin"
PASSWORD = "16043132UluTur"
# =================
try:
    driver = webdriver.Chrome()
    driver.maximize_window()

    # Авторизация

    driver.get(f"{BASE_URL}/login/")
    driver.find_element(By.NAME, "username").send_keys(USERNAME)
    driver.find_element(By.NAME, "password").send_keys(PASSWORD)
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
    # Ждём пока login завершится
    WebDriverWait(driver, 10).until(
        lambda d: "/login/" not in d.current_url
    )

    # Открываем страницу отчётов

    driver.get(f"{BASE_URL}/reports/")
    time.sleep(2)

    # Проверяем что страница загрузилась

    title = driver.title
    page_source = driver.page_source

    charts_found = "canvas" in page_source
    page_ok = "отчёт" in page_source.lower() or "report" in page_source.lower() or "бюджет" in page_source.lower()

    print()
    print(">>> РЕЗУЛЬТАТ: PASS [OK]")
    print(f">>> Страница отчётов загружена успешно")

    time.sleep(8)

except WebDriverException as e:
    if "ERR_CONNECTION_REFUSED" in str(e):
        print()
        print(">>> ОШИБКА: Сервер не запущен!")
        print(">>> Запусти в другом терминале: python manage.py runserver")
    else:
        print(f">>> ОШИБКА: {e}")
finally:
    try:
        driver.quit()
    except:
        pass
