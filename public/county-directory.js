/* Artwork renders only from embedded, identity-verified assets with permission for the current review context. */
(function (root) {
  'use strict';
  const data = root.ICTCountyData;
  const records = data.associations;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const formatDate = value => new Date(value + 'T12:00:00Z').toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric',timeZone:'Europe/London'});
  const normalise = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const find = name => records.find(c => c.name === name || c.id === name);
  const initials = c => c.name.startsWith('Isle of ') ? (c.name === 'Isle of Man' ? 'IOM' : 'IOW') : c.name.slice(0,2).toUpperCase();
  const external = (url, text, cls = '') => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text)}<span class="external-mark" aria-hidden="true"></span><span class="sr-only"> (opens in a new tab)</span></a>`;
  function artworkFor(c) {
    const config = root.ICTCountyArtwork;
    if (!config || !['private-preview', 'public-release'].includes(config.context)) return null;
    const asset = config.assets?.[c.id];
    if (!asset || asset.identity !== 'verified' || asset.permission?.status !== 'authorised') return null;
    if (!asset.permission.allowedUses?.includes(config.context) || !asset.permission.evidence) return null;
    if (!/^data:image\/(?:png|jpeg|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(asset.src || '')) return null;
    return asset;
  }
  function badge(c) {
    const asset = artworkFor(c);
    return `<span class="county-artwork-area ${asset?.tone === 'dark' ? 'county-artwork-dark' : ''}">${asset
      ? `<img class="county-official-artwork" src="${esc(asset.src)}" alt="${esc(c.associationName)} — official association artwork" decoding="async">`
      : `<span class="county-monogram" aria-hidden="true">${initials(c)}</span>`}</span>`;
  }
  function card(name) {
    const c = typeof name === 'string' ? find(name) : name;
    if (!c) return '';
    return `<a class="county-tile county-directory-card" href="#county/${encodeURIComponent(c.name)}" aria-label="Explore ${esc(c.name)} county profile">
      <div class="county-card-top">${badge(c)}<span class="county-card-arrow" aria-hidden="true"></span></div>
      <strong>${esc(c.name)}</strong><span class="county-association">${esc(c.associationName)}</span>
      <span class="county-card-footer">Explore the community<span aria-hidden="true"> →</span></span>
    </a>`;
  }
  function sourceLinks(c, ids) {
    return `<span class="fact-sources">${ids.map(id => c.sources.find(s => s.id === id)).filter(Boolean).map(s => external(s.url, s.label)).join(' · ')}</span>`;
  }
  function directory(year) {
    const letters = [...new Set(records.map(c => c.name[0]))];
    return `<div class="county-directory-hero"><div class="directory-hero-copy"><a class="county-back" href="#home">← Back to the community</a><div class="eyebrow">County Badminton</div><h1>Your county.<br><em>Your community.</em></h1><p>Discover the associations, people and shared love of badminton behind every county. From first rallies to lifelong friendships.</p><div class="directory-hero-tags"><span>41 county & island associations</span><span>Every generation of the game</span></div></div><div class="directory-hero-art" aria-hidden="true"><div class="court-lines"></div><span class="directory-art-type">COUNTY<br>PRIDE.<br><em>SHARED<br>SPIRIT.</em></span></div></div>
      <div class="county-provisional"><span class="county-notice-dot" aria-hidden="true"></span><p><strong>Provisional association directory.</strong> ${esc(data.meta.notice)}</p></div>
      <section class="county-directory-section"><div class="section-head"><div><div class="eyebrow">Find your people</div><h2>Explore the counties.</h2><p>County Badminton celebrates every association. Each profile has a separate, evidence-led ICT Heritage section.</p></div><label class="tournament-context">Tournament view<select class="year-select" id="year" aria-label="Tournament year">${[2027,2028,2029].map(y=>`<option ${year===y?'selected':''}>${y}</option>`).join('')}</select></label></div>
      <div class="county-directory-controls"><div class="county-search-wrap"><span class="search-icon" aria-hidden="true"></span><label class="sr-only" for="county-search">Search counties and associations</label><input id="county-search" type="search" placeholder="Search a county or association…" autocomplete="off"></div><div class="county-jump"><label for="county-select">Jump to a county</label><select id="county-select"><option value="">Choose an association</option>${records.map(c=>`<option value="${esc(c.name)}">${esc(c.name)}</option>`).join('')}</select></div></div>
      <div class="county-alphabet" role="group" aria-label="Filter counties by first letter"><button type="button" data-county-letter="" aria-pressed="true">All</button>${letters.map(l=>`<button type="button" data-county-letter="${l}" aria-pressed="false">${l}</button>`).join('')}</div>
      <div class="county-results-bar"><p id="county-count" role="status" aria-live="polite">Showing 41 of 41 associations</p><button id="clear-county-search" class="county-clear" type="button" hidden>Clear filters</button></div>
      <div id="county-results" class="county-grid county-directory-grid">${records.map(card).join('')}</div>
      <div class="county-directory-footnote"><strong>Identity matters. Permission matters.</strong><p>${root.ICTCountyArtwork?.context === 'private-preview' ? 'Verified association artwork is shown only where permission for this private review is recorded. Initials remain wherever the current association artwork has not been verified. Public reuse permission is not implied.' : 'Initials are placeholders, not county shields. Association artwork will appear on the website only after permission for public use has been established. No privately authorised logos are loaded in this website build.'}</p><p>Directory sources checked ${formatDate(data.meta.verifiedAt)}. ${data.meta.membershipSources.map(s=>external(s.url,s.label)).join(' · ')}</p></div></section>`;
  }
  function heritage(c) {
    const h = c.ictHeritage;
    return `<section id="ict-heritage" class="county-heritage"><div class="section-head"><div><div class="eyebrow">A separate chapter</div><h2>ICT Heritage</h2><p>The tournament memories belong here. Association membership and general county badminton do not establish ICT participation.</p></div><span class="county-label">Evidence-led archive</span></div>
      ${h.records.length ? `<div class="heritage-timeline">${h.records.map(r=>`<article class="heritage-record"><span class="heritage-year">${r.year}</span><div><span class="meta">${r.kind==='result'?'Documented result':'Documented participation'}</span><h3>${esc(r.title)}</h3><p>${esc(r.summary)}</p>${sourceLinks(c,r.sourceIds)}</div></article>`).join('')}</div>` : `<div class="heritage-unconfirmed"><strong>ICT participation is not yet documented in this directory.</strong><p>This is a gap in our records, not a statement that ${esc(c.name)} has never taken part. No participation year or result is inferred.</p></div>`}
      <div class="heritage-placeholders"><article><span class="archive-icon" aria-hidden="true">01</span><h3>Results & achievements</h3><p>${h.records.some(r=>r.kind==='result')?'Documented results are listed above. Further results and county achievements await verification.':'Historical results and county achievements will be added with supporting sources.'}</p></article><article><span class="archive-icon" aria-hidden="true">02</span><h3>Team photographs</h3><p>No photographs have been added. Images need rights clearance, appropriate consent and safeguarding review.</p></article><article><span class="archive-icon" aria-hidden="true">03</span><h3>Memories & stories</h3><p>A future home for recollections from players, families and supporters, reviewed before publication.</p></article></div><a class="text-link" href="#history">Explore the community history section →</a></section>`;
  }
  function profile(c, legacy = '') {
    return `<div class="county-profile-header"><div class="profile-header-inner"><a class="county-back" href="#counties">← All counties</a><div class="county-profile-identity">${badge(c)}<div><div class="eyebrow">County Badminton</div><h1>${esc(c.name)}</h1><p class="profile-association">${esc(c.associationName)}</p></div></div><div class="county-profile-actions"><button class="button" type="button" data-county-scroll="county-badminton">Discover county badminton ↓</button><button class="text-link profile-scroll-link" type="button" data-county-scroll="ict-heritage">ICT Heritage ↓</button></div></div></div>
      <div class="county-provisional"><span class="county-notice-dot" aria-hidden="true"></span><p><strong>Provisional directory.</strong> Association details are sourced individually; the complete list awaits final verification with Badminton England. Inclusion does not confirm ICT participation.</p></div>
      <section id="county-badminton" class="county-profile-body"><div class="county-profile-layout"><div><div class="eyebrow">The people behind the county</div><h2>A place in the game.</h2><p class="county-introduction">${esc(c.introduction)}</p>${sourceLinks(c,c.introductionSourceIds)}
      ${c.identityNote ? `<p class="county-research-note"><strong>Association identity:</strong> ${esc(c.identityNote)}</p>` : ''}
      <h3 class="profile-subheading">County badminton history</h3>${c.history.length ? c.history.map(h=>`<div class="county-history-fact"><p>${esc(h.text)}</p>${sourceLinks(c,h.sourceIds)}</div>`).join('') : '<p class="county-pending">A sourced county history has not yet been added. Founding dates and achievements will be included only when verified.</p>'}
      </div><aside class="county-profile-sidebar" aria-label="County information"><span class="meta">Connect with the association</span><h3>Go straight to the source.</h3><p>For current clubs, programmes and eligibility, visit the association’s own resources.</p>${external(c.website.url,c.website.label,'button')}${c.name==='Devon' ? `<p class="county-research-note">This website covers junior badminton. Wider county association information is currently limited to its published identity.</p>${external('https://www.facebook.com/devonbadminton/','Wider county association on Facebook','text-link')}` : ''}<div class="county-sidebar-detail"><span class="meta">Sources checked</span><strong>${formatDate(c.verifiedAt)}</strong></div><div class="county-sidebar-detail"><span class="meta">Association artwork</span><strong>${artworkFor(c) ? 'Official association artwork' : 'Initials placeholder'}</strong><p>${artworkFor(c)
      ? (root.ICTCountyArtwork.context === 'private-preview' ? 'Authorised for this private preview, based on the owner’s confirmation. Public reuse is not approved.' : 'Permission for public display is recorded.')
      : esc(c.artwork.note) + ' A verified current asset and permission for this context are required.'}</p></div></aside></div>
      <div class="county-programmes"><div class="section-head"><div><div class="eyebrow">Find your next rally</div><h2>Badminton for every chapter.</h2></div></div><div class="programme-grid">${Object.entries(c.programmes).map(([key,p],i)=>`<article class="programme-card"><span class="programme-number" aria-hidden="true">0${i+1}</span><span class="programme-status ${p.status==='confirmed'?'confirmed':''}">${p.status==='confirmed'?'Source confirmed':p.status==='needs-review'?'Details need confirmation':'Information to confirm'}</span><h3>${key==='junior'?'Junior':key==='senior'?'Senior':'Masters'} badminton</h3><p>${esc(p.text)}</p>${sourceLinks(c,p.sourceIds)}</article>`).join('')}</div></div></section>
      ${legacy ? `<section class="county-legacy"><details><summary>Existing Northamptonshire community information</summary><p class="county-pending">Original prototype community information and links, retained alongside the sourced profile. Any sample statements below are illustrative.</p>${legacy}</details></section>` : ''}
      ${heritage(c)}
      <section class="county-sources"><details><summary>Sources, verification & open questions</summary><p>Facts are attributed to the association’s published material. A checked date records our research, not a guarantee that a programme or historical claim has been independently audited.</p><ul>${c.sources.map(s=>`<li>${external(s.url,s.label)}<span>Checked ${formatDate(s.verifiedAt)}${s.scope==='identity only'?' · Identity only':''}${s.availability!==200?' · Availability needs checking':''}</span></li>`).join('')}</ul><p><strong>Still to establish:</strong> final recognition of the complete association list; artwork reuse permission; ${c.history.length?'additional historical records':'a sourced county history'}; ${Object.values(c.programmes).some(p=>p.status!=='confirmed')?'the programme details flagged above; ':''}further ICT records and image permissions.</p></details><div class="county-profile-bottom"><a class="button secondary" href="#counties">← Back to all 41 associations</a><a class="text-link" href="#removal">Request a correction or removal →</a></div></section>`;
  }
  function bindDirectory() {
    document.querySelectorAll('[data-county-scroll]').forEach(button => button.addEventListener('click', () => {
      document.getElementById(button.dataset.countyScroll)?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block:'start'});
    }));
    const input = document.querySelector('#county-search');
    if (!input) return;
    let letter = '';
    const update = () => {
      const tokens = normalise(input.value).split(' ').filter(Boolean);
      const found = records.filter(c => (!letter || c.name.startsWith(letter)) && tokens.every(t=>normalise([c.name,c.associationName,...c.aliases].join(' ')).includes(t)));
      document.querySelector('#county-results').innerHTML = found.length ? found.map(card).join('') : '<div class="county-empty"><h3>No matching associations</h3><p>Try a county name, association name or abbreviation, or clear the filters to see all 41.</p></div>';
      document.querySelector('#county-count').textContent = `Showing ${found.length} of 41 associations`;
      document.querySelector('#clear-county-search').hidden = !tokens.length && !letter;
      document.querySelectorAll('[data-county-letter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.countyLetter===letter)));
    };
    input.addEventListener('input',update);
    document.querySelectorAll('[data-county-letter]').forEach(b=>b.addEventListener('click',()=>{letter=b.dataset.countyLetter;update();}));
    document.querySelector('#clear-county-search').addEventListener('click',()=>{input.value='';letter='';update();input.focus();});
    document.querySelector('#county-select').addEventListener('change',e=>{if(e.target.value)location.hash='county/'+encodeURIComponent(e.target.value);});
  }
  root.ICTCountyDirectory = {find,card,directory,profile,bindDirectory,artworkFor};
})(window);
