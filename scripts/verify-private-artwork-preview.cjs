/* Local-only verification. Keep the unlock phrase file outside the repository. */
const fs=require('node:fs');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const [htmlPath,phrasePath]=process.argv.slice(2);
if(!htmlPath||!phrasePath)throw new Error('Usage: node scripts/verify-private-artwork-preview.cjs <encrypted HTML> <private phrase file>');
(async()=>{
 const html=fs.readFileSync(htmlPath,'utf8');const phrase=fs.readFileSync(phrasePath,'utf8').trim();
 assert.ok(!html.includes(phrase),'Unlock phrase must never be shipped in the artifact');
 assert.ok(!html.includes('data:image/png;base64'),'No unencrypted county image data in the download');
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const context=await browser.newContext({offline:true,viewport:{width:1440,height:1050}});
  const page=await context.newPage();const errors=[];const requests=[];const virtual='http://127.0.0.1:3000/__private_artwork_verification__';
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&r.url()!==virtual)requests.push(r.url())});
  await page.route(virtual,route=>route.fulfill({status:200,contentType:'text/html',body:html}));
  await page.goto(virtual);assert.equal(await page.locator('iframe').count(),0);
  await page.fill('#phrase','a-deliberately-incorrect-unlock-phrase');await page.locator('#open').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('did not unlock'));
  assert.equal(await page.locator('iframe').count(),0);
  await page.fill('#phrase',phrase);await page.locator('#open').click();
  const frameLocator=page.frameLocator('iframe');await frameLocator.locator('#county-search').waitFor();
  assert.equal(await frameLocator.locator('.county-tile').count(),41);
  assert.equal(await frameLocator.locator('.county-official-artwork').count(),29);
  await page.waitForFunction(()=>{const d=document.querySelector('iframe')?.contentDocument;return d && [...d.querySelectorAll('.county-official-artwork')].every(img=>img.complete&&img.naturalWidth>0)});
  const geometry=await frameLocator.locator('.county-official-artwork').evaluateAll(images=>images.map(img=>{const r=img.getBoundingClientRect();return {ratio:r.width/r.height,natural:img.naturalWidth/img.naturalHeight,fit:getComputedStyle(img).objectFit}}));
  for(const g of geometry){assert.equal(g.fit,'contain');assert.ok(Math.abs(g.ratio-g.natural)<.035,'Logo aspect ratio must be preserved')}
  const heights=await frameLocator.locator('.county-artwork-area').evaluateAll(nodes=>[...new Set(nodes.map(n=>Math.round(n.getBoundingClientRect().height)))]);assert.deepEqual(heights,[94]);
  const shot=await page.locator('iframe').elementHandle();const frame=await shot.contentFrame();
  await frameLocator.locator('#county-results').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/ict-private-shields-desktop.png'});
  await frameLocator.locator('#county-search').fill('Northants');await frameLocator.locator('.county-tile .county-official-artwork').click();await frame.waitForFunction(()=>document.querySelector('h1').textContent==='Northamptonshire');assert.equal(await frameLocator.locator('.county-profile-header .county-official-artwork').count(),1);
  await frameLocator.locator('.county-legacy summary').click();assert.match(await frameLocator.locator('.county-legacy').textContent(),/No approved Northamptonshire updates yet/);
  for(const name of ['Devon','Wiltshire','Yorkshire','Hertfordshire']){
   await frameLocator.locator('a.county-back').click();await frameLocator.locator('#county-select').selectOption(name);await frame.waitForFunction(n=>document.querySelector('h1').textContent===n,name);
   const expected=['Wiltshire','Hertfordshire'].includes(name)?1:0;assert.equal(await frameLocator.locator('.county-profile-header .county-official-artwork').count(),expected);
  }
  for(const width of [768,390,320]){
   await page.setViewportSize({width,height:900});await frameLocator.locator('a.county-back').click();
   assert.ok(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Directory must fit mobile/tablet');
   assert.equal(await frameLocator.locator('.county-official-artwork').count(),29);
   await frameLocator.locator('#county-select').selectOption('Northamptonshire');await frame.waitForFunction(()=>document.querySelector('h1').textContent==='Northamptonshire');assert.ok(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Profile must fit mobile/tablet');
  }
  await page.setViewportSize({width:390,height:844});await frameLocator.locator('a.county-back').click();await frameLocator.locator('#county-results').scrollIntoViewIfNeeded();await page.screenshot({path:'/tmp/ict-private-shields-mobile.png'});
  await page.locator('#lock').click();assert.equal(await page.locator('iframe').count(),0);assert.ok(await page.locator('#unlock').isVisible());
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  console.log(JSON.stringify({encryptedPreview:'passed',wrongPhrase:'denied',verifiedLogos:29,placeholders:12,proportions:'preserved',offlineNetworkRequests:0,requestedProfiles:'passed',mobile:'passed',lock:'passed',fileNavigation:'Managed workspace blocks direct file URLs; wrapper tested on a locally intercepted secure-context URL with networking disabled.'}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
