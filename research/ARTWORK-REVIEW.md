# County artwork — private review, 12 November 2026

## Review result

29 genuine current association assets are available in the encrypted offline preview. The public website remains unchanged in its rights boundary: all 41 county images are placeholders. The review branch adds scoped image support, consistent logo areas and matching profile artwork. No merge, deployment, Netlify configuration or existing password change is part of this work.

The owner confirmed permission for all county associations for this private preview. This is owner attestation, not an independently inspected written licence. Public reproduction rights remain unestablished. The JSON and CSV registers record original source URLs, checked dates, source copyright statements, identity limitations and contact pages. Public availability is not treated as a licence. No association has been contacted by this work.

## Outstanding identities

Berkshire, Cornwall, Derbyshire, Devon, Herefordshire, Isle of Wight, Lincolnshire, Oxfordshire, Staffordshire, Warwickshire, Worcestershire and Yorkshire retain initials. Official pages and available public media indexes were checked. Buckinghamshire's current badminton-specific swan was the additional verified asset. Cornwall's assistance-scheme marks, Staffordshire's old wordmark, photographic banners and kit/sponsor imagery were excluded pending current identity confirmation. Some requests returned 403; the register records these limits. Ask each unresolved association for its current original artwork, and all associations for documented public-use scope and any required credit.

## Open the preview without code

1. Download `ICT-County-Shields-Private-Preview.zip` from this review branch.
2. Extract the ZIP (on Windows choose Extract All).
3. Open `ICT-County-Shields-Private-Preview.html` in a current Chrome, Edge, Firefox or Safari browser.
4. Paste the unlock phrase supplied separately in the private review conversation and choose Open preview.
5. Search counties, click cards and inspect profiles. Use Lock preview before sharing your screen or leaving the computer.

The preview needs no server or Netlify login. It contains no real player data and sends no form submissions. Official website links open external sites only when clicked. Keep the unlock phrase private; do not put it in GitHub, the ZIP, a public message or an issue. Do not distribute decrypted content publicly. Existing older logo-free preview downloads remain available separately.

## Build and verify (maintainers)

Use `scripts/build-private-artwork-preview.cjs` with an external private artwork cache, an external phrase file and an output path. The builder checks cached originals against register hashes and embeds authorised assets only in the encrypted payload. Keep the cache and phrase outside the repository. Use `scripts/verify-private-artwork-preview.cjs` with the generated HTML and phrase file to check unlocking, denial with a wrong phrase, 29 image loads, aspect ratios, profiles, mobile widths, offline operation and locking. `npm test` checks the ordinary website and staging gate.

The encrypted payload uses AES-256-GCM, a random salt/IV and PBKDF2-SHA256 with 600,000 iterations. No phrase is stored in the artifact. This protects the downloadable review file; it does not configure or replace Netlify access controls.
