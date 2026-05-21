from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.select import Select
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
    # Ждём пока login завершится (URL уходит с /login/)
    WebDriverWait(driver, 10).until(
        lambda d: "/login/" not in d.current_url
    )

    # Переходим к форме добавления закупки

    driver.get(f"{BASE_URL}/purchases/add/")
    time.sleep(1)

    # Выбираем первый материал из списка

    material_select = Select(driver.find_element(By.NAME, "material"))
    options = material_select.options
    if len(options) > 1:
        material_select.select_by_index(1)
        print(f"  Выбран материал: {options[1].text}")
    time.sleep(0.5)

    # Выбираем первого сотрудника

    employee_select = Select(driver.find_element(By.NAME, "employee"))
    emp_options = employee_select.options
    if len(emp_options) > 1:
        employee_select.select_by_index(1)
    time.sleep(0.5)

    # Вводим количество (скроллим к полю перед вводом)
    qty_field = driver.find_element(By.NAME, "quantity")
    driver.execute_script("arguments[0].scrollIntoView(true);", qty_field)
    time.sleep(0.3)
    qty_field.click()
    qty_field.send_keys("5")
    time.sleep(0.3)

    sum_field = driver.find_element(By.NAME, "sum_amount")
    driver.execute_script("arguments[0].scrollIntoView(true);", sum_field)
    time.sleep(0.3)
    sum_field.click()
    sum_field.send_keys("2500")
    time.sleep(1)


    submit_btn = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//button[@type='submit' and normalize-space()='Закупить']"))
    )
    driver.execute_script("arguments[0].scrollIntoView(true);", submit_btn)
    time.sleep(1)
    driver.execute_script("arguments[0].click();", submit_btn)
    WebDriverWait(driver, 10).until(
        lambda d: "/purchases/add/" not in d.current_url
    )

    current = driver.current_url
    page_source = driver.page_source
    success_found = "закуп" in page_source.lower() or "purchase" in page_source.lower()

    time.sleep(8)

except WebDriverException as e:
    if "ERR_CONNECTION_REFUSED" in str(e):
        print(">>> ОШИБКА: Сервер не запущен!")
    else:
        print(f">>> ОШИБКА: {e}")
finally:
    try:
        driver.quit()
    except:
        pass
