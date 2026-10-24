# Open your private ICT preview — no coding required

This project uses plain HTML, CSS and JavaScript. Netlify serves the `public` folder without a build. Its Edge Function requests a username and password before serving any page or asset. Missing credentials lock the site rather than expose it. No deployment has been made by Codex.

## Netlify setup (only when you approve hosting the preview)

1. Sign in at https://app.netlify.com/ using GitHub.
2. From your team's Projects page, choose **Add new project** → **Import an existing project** (some accounts call this **Add new site**).
3. Choose **GitHub**, authorise access to `dk-sports/ict-players-community`, and select that repository. Give access to only this repository if prompted.
4. Select the branch `review/ict-private-staging`.
5. Leave **Base directory** and **Build command** blank. Set **Publish directory** to `public`. The repository's `netlify.toml` also supplies that directory and the password gate.
6. Expand **Environment variables** / **Add environment variables** before deployment. Add `STAGING_USERNAME` and `STAGING_PASSWORD`. Choose your own username and a unique long password using ordinary ASCII characters; the username must not contain a colon. Enter them only in Netlify, never in GitHub files or chat. Make the variables available to the deployed site/Edge Functions and every deploy context; if scope choices appear, include **Functions** (or **All scopes**).
7. Clicking **Deploy** / **Deploy project** is your approval to host this access-restricted preview. You can stop before this click. If you deploy before setting variables, the site should display only a locked message (503).
8. Wait for the deployment to finish. In the deploy details confirm **staging-auth** appears under **Edge Functions**. If it is absent or deployment fails, do not use/share the site; stop the deployment and investigate.
9. Click **Open production deploy** / the generated `https://…netlify.app` address. The browser asks for the username and password you chose. “Production” here is Netlify's label for the selected branch, not approval for a public ICT launch.
10. Open the same address in an incognito/private browser window. Cancel the password prompt: you must not see the website. Also try the address followed by `/app.js`: it must require the same password. Share the address and credentials privately only with intended reviewers after these checks.

If you change credentials, trigger **Deploys → Trigger deploy → Deploy project** so Edge Functions receive updated values. Use **Project configuration → Environment variables** for later edits. Browser password prompts may remember credentials for the session; use a private window to test denial. UI labels can vary between Netlify account versions.

Do not disable or delete the Edge Function. A private GitHub repository, an obscure URL, and a noindex directive are not access controls. Review Netlify's current plan/usage terms before deploying. Netlify will host the sample site and receive ordinary request metadata; no real player data should be entered.

## Click-through review

- **Home**: countdown and tournament year selector.
- **The counties**: search, then click a county. Participation is illustrative, not confirmed.
- **Community news**: filter or open a sample story.
- **Meet the teams**: county links and team placeholders. Real photos/player biographies have not been added.
- **Get involved**: choose **Optional player feature** or **Team photograph** to try mandatory simulated consent checks; use fictional content only.
- Submit a sample, then in **Demo admin** complete the review checkbox and approve it. Open **Community news** to see the approved sample. **Demo admin** is also in the footer. It has no separate real admin authentication.
- **Support a county**: sponsorship form demonstration, with no real enquiries sent.
- Footer **Request a removal**: create a fictional request and view it in **Demo admin**.

Everything entered is held in that page's memory and is cleared when you reload. Do not refresh between submitting a sample and reviewing it. Different browsers do not share demo submissions. No accounts, real uploads, consent documents or personal details should be used.
