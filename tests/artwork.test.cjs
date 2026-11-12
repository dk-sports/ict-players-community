const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const data=require('../public/data/counties.js');
const register=require('../research/county-artwork-register.json');
const source=fs.readFileSync('public/county-directory.js','utf8');
// A synthetic one-pixel test fixture, never included in a visual preview or county data.
const pixel='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==';
function renderer(config){const window={ICTCountyData:data,ICTCountyArtwork:config};vm.runInNewContext(source,{window});return window.ICTCountyDirectory;}
const permitted={identity:'verified',src:pixel,permission:{status:'authorised',allowedUses:['private-preview'],evidence:'Synthetic permission fixture for unit testing only'}};
test('artwork needs verified identity, explicit permission and matching release context',()=>{
 const c=data.associations[0];
 assert.equal(renderer().artworkFor(c),null);
 assert.equal(renderer({context:'website',assets:{avon:permitted}}).artworkFor(c),null);
 assert.equal(renderer({context:'public-release',assets:{avon:permitted}}).artworkFor(c),null);
 for(const asset of [{...permitted,identity:'unverified'},{...permitted,permission:{status:'pending',allowedUses:['private-preview'],evidence:'test'}},{...permitted,permission:{status:'authorised',allowedUses:[],evidence:'test'}},{...permitted,permission:{status:'authorised',allowedUses:['private-preview'],evidence:null}},{...permitted,src:'https://example.invalid/logo.png'},{...permitted,src:'javascript:alert(1)'}])assert.equal(renderer({context:'private-preview',assets:{avon:asset}}).artworkFor(c),null);
 const r=renderer({context:'private-preview',assets:{avon:permitted}});
 assert.equal(r.artworkFor(c).src,pixel);assert.match(r.card('Avon'),/county-official-artwork/);assert.match(r.profile(c),/county-official-artwork/);
 assert.equal((r.card('Avon').match(/<a /g)||[]).length,1,'Artwork remains inside one county link');
 assert.match(r.card('Devon'),/county-monogram/);assert.doesNotMatch(r.card('Devon'),/<img/);
});
test('private permission never authorises public artwork release or exposes files',()=>{
 assert.equal(register.artwork.length,41);
 for(const a of register.artwork){
  assert.equal(a.permission.status,'user-confirmed-private-preview');assert.deepEqual(a.permission.allowedUses,['private-preview']);assert.equal(a.permission.publicUse,'not-established');assert.equal(a.permission.evidence.type,'owner-confirmation');assert.equal(a.localFile,null);
  if(a.candidate){assert.equal(a.identityStatus,'verified-current');assert.equal(a.releaseStatus,'private-preview-only')}
 }
 assert.equal(register.artwork.filter(a=>a.identityStatus==='verified-current').length,29);
 assert.ok(register.artwork.find(a=>a.county==='Staffordshire').research.historicalCandidate);
 assert.ok(register.artwork.find(a=>a.county==='Cornwall').research.conclusion.includes('development-fund'));
 assert.ok(!fs.existsSync('public/county-logos'),'No privately authorised logo files in public assets');
 const normal=renderer();assert.doesNotMatch(data.associations.map(c=>normal.card(c)).join(''),/<img/);
});
