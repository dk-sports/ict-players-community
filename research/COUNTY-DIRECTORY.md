# County Badminton directory — implementation review

Review branch: `review/county-badminton-directory`. Based on main commit `9a4a292`. No merge or deployment is authorised by this change.

## What is implemented

- One alphabetical dataset of 41 county/island associations, marked provisional pending final verification with Badminton England. This is an association directory, not an ICT entry list.
- 41 individual hash-route profiles. Existing `#county/Northamptonshire` links continue working; stable IDs such as `#county/isle-of-man` also resolve.
- Search covers county names, association names and aliases (Northants, IOM, IOW, etc.). Alphabet filters, result counts, clear filters and a county jump selector work together.
- Existing county selectors in contributions, sponsorship and news, plus Meet the Teams cards, use the same 41 names.
- Each profile has a 75–120-word original introduction, published association name, official resources, source dates, junior/senior/masters information with confirmation labels, and a separate ICT Heritage area.
- Eight profiles have sourced county-history notes: Bedfordshire, Berkshire, Cheshire, Jersey, Somerset, Suffolk, Warwickshire and Wiltshire. Where unavailable, history is explicitly not yet added.
- Documented ICT entries are limited to Hertfordshire (2025 champions), Oxfordshire (2024 participation, no inferred placing), and Warwickshire (2017 fourth place). Other pages say records are not yet documented, rather than claiming a county never participated. Senior inter-county archives are not repurposed as junior ICT evidence.
- Every profile reserves places for future results/achievements, team photographs and memories. No real player profiles, photos, contact records or submissions have been introduced.

## Source provenance and current research

`public/data/counties.js` is the editable source of county copy, programme facts, history, heritage and per-record citations. Every factual block references source IDs. The current research date is 12 November 2026. Website identity comes from the association's own published material; it is not proof of current Badminton England recognition.

`source-checks.json` records fresh read-only checks of official homepages and selected programme/history pages, including timestamp, response status, final URL and content hash. It does not retain player lists, contact details, source photos or full copyrighted page transcripts. A successful HTTP response proves availability, not factual correctness. HJBA returned an empty HTTP 202; the Hertfordshire profile relies on the accessible senior association references and its published ICT report instead.

Current list evidence is the July 2018 Book (41 county/island associations) and the 16 October 2025 draft General Meeting minutes mentioning “20/41 Counties”. The final current recognised-member register still needs confirmation from Badminton England. The 44 competing counties in the 2026–27 Senior County Championships include organisations outside England and must not replace this membership list.

The corrected Herefordshire, Devon junior and Wiltshire websites are used. Devon's website is explicitly labelled as junior provision; the separate wider county association's Facebook identity does not establish its senior programme. Wiltshire's constitution names the association and dates rules to 1962, which is not presented as a founding year.

## Unresolved county information

- Full formal names/identity wording remain flagged for Derbyshire, Gloucestershire, Lincolnshire and Staffordshire. Northamptonshire retains the published “Northants” name; Devon distinguishes junior and wider organisations.
- Programme gaps or limitations are explicitly flagged for Buckinghamshire, Cumbria (junior/masters), Devon (senior/masters), Dorset (masters), Durham (masters), Gloucestershire, Guernsey (masters), Isle of Man (masters), Isle of Wight, Herefordshire (junior/masters and senior-team details), Jersey, Norfolk (masters), Northamptonshire (masters section under construction), Staffordshire (undated junior information) and Surrey (masters).
- No dates/achievements are invented where a county history is missing. Historical web copy is attributed to its association rather than asserted as independently audited fact.
- ICT years, results and photographs beyond the three documented entries require evidence. A page titled “ICT 2026” or an undated “this year” reference is insufficient.

## Artwork preparation and permissions

`county-artwork-register.json` contains 41 metadata records: 29 verified current logo candidates and 12 unresolved identities. Buckinghamshire's current badminton-specific swan artwork was verified during this review. See `county-artwork-permissions.csv` for sources, contact pages, website notices and next actions.

The owner confirmed permission for all associations in the private review conversation on 12 November 2026. This is recorded as owner-confirmed authorisation for private preview only; written association licences have not been independently reviewed. Public reuse remains unestablished for every county. No applicable public artwork reuse grant was found in the checked sources.

The normal website continues to show 41 text placeholders. No unencrypted association artwork is committed or hotlinked. The separate offline preview embeds 29 original assets inside an AES-256-GCM encrypted payload, unlocked with a new review phrase supplied privately. It is not the Netlify password. The public repository contains only this encrypted artifact and source metadata; keep the phrase and decrypted content private.

Unresolved artwork: Berkshire, Cornwall, Derbyshire, Devon, Herefordshire, Isle of Wight, Lincolnshire, Oxfordshire, Staffordshire, Warwickshire, Worcestershire and Yorkshire. Cornwall's funding-specific marks and Staffordshire's historical library wordmark are not confirmed current association identities. A composite Isle of Wight photograph, Yorkshire kit photographs, generic shuttles, council arms, county flags, sponsors and theme logos are not substituted. Oxfordshire and Worcestershire requests were restricted; Lincolnshire's public media endpoint returned 403. These limitations are not evidence that a logo does not exist.

A shared renderer supports independently verified identity and explicit permission scope, using embedded images only when the matching preview context and evidence are supplied. Production does not receive the private asset map. Logos use a consistent display area and `object-fit: contain`; original bytes and proportions are preserved. Both cards and profiles use the same artwork. Public release needs separately recorded rights and approval.

Suggested permission request (not sent): “Please confirm your association's current logo and provide a vector or high-resolution transparent original. May ICT – The Players' Community, an independent initiative, display it on the association profile in private design review and later publicly? Please specify permitted uses, required credit, brand restrictions and the appropriate rights holder.”

## Northamptonshire preservation

The current main branch contains a generic Northamptonshire prototype profile, with no additional bespoke dataset. Its existing community paragraphs, team-profile message, county-updates text, share action, submission link and sponsorship link are retained unchanged inside an expandable “Existing Northamptonshire community information” section. The original rendering function remains in `app.js`; tests verify the preserved copy and links. No assumption of ICT participation has been added.

## Security and deployment boundary

`netlify.toml`, `netlify/edge-functions/staging-auth.js`, `server.js`, passwords, environment variables and Netlify Team Protection are unchanged. No Netlify tools or deployment commands are used. The new JavaScript files remain covered by the existing `/*` Edge Function route. The research register is outside Netlify's `public` publish directory.

A push to a GitHub review branch is not an approval to merge or deploy. Site settings controlling automatic branch/deploy previews must remain subject to the owner's existing protection and deployment policy.

## Review locally

Run `npm start`, then open the site through your development environment's supported browser view. Choose **The counties**, search or select a county, and inspect **County Badminton**, **ICT Heritage**, programme confirmation labels and **Sources, verification & open questions**. The existing prototype forms still accept fictional content only.

Run `npm test` with the development server running. The suite verifies all 41 profiles, data/source integrity, search/aliases, combined filters, selectors, year-independent county identity, desktop/tablet/mobile layouts, preserved Northamptonshire copy, no external artwork requests, and staging protection for new assets, alongside the original moderation/removal tests.
