const { test } = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
test('prototype pages and safeguarding workflow', async () => {
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:3000');
 await page.locator('h1').waitFor();
 await page.screenshot({path:'/tmp/ict-desktop.png',fullPage:true});
 await page.selectOption('#year','2028');assert.match(await page.locator('.hero').innerText(),/2028/);
 await page.goto('http://127.0.0.1:3000/#counties');
 await page.fill('#county-search','Yorkshire');assert.equal(await page.locator('.county-tile').count(),1);
 await page.locator('.county-tile').click();await page.waitForURL('**/#county/Yorkshire');await page.waitForFunction(()=>document.querySelector('h1')?.textContent==='Yorkshire');assert.equal(await page.locator('h1').textContent(),'Yorkshire');
 await page.goto('http://127.0.0.1:3000/#contribute');
 await page.fill('#title','Fictional training update');await page.fill('#body','Fictional teamwork story for testing.');
 await page.selectOption('#kind','Team photograph');
 await page.locator('[name=adult]').check();await page.locator('[name=fictional]').check();
 await page.locator('#submission > label.check').last().locator('input').check();
 await page.locator('#submission button').click();assert.equal(new URL(page.url()).hash,'#contribute');
 await page.fill('#consent-ref','DEMO-001');await page.check('#guardian');await page.check('#safe-image');
 await page.locator('#submission button').click();await page.waitForURL('**/#admin');
 await page.locator('[data-approve]').click();assert.equal(await page.locator('.badge').first().innerText(),'Pending');
 await page.check('#review-0');await page.locator('[data-approve]').click();assert.equal(await page.locator('.badge').first().innerText(),'Approved');
 await page.goto('http://127.0.0.1:3000/#news');assert.match(await page.locator('main').innerText(),/Fictional training update/);
 await page.goto('http://127.0.0.1:3000/#removal');await page.fill('#remove-url','Demo story');await page.locator('#removal-form input[type=checkbox]').check();await page.locator('#removal-form button').click();assert.match(await page.locator('#removal-result').innerText(),/DEMO-001/);
 await page.goto('http://127.0.0.1:3000/#admin');assert.match(await page.locator('main').innerText(),/Demo story/);
 for(const route of ['teams','history','sponsors','safeguarding','about']){await page.goto('http://127.0.0.1:3000/#'+route);assert.ok(await page.locator('h1').innerText())}
 await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:3000/#home');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.locator('.menu').click();assert.equal(await page.locator('.menu').getAttribute('aria-expanded'),'true');
 await page.locator('nav a[href="#counties"]').click();assert.equal(await page.locator('.menu').getAttribute('aria-expanded'),'false');
 await page.goto('http://127.0.0.1:3000/#home');await page.screenshot({path:'/tmp/ict-mobile.png',fullPage:true});
 assert.deepEqual(errors,[]);
 await page.reload();await page.goto('http://127.0.0.1:3000/#admin');assert.match(await page.locator('main').innerText(),/No submissions yet/);
 }finally{await browser.close()}
});
