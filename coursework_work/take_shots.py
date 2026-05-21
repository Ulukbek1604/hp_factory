"""Take full-page screenshots of every page of HP Factory for the coursework."""
import os
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE = "http://127.0.0.1:8765"
USER = "claudeshot"
PASS = "Aa12345!Aa"
OUT = Path(r"C:\метидички\3-курс\2-семестр\Абалиева\hp_factory\coursework_work\shots")
OUT.mkdir(parents=True, exist_ok=True)

VIEWPORT_W = 1440
VIEWPORT_H = 900

PAGES = [
    # (filename, url, [click selector before screenshot, wait_for_selector])
    ("01_login.png",              "/login/",                       None),
    ("02_dashboard.png",          "/",                             None),
    ("03_employees.png",          "/employees/",                   None),
    ("04_positions.png",          "/positions/",                   None),
    ("05_units.png",              "/units/",                       None),
    ("06_raw_materials.png",      "/raw-materials/",               None),
    ("07_finished_products.png",  "/finished-products/",           None),
    ("08_ingredients.png",        "/ingredients/",                 None),
    ("09_budget.png",             "/budget/",                      None),
    ("10_purchases_list.png",     "/purchases/",                   None),
    ("11_purchase_add.png",       "/purchases/add/",               None),
    ("12_production_list.png",    "/production/",                  None),
    ("13_production_add.png",     "/production/add/",              None),
    ("14_sales_list.png",         "/sales/",                       None),
    ("15_sales_add.png",          "/sales/add/",                   None),
    ("16_salary_list.png",        "/salary/",                      None),
    ("17_salary_add.png",         "/salary/add/",                  None),
    ("18_credits_list.png",       "/credits/",                     None),
    ("19_credit_add.png",         "/credits/add/",                 None),
    ("20_production_requests.png","/production-requests/",         None),
    ("21_production_request_add.png","/production-requests/add/",  None),
    ("22_reports.png",            "/reports/",                     None),
    ("23_profile.png",            "/profile/",                     None),
    ("24_register.png",           "/register/",                    None),
]


def shot(driver, url, fname):
    driver.get(BASE + url)
    # Wait for body + small render delay
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    time.sleep(1.2)  # let CSS/JS settle
    # Full page screenshot: set window to content height
    h = driver.execute_script(
        "return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);"
    )
    h = max(int(h) + 40, VIEWPORT_H)
    if h > 4000:
        h = 4000  # avoid giant images
    driver.set_window_size(VIEWPORT_W, h)
    time.sleep(0.4)
    out = OUT / fname
    driver.save_screenshot(str(out))
    print(f"  {fname:40s}  ({h}px)  -> {out.stat().st_size//1024} KB")
    driver.set_window_size(VIEWPORT_W, VIEWPORT_H)


def main():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-gpu")
    opts.add_argument(f"--window-size={VIEWPORT_W},{VIEWPORT_H}")
    opts.add_argument("--hide-scrollbars")
    opts.add_argument("--force-device-scale-factor=1")
    driver = webdriver.Chrome(options=opts)
    driver.set_window_size(VIEWPORT_W, VIEWPORT_H)
    try:
        # 1. Login page (capture before logging in)
        shot(driver, "/login/", "01_login.png")
        # 2. Log in
        driver.get(BASE + "/login/")
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.NAME, "username")))
        driver.find_element(By.NAME, "username").send_keys(USER)
        driver.find_element(By.NAME, "password").send_keys(PASS)
        driver.find_element(By.CSS_SELECTOR, "button[type=submit], input[type=submit]").click()
        WebDriverWait(driver, 10).until(EC.url_changes(BASE + "/login/"))
        print("logged in:", driver.current_url)
        # 3. Remaining screenshots
        for fname, url, _ in PAGES[1:]:
            try:
                shot(driver, url, fname)
            except Exception as e:
                print(f"  !! {fname}: {e}")
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
