"""Render db_diagram.html into a PNG via headless Chrome."""
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time

ROOT = Path(r"C:\метидички\3-курс\2-семестр\Абалиева\hp_factory\coursework_work")
HTML = (ROOT / "db_diagram.html").as_uri()
OUT = ROOT / "shots" / "00_db_diagram.png"

opts = Options()
opts.add_argument("--headless=new")
opts.add_argument("--no-sandbox")
opts.add_argument("--disable-gpu")
opts.add_argument("--window-size=1520,1070")
opts.add_argument("--hide-scrollbars")
opts.add_argument("--force-device-scale-factor=1.5")  # crisper image

d = webdriver.Chrome(options=opts)
try:
    d.get(HTML)
    time.sleep(0.8)
    d.save_screenshot(str(OUT))
    print("wrote", OUT, OUT.stat().st_size // 1024, "KB")
finally:
    d.quit()
