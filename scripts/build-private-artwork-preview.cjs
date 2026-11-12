/* Build an encrypted, offline-only review without putting privately licensed artwork in public assets. */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const publicRoot=path.join(root,'public');
const [cacheDirectory,passphraseFile,outputFile]=process.argv.slice(2);
if(!cacheDirectory||!passphraseFile||!outputFile)throw new Error('Usage: node scripts/build-private-artwork-preview.cjs <private cache directory> <private passphrase file> <output HTML>');
const manifest=JSON.parse(fs.readFileSync(path.join(cacheDirectory,'manifest.json'),'utf8'));
const register=JSON.parse(fs.readFileSync(path.join(root,'research/county-artwork-register.json'),'utf8'));
const byCounty=new Map(register.artwork.map(a=>[a.countyId,a]));
const assets={};
for(const item of manifest){
 const entry=byCounty.get(item.countyId);
 if(item.status!=='ready-for-private-preview'||entry?.identityStatus!=='verified-current'||!entry?.permission?.allowedUses?.includes('private-preview'))continue;
 if(entry.permission.status!=='user-confirmed-private-preview')throw new Error('Review permission missing for '+item.countyId);
 const bytes=fs.readFileSync(item.cacheFile);
 if(entry.retrieval?.sha256!==item.sha256 || crypto.createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw new Error('Artwork hash mismatch: '+item.countyId);
 assets[item.countyId]={identity:'verified',src:`data:${item.mime};base64,${bytes.toString('base64')}`,tone:['avon','guernsey','isle-of-man','norfolk'].includes(item.countyId)?'dark':'light',permission:{status:'authorised',allowedUses:['private-preview'],evidence:'Owner confirmation recorded in the private review conversation; private preview only.'}};
}
if(!Object.keys(assets).length)throw new Error('No verified privately authorised artwork to preview');
let html=fs.readFileSync(path.join(publicRoot,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="/style.css">',()=>'<style>'+fs.readFileSync(path.join(publicRoot,'style.css'),'utf8')+'</style>');
html=html.replace('DESIGN PREVIEW <span>Private design review · Sourced county profiles · No player information</span>','PRIVATE ARTWORK REVIEW <span>Association artwork authorised for private review only · Not for public distribution</span>');
for(const name of ['data/counties.js','county-directory.js','app.js']){
 let script=fs.readFileSync(path.join(publicRoot,name),'utf8');
 if(name==='app.js'){
  for(const art of ['court','racket','community'])script=script.replaceAll('/art/'+art+'.svg','data:image/svg+xml;base64,'+fs.readFileSync(path.join(publicRoot,'art',art+'.svg')).toString('base64'));
  script=script.replace("const route=location.hash.slice(1)||'home'", "const route=location.hash.slice(1)||'counties'");
 }
 const before=name==='data/counties.js'?'<script>window.ICTCountyArtwork='+JSON.stringify({context:'private-preview',assets}).replace(/<\/script/gi,'<\\/script')+';</script>':'';
 html=html.replace('<script src="/'+name+'"></script>',()=>before+'<script>'+script.replace(/<\/script/gi,'<\\/script')+'</script>');
}
// Prevent relative fragment links from navigating out of an embedded offline document.
html=html.replace('</body>',`<script>document.addEventListener('click',function(e){const a=e.target.closest('a[href^="#"]');if(a){e.preventDefault();const h=a.getAttribute('href');if(location.hash===h)window.dispatchEvent(new HashChangeEvent('hashchange'));else location.hash=h;}});</script></body>`);
const passphrase=fs.readFileSync(passphraseFile,'utf8').trim();
if(passphrase.length<20)throw new Error('Use a strong, separate preview phrase of at least 20 characters');
const salt=crypto.randomBytes(16),iv=crypto.randomBytes(12),iterations=600000;
const key=crypto.pbkdf2Sync(passphrase,salt,iterations,32,'sha256');
const cipher=crypto.createCipheriv('aes-256-gcm',key,iv);
const encrypted=Buffer.concat([cipher.update(html,'utf8'),cipher.final(),cipher.getAuthTag()]);
key.fill(0);
const payload={version:1,algorithm:'AES-GCM',derivation:'PBKDF2-SHA256',iterations,salt:salt.toString('base64'),iv:iv.toString('base64'),ciphertext:encrypted.toString('base64')};
const wrapper=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; frame-src 'self' about:; object-src 'none'; base-uri 'none'; form-action 'none'"><title>ICT — Private County Artwork Review</title><style>*{box-sizing:border-box}body{margin:0;background:#f5f7ee;color:#174e3e;font-family:Arial,sans-serif}.unlock{max-width:470px;margin:9vh auto;padding:32px;border:1px solid #d9e3cf;border-radius:14px;background:white;box-shadow:0 20px 60px #174e3e12}small{letter-spacing:2px;font-size:10px}h1{font-size:32px;letter-spacing:-1px;margin:20px 0}p{font-size:14px;line-height:1.8;color:#62715f}label{font-size:13px;display:block;margin-top:22px}input{width:100%;padding:14px;border:1px solid #becdb1;border-radius:5px;margin:8px 0 14px;font:inherit}button{padding:14px 20px;border:0;border-radius:5px;background:#d9f279;color:#123b32;font-weight:bold;cursor:pointer}button:focus-visible,input:focus-visible{outline:3px solid #739847;outline-offset:3px}button:disabled{opacity:.65;cursor:wait}#status{min-height:28px;font-size:12px;margin-top:14px}#review{display:none}#toolbar{display:flex;gap:20px;align-items:center;justify-content:space-between;padding:9px 18px;background:#123b32;color:white;font-size:11px}#toolbar button{padding:8px 14px;font-size:11px}iframe{display:block;border:0;width:100%;height:calc(100dvh - 50px);background:#f8f8f2}.note{font-size:11px;border-top:1px solid #e0e7d7;padding-top:15px;margin-top:20px}@media(max-width:520px){.unlock{margin:25px 16px;padding:24px}#toolbar span{max-width:65%;line-height:1.5}}</style></head><body><main class="unlock" id="unlock"><small>ICT • PRIVATE DESIGN REVIEW</small><h1>Your counties.<br>Their identities.</h1><p>This encrypted offline preview contains association artwork authorised for private review. It makes no network requests and changes nothing on the staging website.</p><form id="unlock-form"><label for="phrase">Preview unlock phrase</label><input id="phrase" type="password" required autocomplete="off" spellcheck="false" placeholder="Paste the phrase from the chat"><button id="open" type="submit">Open the county directory</button><div id="status" role="status" aria-live="polite"></div></form><p class="note">Use the separate phrase supplied with this preview, not your Netlify password. Keep the phrase private. Public reuse of the artwork has not been approved.</p></main><section id="review" aria-label="Unlocked private review"><div id="toolbar"><span>PRIVATE ARTWORK REVIEW • Offline • Not for public distribution</span><button id="lock" type="button">Lock preview</button></div><div id="frame-container"></div></section><script>
const payload=${JSON.stringify(payload)};
const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
const status=document.getElementById('status');
document.getElementById('unlock-form').addEventListener('submit',async event=>{
 event.preventDefault();const button=document.getElementById('open');button.disabled=true;status.textContent='Unlocking your private preview…';
 try{
  if(!globalThis.crypto?.subtle)throw new Error('crypto-unavailable');
  const phrase=document.getElementById('phrase').value.trim();
  const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(phrase),'PBKDF2',false,['deriveKey']);
  const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(payload.salt),iterations:payload.iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
  const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(payload.iv)},key,bytes(payload.ciphertext));
  const contents=new TextDecoder().decode(plain);new Uint8Array(plain).fill(0);
  const frame=document.createElement('iframe');frame.title='ICT County Directory — Private Artwork Preview';frame.setAttribute('sandbox','allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-modals');frame.src='about:blank';
  frame.addEventListener('load',()=>{frame.contentDocument.open();frame.contentDocument.write(contents);frame.contentDocument.close();},{once:true});
  document.getElementById('frame-container').replaceChildren(frame);document.getElementById('phrase').value='';document.getElementById('unlock').hidden=true;document.getElementById('review').style.display='block';status.textContent='';
 }catch(error){status.textContent=error.message==='crypto-unavailable'?'Please open this downloaded HTML file in a current Chrome, Edge, Firefox or Safari browser.':'That phrase did not unlock the preview. Copy the phrase from the chat and try again.';}
 finally{button.disabled=false;}
});
document.getElementById('lock').addEventListener('click',()=>{document.getElementById('frame-container').replaceChildren();document.getElementById('review').style.display='none';document.getElementById('unlock').hidden=false;document.getElementById('phrase').focus();});
</script></body></html>`;
fs.mkdirSync(path.dirname(outputFile),{recursive:true});fs.writeFileSync(outputFile,wrapper);
console.log(JSON.stringify({output:outputFile,bytes:Buffer.byteLength(wrapper),embeddedArtwork:Object.keys(assets).length,encrypted:true,sha256:crypto.createHash('sha256').update(wrapper).digest('hex')}));
