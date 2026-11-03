import subprocess, time, sys
from playwright.sync_api import sync_playwright
srv = subprocess.Popen(["npx","vite","preview","-c","test/vite.mock.config.js","--port","4173","--strictPort"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(4)
errs=[]
try:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg=b.new_page(viewport={"width":400,"height":860})
    pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.on("console",lambda m: m.type=="error" and errs.append(m.text))
    pg.goto("http://localhost:4173/#today"); time.sleep(2.5)
    print("blocks:",pg.locator(".blk").count())
    print("chg:",pg.locator("#chgLeft").inner_text())
    print("first:",pg.locator(".blk .ti").first.inner_text()[:60])
    # take the in-page takeover away if shown
    if pg.locator("#takeover").is_visible(): pg.click("#toClose")
    pg.screenshot(path="test/today.png",full_page=False)
    pg.goto("http://localhost:4173/#plan-setup"); time.sleep(1)
    print("classes rows:",pg.locator("#classRows tr").count(),"phone panel hidden:",pg.locator("#phonePanel").is_hidden())
    pg.goto("http://localhost:4173/#board"); time.sleep(1)
    print("lanes:",pg.locator(".lane").count())
    b.close()
finally:
  srv.terminate()
print("ERRORS:",errs)
