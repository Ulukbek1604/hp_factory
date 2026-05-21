"""
Тест 1: Авторизация пользователя
Selenium WebDriver — Практическая работа №5
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import WebDriverException
import time

# === НАСТРОЙКИ (измени если нужно) ===
BASE_URL = "http://localhost:8000"
USERNAME = "admin"
PASSWORD = "16043132UluTur"
# =====================================

print("=" * 50)
print("ТЕСТ 1: Авторизация пользователя")
print("=" * 50)

try:
    driver = webdriver.Chrome()
    driver.maximize_window()

    driver.get(f"{BASE_URL}/login/")
    time.sleep(1)

    driver.find_element(By.NAME, "username").send_keys(USERNAME)

    driver.find_element(By.NAME, "password").send_keys(PASSWORD)
    time.sleep(1)


    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    # Ждём редиректа — URL больше не /login/
    WebDriverWait(driver, 10).until(
        lambda d: "/login/" not in d.current_url
    )


except WebDriverException as e:
    if "ERR_CONNECTION_REFUSED" in str(e):
        print()
        print(">>> ОШИБКА: Сервер не запущен!")
    else:
        print(f">>> ОШИБКА: {e}")
finally:
    try:
        driver.quit()
    except:
        pass
