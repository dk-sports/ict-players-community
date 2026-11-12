const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require('playwright');
const data=require('../public/data/counties.js');
const artwork=require('../research/county-artwork-register.json');
const expected=['Avon','Bedfordshire','Berkshire','Buckinghamshire','Cambridgeshire','Cheshire','Cornwall','Cumbria','Derbyshire','Devon','Dorset','Durham','Essex','Gloucestershire','Guernsey','Hampshire','Herefordshire','Hertfordshire','Isle of Man','Isle of Wight','Jersey','Kent','Lancashire','Leicestershire','Lincolnshire','Middlesex','Norfolk','Northamptonshire','Northumberland','Nottinghamshire','Oxfordshire','Shropshire','Somerset','Staffordshire','Suffolk','Surrey','Sussex','Warwickshire','Wiltshire','Worcestershire','Yorkshire'];

test('all 41 provisional association records have usable copy, traceable facts and withheld artwork',()=>{
 assert.deepEqual(data.associations.map(c=>c.name),expected);
 assert.equal(data.meta.listStatus,'provisional');
 assert.equal(new Set(data.associations.map(c=>c.id)).size,41);
 assert.equal(artwork.artwork.length,41);
 for(const c of data.associations){
  assert.ok(c.associationName);
  assert.ok(/^https?:\/\//.test(c.website.url));
  const words=c.introduction.split(/\s+/).length;
  assert.ok(words>=75&&words<=120,`${c.name}: ${words} introductory words`);
  const ids=new Set(c.sources.map(s=>s.id));
  const facts=[...Object.values(c.programmes),...c.history,...c.ictHeritage.records,{sourceIds:c.introductionSourceIds}];
  facts.forEach(f=>(f.sourceIds||[]).forEach(id=>assert.ok(ids.has(id),`${c.name} missing ${id}`)));
  Object.values(c.programmes).filter(p=>p.status==='confirmed').forEach(p=>assert.ok(p.sourceIds.length));
  c.sources.forEach(s=>{assert.match(s.verifiedAt,/^\d{4}-\d{2}-\d{2}$/);assert.ok(/^https?:\/\//.test(s.url))});
  assert.equal(c.artwork.permissionStatus,'not-established');
  assert.equal(c.artwork.display,'text-placeholder');
  const a=artwork.artwork.find(a=>a.countyId===c.id);
  assert.ok(['private-preview-only','placeholder-until-identity-verified'].includes(a.releaseStatus));assert.equal(a.localFile,null);assert.equal(a.permission.publicUse,'not-established');assert.deepEqual(a.permission.allowedUses,['private-preview']);
  assert.deepEqual(c.ictHeritage.photographs,[]);assert.deepEqual(c.ictHeritage.memories,[]);
 }
 assert.deepEqual(data.associations.filter(c=>c.ictHeritage.records.length).map(c=>c.name),['Hertfordshire','Oxfordshire','Warwickshire']);
 assert.equal(data.associations.find(c=>c.name==='Northamptonshire').ictHeritage.records.length,0);
 assert.equal(data.associations.find(c=>c.name==='Devon').website.scope,'junior');
});

test('county search, alphabetical filtering, selectors, all profiles and mobile layouts',async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];const externalRequests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:3000/'))externalRequests.push(r.url())});
  await page.goto('http://127.0.0.1:3000/#counties');
  await page.locator('#county-search').waitFor();
  assert.equal(await page.locator('.county-tile').count(),41);
  assert.match(await page.locator('.county-provisional').innerText(),/pending final verification with Badminton England/);
  assert.deepEqual(await page.locator('.county-tile>strong').allTextContents(),expected);
  for(const [search,county] of [['  northants  ','Northamptonshire'],['IOM','Isle of Man'],['Devon County Junior Badminton Association','Devon']]){
   await page.fill('#county-search',search);assert.equal(await page.locator('.county-tile').count(),1);assert.equal(await page.locator('.county-tile>strong').textContent(),county);
  }
  await page.fill('#county-search','nonexistent county');assert.equal(await page.locator('.county-tile').count(),0);assert.match(await page.locator('#county-count').innerText(),/Showing 0/);
  await page.locator('#clear-county-search').click();
  await page.locator('[data-county-letter="I"]').click();assert.equal(await page.locator('.county-tile').count(),2);
  await page.fill('#county-search','man');assert.equal(await page.locator('.county-tile').count(),1);
  await page.locator('#clear-county-search').click();assert.equal(await page.locator('.county-tile').count(),41);
  await page.selectOption('#county-select','Guernsey');await page.waitForURL('**/#county/Guernsey');assert.equal(await page.locator('h1').textContent(),'Guernsey');
  for(const c of data.associations){
   await page.goto('http://127.0.0.1:3000/#county/'+encodeURIComponent(c.name));
   await page.waitForFunction(name=>document.querySelector('h1')?.textContent===name,c.name);
   assert.equal(await page.locator('.profile-association').textContent(),c.associationName);
   assert.equal(await page.locator('.programme-card').count(),3);
   assert.equal(await page.locator('#ict-heritage h2').textContent(),'ICT Heritage');
   assert.equal(await page.locator('.county-profile-body img, .county-directory-card img').count(),0);
   assert.equal(await page.locator('.county-profile-sidebar a.button').getAttribute('href'),c.website.url);
   assert.equal(await page.locator('.heritage-record').count(),c.ictHeritage.records.length);
   if(!c.ictHeritage.records.length)assert.match(await page.locator('.heritage-unconfirmed').innerText(),/not a statement/);
  }
  await page.goto('http://127.0.0.1:3000/#county/Northamptonshire');
  await page.locator('.county-legacy summary').click();
  const original=await page.locator('.county-legacy').textContent();
  for(const text of ['One county.','A shared ambition.','Follow the journey from training sessions to tournament day.','A verified adult representative will manage future contributions.','No approved Northamptonshire updates yet.'])assert.ok(original.includes(text),text);
  assert.equal(await page.locator('.county-legacy a[href="#contribute"]').count(),1);
  assert.equal(await page.locator('.county-legacy a[href="#sponsors"]').count(),1);
  await page.locator('[data-county-scroll="ict-heritage"]').click();
  await page.waitForTimeout(700);assert.equal(new URL(page.url()).hash,'#county/Northamptonshire');assert.ok(await page.locator('#ict-heritage').evaluate(el=>el.getBoundingClientRect().top<150));
  await page.goto('http://127.0.0.1:3000/#county/isle-of-man');assert.equal(await page.locator('h1').textContent(),'Isle of Man');
  await page.goto('http://127.0.0.1:3000/#county/%E0%A4%A');assert.equal(await page.locator('h1').textContent(),'County not found');
  for(const route of ['contribute','sponsors','news']){
   await page.goto('http://127.0.0.1:3000/#'+route);
   const options=await page.locator(route==='contribute'?'#county option':route==='sponsors'?'#sponsor-county option':'#news-filter option').allTextContents();
   for(const name of expected)assert.ok(options.includes(name),`${route}: ${name}`);
  }
  for(const width of [1440,768,390,320]){
   await page.setViewportSize({width,height:900});
   for(const route of ['counties','county/Northamptonshire','county/Buckinghamshire','county/Hertfordshire']){
    await page.goto('http://127.0.0.1:3000/#'+route);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width}px ${route} overflows`);
   }
  }
  await page.setViewportSize({width:1440,height:1050});await page.goto('http://127.0.0.1:3000/#counties');await page.screenshot({path:'/tmp/ict-county-directory-desktop.png',fullPage:true});
  await page.goto('http://127.0.0.1:3000/#county/Wiltshire');await page.screenshot({path:'/tmp/ict-county-profile-desktop.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:3000/#counties');await page.screenshot({path:'/tmp/ict-county-directory-mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);assert.deepEqual(externalRequests,[],'No logos, photos, fonts or external resources should be loaded');
  const unavailable=await page.request.get('http://127.0.0.1:3000/research/county-artwork-register.json');assert.equal(unavailable.status(),404);
 }finally{await browser.close()}
});

test('staging gate still denies every new county asset without credentials',async()=>{
 const source=fs.readFileSync('netlify/edge-functions/staging-auth.js','utf8');
 const {default:gate}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 global.Netlify={env:{get:key=>({STAGING_USERNAME:'reviewer',STAGING_PASSWORD:'test-only'})[key]}};
 try{
  for(const path of ['/data/counties.js','/county-directory.js','/style.css','/app.js','/']){
   let served=false;const context={next:async()=>{served=true;return new Response('protected')}};
   assert.equal((await gate(new Request('https://staging.invalid'+path),context)).status,401);assert.equal(served,false);
   assert.equal((await gate(new Request('https://staging.invalid'+path,{headers:{authorization:'Basic '+btoa('reviewer:test-only')}}),context)).status,200);
  }
 }finally{delete global.Netlify}
});
