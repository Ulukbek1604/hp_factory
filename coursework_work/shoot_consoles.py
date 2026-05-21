from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

ROOT = Path(r"C:\метидички\3-курс\2-семестр\Абалиева\hp_factory\coursework_work")
PAGES = [
    ("console_runserver.html", "25_runserver.png", 1100, 460),
    ("console_tests.html",     "26_tests.png",     1100, 580),
]
opts = Options()
opts.add_argument("--headless=new")
opts.add_argument("--no-sandbox")
opts.add_argument("--disable-gpu")
opts.add_argument("--hide-scrollbars")
opts.add_argument("--force-device-scale-factor=1.5")
d = webdriver.Chrome(options=opts)
try:
    for html, out, w, h in PAGES:
        d.set_window_size(w, h)
        d.get((ROOT / html).as_uri())
        time.sleep(0.6)
        p = ROOT / "shots" / out
        d.save_screenshot(str(p))
        print("wrote", p.name, p.stat().st_size // 1024, "KB")
finally:
    d.quit()
