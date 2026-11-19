import subprocess, time, sys
from playwright.sync_api import sync_playwright
srv = subprocess.Popen(["npx","vite","preview","-c","test/vite.mock.config.js","--port","4173","--strictPort"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
time.sleep(4)
errs=[]
def shot(pg,name): pg.screenshot(path=f"test/{name}.png",full_page=False)
try:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/usr/bin/google-chrome")
    pg=b.new_page(viewport={"width":400,"height":860})
    pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.on("console",lambda m: m.type=="error" and errs.append(m.text))
    pg.goto("http://localhost:4173/#today"); time.sleep(3)
    if pg.locator("#takeover").is_visible(): pg.click("#toClose")
    print("toast:",pg.locator("#toast").inner_text() if pg.locator("#toast").is_visible() else "-")
    print("blocks today:",pg.locator(".blk").count(),"| classes:",pg.locator(".blk.k-class").count())
    print("titles:",[t[:38] for t in pg.locator(".blk .ttl").all_inner_texts()])
    shot(pg,"p-today")
    # Wednesday
    pg.locator(".daypill").nth(2).click(); time.sleep(.6)
    print("wed:",[t[:30]+" "+s[:11] for t,s in zip(pg.locator(".blk .ttl").all_inner_texts(),pg.locator(".blk .sub").all_inner_texts())])
    pg.locator(".daypill").nth(3).click(); time.sleep(.4)
    # jot through Mini Mi
    pg.fill("#jotIn","office called, I need to update the client portfolio later today")
    pg.click("#jotSend"); time.sleep(2)
    print("chat open:",pg.locator("#chatSheet").is_visible(),"| added chips:",pg.locator(".added .a").all_inner_texts())
    shot(pg,"p-chat")
    sysp=pg.evaluate("window.__lastSystem||''")
    print("prompt has projects:", "LIFE PROJECTS" in sysp and "CMAX UI/UX" in sysp, "| free slots:", "FREE SLOTS" in sysp)
    # offline fallback
    pg.fill("#chatIn","buy groceries tomorrow at 6pm"); pg.press("#chatIn","Enter"); time.sleep(2)
    print("fallback chips:",pg.locator(".added .a").all_inner_texts()[-1:])
    pg.click("#chatClose"); time.sleep(.5)
    port=pg.locator(".blk",has_text="Update client portfolio")
    print("portfolio block on calendar:",port.count(), port.first.locator(".sub").inner_text() if port.count() else "")
    # tap block -> sheet
    if port.count():
      port.first.click(); time.sleep(.5); print("block sheet:",pg.locator("#blockBody").inner_text().replace("\n"," | ")[:160]); pg.keyboard.press("Escape")
    # week + projects
    pg.click('.tabbar a[data-v="week"]'); time.sleep(1.2)
    print("projects:",pg.locator(".proj").count(),"| areas:",pg.locator(".area").count())
    print("first projects:",[t.replace("\n"," / ")[:70] for t in pg.locator(".proj").all_inner_texts()[:7]])
    shot(pg,"p-week")
    pg.locator(".proj",has_text="Income").click(); time.sleep(.5)
    print("project notes:",pg.locator(".pnotes").inner_text()[:100]); pg.keyboard.press("Escape")
    pg.click('.tabbar a[data-v="me"]'); time.sleep(.8)
    print("class days:",pg.locator(".classday").count(),"| routine cards:",pg.locator(".rcard").count())
    pg.click("#streakBtn"); time.sleep(.5); print("milestones:",pg.locator(".mile").count()); pg.keyboard.press("Escape")
    # desktop
    pg.set_viewport_size({"width":1280,"height":900}); pg.goto("http://localhost:4173/#today"); time.sleep(2.5)
    if pg.locator("#takeover").is_visible(): pg.click("#toClose")
    shot(pg,"d-today")
    b.close()
finally:
  srv.terminate()
print("ERRORS:",errs)
