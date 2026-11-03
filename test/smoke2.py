import subprocess, time
from playwright.sync_api import sync_playwright
srv = subprocess.Popen(["npx","vite","preview","-c","test/vite.mock.config.js","--port","4174","--strictPort"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(4); errs=[]
try:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg=b.new_page(viewport={"width":400,"height":860})
    pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto("http://localhost:4174/#partner"); time.sleep(2.5)
    if pg.locator("#takeover").is_visible(): pg.click("#toClose")
    print("tab:",pg.locator('nav.tabs a[data-v="partner"]').inner_text(),"| msgs:",pg.locator(".msg").count())
    print(pg.locator(".msg").first.inner_text()[:90])
    pg.screenshot(path="test/partner.png")
    pg.goto("http://localhost:4174/#today"); time.sleep(1); print("today blocks:",pg.locator(".blk").count())
    b.close()
finally: srv.terminate()
print("ERRORS:",errs)
