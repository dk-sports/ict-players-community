# ICT – The Players’ Community

Independent, unpublished, sample-only community website prototype for junior county badminton. Not affiliated with Badminton England.

## Run

Requires Node.js 18+; no runtime dependencies or build step.

```sh
npm start
```

The server uses port 3000 (override with `PORT`). Do not deploy publicly before design and safeguarding approval.

## Browser verification

```sh
npm ci --cache /tmp/ict-npm-cache
npm start
# In another terminal:
npm test
```

Tests use Playwright and `/usr/bin/chromium` in this cloud environment. They exercise mobile navigation, county search, mandatory image consent, moderation approval gating, approved news, removal requests and clearing session data on reload. No backend or live credentials are needed.

## Prototype boundaries

- Hash-based pages include a home countdown, county directory and individual pages, news, teams, history, sponsorship, contribution form, safeguarding/privacy, removal requests and demo admin.
- The county list is illustrative, not a confirmed participation list. Countdown targets 1 April as a labelled placeholder; official dates and venue need verification.
- Year selector demonstrates 2027–2029 editions. Future production data should link events, county participation, stories, teams and archives to an event ID.
- Original local SVG artwork stands in for team photos; no real junior information or photographs are used.
- Sample submissions, moderation decisions and removal requests stay in page memory and disappear on reload. Sponsorship form only shows confirmation; no enquiry is transmitted. No file upload, database, analytics, accounts or personal-data collection exists.
- Social links point to Facebook/Instagram homepages pending approved community profile URLs. Sharing prompts warn that this is a private preview.

## Required before any real launch

Implement server-side authenticated adult contributor accounts and manual county representative verification; role-based authorisation; secure consent records with purpose, evidence, date, reviewer and withdrawal state; private storage and metadata removal for uploads; moderation of edits as well as new content; audit logs; a monitored removal route with access restriction and escalation; retention/deletion policies; reviewed privacy notices and appropriate operational safeguarding ownership. The open demo dashboard is not an authentication or security boundary. Do not use this prototype for real safeguarding reports.

Confirm tournament details and participation, replace illustrative content only with cleared material, and obtain the owner's review and approval before publishing or collecting real data.

## Private staging review

See [STAGING.md](STAGING.md) for click-by-click Netlify setup and the review walkthrough. `netlify.toml` registers a server-side Edge Function gate for every path; absent credentials deny access. No staging deployment has been created.
