# Perspectiva — Complete Deployment Guide

This guide takes you from "code on GitHub" to "live website that updates itself
whenever you make changes." **It is written for someone who has never deployed a
website before.** Every step is spelled out. You should not have to guess anything.

Read it top to bottom and do the steps **in order**. Set aside about **60–90 minutes**
for the first deployment. After that, updates are automatic.

> The same file exists in both repositories (`insight-forge-api` and
> `insight-forge-frontend`). They are identical — read whichever one you have open.

---

## Table of contents

1. [How the pieces fit together](#1-how-the-pieces-fit-together)
2. [What it will cost](#2-what-it-will-cost)
3. [Before you start: accounts you need](#3-before-you-start-accounts-you-need)
4. [The order we will do things (and why)](#4-the-order-we-will-do-things-and-why)
5. [Step A — Database on Neon](#step-a--database-on-neon)
6. [Step B — Rate limiting on Upstash](#step-b--rate-limiting-on-upstash)
7. [Step C — Email on Brevo](#step-c--email-on-brevo)
8. [Step D — Make your secret key](#step-d--make-your-secret-key)
9. [Step E — Backend on Railway](#step-e--backend-on-railway)
10. [Step F — Frontend on Vercel](#step-f--frontend-on-vercel)
11. [Step G — Connect the two (the most important step)](#step-g--connect-the-two-the-most-important-step)
12. [Step H — Test that everything works](#step-h--test-that-everything-works)
13. [Step I — Automatic updates (CI/CD)](#step-i--automatic-updates-cicd)
14. [Optional — Use your own domain name](#optional--use-your-own-domain-name)
15. [Optional — "Sign in with Google"](#optional--sign-in-with-google)
16. [Troubleshooting](#troubleshooting)
17. [Appendix — Every setting, in one place](#appendix--every-setting-in-one-place)

---

## 1. How the pieces fit together

Your app is made of five online services. Here is the plain-English version of
what each one does:

| Service | What it is | What it does for you |
|---|---|---|
| **Vercel** | Website host | Shows the actual website to visitors (the part they click on). |
| **Railway** | App server host | Runs the "brain" (the API) that handles logins, surveys, points, etc. |
| **Neon** | Database | The permanent memory — stores users, surveys, answers, points. |
| **Upstash** | Rate limiter | Stops people from hammering the site / abusing it. |
| **Brevo** | Email sender | Sends "verify your email" and "reset your password" emails. |

How a visitor's request flows:

```
   Visitor's browser
        │
        ▼
   Vercel  (the website / frontend)
        │   asks for data
        ▼
   Railway (the API / backend)  ──► Neon     (reads & saves data)
        │                        ──► Upstash  (checks rate limits)
        │                        ──► Brevo    (sends emails)
        ▼
   Sends the answer back to the browser
```

You will set up the bottom three first (Neon, Upstash, Brevo), then Railway,
then Vercel, then connect them together.

---

## 2. What it will cost

- **Neon** — Free plan is enough to launch.
- **Upstash** — Free plan is enough to launch.
- **Brevo** — Free plan sends 300 emails/day, enough to launch.
- **Vercel** — Free "Hobby" plan is enough to launch.
- **Railway** — **This is the one paid piece.** Railway gives a small free trial
  credit, then you need the **Hobby plan, about $5/month** (which includes $5 of
  usage). Budget ~$5/month to keep the backend online.

So: roughly **$5/month** total to start. You can add paid plans later if traffic grows.

---

## 3. Before you start: accounts you need

You will sign in to Vercel and Railway **using your GitHub account**, so set up
GitHub first.

1. **GitHub** — Your code already lives here in two repositories:
   - `Perspectivasurveys/insight-forge-frontend` (the website)
   - `Perspectivasurveys/insight-forge-api` (the backend)

   Make sure you can log in to GitHub and open both repositories in your browser.
   If they belong to the **Perspectivasurveys** organization, make sure your
   GitHub user is a member with at least "Write" access. If you are not the owner,
   ask whoever owns the organization to add you, because later you will need to
   let Vercel and Railway access these repositories.

2. Create these accounts now (you can use "Sign up with GitHub" or "with Google"
   on each — pick one and be consistent):
   - Neon — https://neon.tech
   - Upstash — https://upstash.com
   - Brevo — https://www.brevo.com
   - Railway — https://railway.com  (sign up **with GitHub**)
   - Vercel — https://vercel.com  (sign up **with GitHub**)

3. **A note on terms used below**
   - *"Environment variable"* (or *"variable"*) = a setting you give a service,
     written as `NAME=value`. Think of it as a labelled box you drop a value into.
   - *"Deploy"* = the service builds and publishes your app.
   - *"URL"* = a web address like `https://something.vercel.app`.
   - *No trailing slash* = the address must **not** end in `/`.
     ✅ `https://app.vercel.app`  ❌ `https://app.vercel.app/`

> 💡 **Keep a notepad open.** As you go, you will collect 5 important values.
> Paste each one into your notepad the moment you get it:
> 1. `DATABASE_URL` (from Neon)
> 2. `REDIS_URL` (from Upstash)
> 3. Brevo SMTP login + key
> 4. `JWT_SECRET` (you generate this)
> 5. Your Railway backend URL, and later your Vercel frontend URL

---

## 4. The order we will do things (and why)

There is a "chicken and egg" problem: the **backend** needs to know the
**frontend's** address (for security), and the **frontend** needs to know the
**backend's** address (to talk to it). Neither exists yet.

We solve it like this:

1. Set up Neon, Upstash, Brevo (these don't depend on anything).
2. Deploy the **backend** to Railway and get its address.
3. Deploy the **frontend** to Vercel, telling it the backend's address.
4. Go **back** to Railway and tell the backend the frontend's address.
5. Test.

Just follow the steps in order and it works out cleanly.

---

## Step A — Database on Neon

This creates the permanent storage for your app.

1. Go to https://neon.tech and sign in.
2. Click **New Project** (or **Create project**).
3. Fill in:
   - **Project name**: `perspectiva` (any name is fine).
   - **Postgres version**: leave the default.
   - **Region**: pick the one **closest to where your users are** (e.g. a US or
     EU region). Remember roughly which region you chose — pick the same area for
     Railway later so they're fast together.
4. Click **Create project**.
5. Neon shows you a **Connection string** box. This is the most important value.
   - You will see a toggle or dropdown labelled **"Pooled connection"** (or
     "Connection pooling"). **Turn it OFF** / choose the **direct** connection.
     (Our backend manages its own pool, so the direct connection is the simplest
     and most reliable choice here.)
   - Make sure the dropdown shows the **`psql` / URL** form, not "parameters."
   - The string looks like:
     ```
     postgresql://your_user:your_password@ep-cool-name-123.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
6. Click the **copy** icon and paste it into your notepad, labelled `DATABASE_URL`.

> ✅ You do **not** need to edit this string. The backend automatically converts
> it to the right format and handles the secure (SSL) connection. Paste it exactly
> as Neon gives it to you.

> ℹ️ You do **not** need to create any tables. The first time the backend starts,
> it builds all the tables automatically.

**You now have value #1: `DATABASE_URL`.**

---

## Step B — Rate limiting on Upstash

This is a small, fast database used only to count requests and block abuse.

1. Go to https://upstash.com and sign in.
2. In the console, make sure you are on the **Redis** product (not "Vector" or
   "QStash"). Click **Create Database**.
3. Fill in:
   - **Name**: `perspectiva-ratelimit` (any name).
   - **Region** (Primary Region): pick one **close to your Railway region** from
     Step E (e.g. same continent as your Neon region).
   - Leave other options at their defaults. The **Free** plan is fine.
4. Click **Create**.
5. On the database page, find the connection details. Look for the field that
   gives a URL starting with **`rediss://`** — note the **two s's** (that means
   it's the secure/TLS version, which we need).
   - It is often shown under a tab/section like **"Connect"**, or as
     **"Endpoint"** plus a **"Password"**. If you only see host + port + password,
     the full URL is:
     ```
     rediss://default:YOUR_PASSWORD@your-host.upstash.io:6379
     ```
   - Many Upstash pages have a **copy** button for the full `rediss://...` URL —
     use that if available.
6. Paste it into your notepad, labelled `REDIS_URL`.

> ⚠️ Make sure it starts with `rediss://` (two s's), **not** `redis://` (one s)
> and **not** `https://`. The one-s and https versions will not work with this app.

**You now have value #2: `REDIS_URL`.**

---

## Step C — Email on Brevo

This lets your app send "verify your email" and "reset password" messages.

### C1. Verify a sender address

Brevo will only send email "from" an address you've proven you own.

1. Go to https://www.brevo.com and sign in.
2. In the left menu, go to **Senders, Domains & Dedicated IPs** (sometimes just
   **Senders**). It may be under **Settings**.
3. Click **Add a Sender**. Enter a name (e.g. `Perspectiva`) and an email address
   you control (e.g. `noreply@yourdomain.com`, or for now a normal email like
   `youremail@gmail.com` works too).
4. Brevo sends a confirmation email to that address. Open it and click the
   confirmation link. The sender now shows as **verified**.
   - Remember this exact address — it becomes `SMTP_FROM` later.

> 📌 If you own a domain, verifying the **whole domain** (also on that page)
> gives better email deliverability. That's optional; a single verified sender
> is enough to start.

### C2. Get your SMTP login and key

1. In the left menu, open **SMTP & API** (sometimes under your account name /
   **Settings**).
2. Click the **SMTP** tab.
3. You will see:
   - A **Login** (an email address, e.g. `9a8b7c@smtp-brevo.com` or your account
     email) — this becomes `SMTP_USER`.
   - An **SMTP key / master password**. If none is shown, click
     **Generate a new SMTP key**. Copy it immediately — this becomes
     `SMTP_PASSWORD`. (It's a long string; you usually can't see it again later,
     so save it in your notepad now.)
   - The server is `smtp-relay.brevo.com` and the port is `587`.
4. In your notepad, write down:
   - `SMTP_HOST` = `smtp-relay.brevo.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = the Login from above
   - `SMTP_PASSWORD` = the SMTP key
   - `SMTP_FROM` = the verified sender address from step C1

**You now have value #3: your Brevo email settings.**

---

## Step D — Make your secret key

The backend needs a long, random secret to securely sign login sessions
(`JWT_SECRET`). Make a fresh one — **do not reuse a password you use elsewhere.**

**On Windows**, open **PowerShell** (press the Start button, type `PowerShell`,
press Enter) and paste this, then press Enter:

```powershell
-join (1..64 | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) })
```

It prints a 64-character random string like `3f9a...e1`. Copy it.

**On Mac/Linux**, open Terminal and run:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

Paste the result into your notepad, labelled `JWT_SECRET`.

> ⚠️ It must be at least 32 characters. The commands above give plenty. Keep it
> secret — anyone with this value could forge logins.

**You now have value #4: `JWT_SECRET`.**

---

## Step E — Backend on Railway

Now we put the API online. It will read from Neon, Upstash, and Brevo.

### E1. Create the project from GitHub

1. Go to https://railway.com and sign in **with GitHub**.
2. Click **New Project**.
3. Choose **Deploy from GitHub repo**.
4. The first time, Railway asks to connect to GitHub. Click **Configure GitHub App**
   / **Install**, choose the **Perspectivasurveys** organization, and either grant
   access to **All repositories** or specifically to **insight-forge-api**. Approve.
   - If you're not an admin of the organization, GitHub may say a request was
     sent to an owner to approve. Have them approve it, then come back.
5. Back in Railway, pick the **`insight-forge-api`** repository.
6. Railway creates a service and starts building. It will **automatically detect
   the `Dockerfile`** in the repo — that's what we want. (A `railway.json` file in
   the repo already tells Railway to use the Dockerfile and to health-check the
   `/health` path. You don't need to configure the build manually.)
7. The **first build will likely fail or the app will crash-loop** — that's
   expected, because we haven't added the settings yet. Don't worry, continue.

### E2. Add the backend's environment variables

1. Click your service (the box named `insight-forge-api`).
2. Open the **Variables** tab.
3. Add each variable below. The fastest way: look for a **"Raw Editor"** /
   **"Add from .env"** option and paste the whole block at once. Otherwise add
   them one at a time with **New Variable**.

   Paste this block, then **replace the right-hand sides** with your real values
   from your notepad. (Leave `GOOGLE_CLIENT_ID` blank unless you set up Google
   sign-in in the optional section.)

   ```
   DATABASE_URL=<<paste your Neon DATABASE_URL>>
   REDIS_URL=<<paste your Upstash rediss:// URL>>
   JWT_SECRET=<<paste your generated secret>>
   APP_ENV=production
   TRUSTED_PROXIES=*
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=<<your Brevo login>>
   SMTP_PASSWORD=<<your Brevo SMTP key>>
   SMTP_FROM=<<your verified Brevo sender>>
   GOOGLE_CLIENT_ID=
   CORS_ORIGINS=https://placeholder.vercel.app
   FRONTEND_URL=https://placeholder.vercel.app
   ```

   - Set `CORS_ORIGINS` and `FRONTEND_URL` to the **placeholder** values shown for
     now. We come back and fix these in **Step G** once the frontend exists.
   - `TRUSTED_PROXIES=*` is correct and important on Railway — without it, *all*
     visitors would share one rate-limit bucket and could get blocked together.

4. Save the variables. Railway will redeploy automatically.

### E3. Give the backend a public address

1. In the service, open the **Settings** tab and find the **Networking** (or
   **Domains**) section.
2. Under **Public Networking**, click **Generate Domain**.
   - If it asks for a **port**, enter **`8000`** (that's the port the app listens
     on inside the container).
3. Railway gives you an address like:
   ```
   https://insight-forge-api-production-xxxx.up.railway.app
   ```
4. Copy it into your notepad, labelled **Backend URL**.

### E4. Confirm the backend is alive

1. Wait for the deployment to show **Active / success** (watch the **Deployments**
   tab; the build logs should end with the server starting up).
2. In your browser, visit your **Backend URL** with `/health` on the end, e.g.:
   ```
   https://insight-forge-api-production-xxxx.up.railway.app/health
   ```
3. You should see:
   ```json
   {"status":"ok"}
   ```
   - `{"status":"ok"}` means the backend is running **and** talking to Neon. 🎉
   - If you see `degraded` / database error, your `DATABASE_URL` is wrong — go
     back to Step A and re-copy it. (See [Troubleshooting](#troubleshooting).)

**You now have value #5: your Backend URL.**

---

## Step F — Frontend on Vercel

Now we put the website online and point it at the backend.

### F1. Import the project

1. Go to https://vercel.com and sign in **with GitHub**.
2. Click **Add New…** → **Project**.
3. The first time, Vercel asks to access GitHub. Click **Install** / **Configure**,
   choose **Perspectivasurveys**, and grant access to **All repositories** or to
   **insight-forge-frontend**. Approve (an org owner may need to approve, like with
   Railway).
4. Find **`insight-forge-frontend`** in the list and click **Import**.

### F2. Configure the build (mostly automatic)

Vercel should auto-detect a **Vite** app. Confirm/Set:

- **Framework Preset**: **Vite**
- **Root Directory**: `./` (the repository root — leave as is)
- **Build Command**: `npm run build` (default — leave as is)
- **Output Directory**: `dist` (default — leave as is)
- **Install Command**: leave default (`npm install`)

### F3. Add the frontend's environment variable

Still on the import screen, expand **Environment Variables** and add:

| Name | Value |
|---|---|
| `VITE_API_URL` | your **Backend URL** from Step E3 (no trailing slash) |

- Example value: `https://insight-forge-api-production-xxxx.up.railway.app`
- (If you set up Google sign-in later, also add `VITE_GOOGLE_CLIENT_ID`.)

> ⚠️ The name must be exactly `VITE_API_URL`. The website is built to refuse to
> start without it, so don't skip this.

### F4. Deploy

1. Click **Deploy**. Wait 1–3 minutes for it to build.
2. Vercel gives you an address like:
   ```
   https://insight-forge-frontend.vercel.app
   ```
   (Yours may have extra characters.) Copy it into your notepad, labelled
   **Frontend URL**.
3. Open that URL — the website appears. It may not be able to log in yet; that's
   because the backend doesn't trust this address **yet**. We fix that next.

---

## Step G — Connect the two (the most important step)

Right now the backend has placeholder addresses. We replace them with the real
Vercel address so logins and emails work.

1. Go back to **Railway** → your `insight-forge-api` service → **Variables** tab.
2. Change these two variables to your real **Frontend URL** (no trailing slash):
   - `CORS_ORIGINS` = `https://insight-forge-frontend.vercel.app`
   - `FRONTEND_URL` = `https://insight-forge-frontend.vercel.app`
   - Use **your** actual Vercel address, not the example.
3. Save. Railway redeploys automatically (wait for **Active**).

> 💡 **About `CORS_ORIGINS`:** this is a security allow-list of which websites are
> allowed to talk to your backend. If a visitor can load your site but **can't log
> in** (or sees "CSRF check failed" / network errors in the browser), it's almost
> always because this value doesn't *exactly* match your real frontend address.
> If you later add a custom domain, **add it here too**, comma-separated:
> ```
> CORS_ORIGINS=https://insight-forge-frontend.vercel.app,https://www.yourdomain.com
> ```
> No spaces around the comma, no trailing slashes.

That's it — the system is now fully wired together.

---

## Step H — Test that everything works

Do these checks in order. If one fails, jump to [Troubleshooting](#troubleshooting).

1. **Backend health** — visit `https://YOUR-BACKEND-URL/health` → expect
   `{"status":"ok"}`.
2. **Website loads** — open your **Frontend URL**. The homepage appears.
3. **Sign up** — create a test account on the site.
   - You should be able to register and land in the app.
4. **Verification email** — check the inbox of the email you registered with.
   You should receive a "Verify your Perspectiva email" message from your Brevo
   sender. Click the link; it should confirm successfully.
   - If the email doesn't arrive: check spam, and see the Brevo notes in
     Troubleshooting.
5. **Log out and back in** — confirms login + sessions (cookies) work across the
   two domains.
6. **Rate limiting** — (optional) try entering a wrong password ~6 times quickly;
   you should get blocked with a "too many requests" style message. That proves
   Upstash is connected.

If all six pass, **you are live.** 🚀

---

## Step I — Automatic updates (CI/CD)

This is already on by default — you don't have to build anything. Here's how it
works and how to use it.

**What "CI/CD" means here:** every time new code is saved to the **`main` branch**
of a repository on GitHub, the matching service **rebuilds and republishes itself
automatically**:

- Push to `insight-forge-frontend` → **Vercel** rebuilds the website.
- Push to `insight-forge-api` → **Railway** rebuilds the backend (and runs any
  new database migrations automatically on startup).

You do nothing in Vercel or Railway after the initial setup — they watch GitHub.

### How to make a change and have it go live

You have three ways, from easiest to most technical:

**Option 1 — Edit directly on GitHub (easiest, no tools):**
1. Open the file on github.com (e.g. in `insight-forge-frontend`).
2. Click the **pencil** ✏️ icon to edit.
3. Make your change, scroll down, and click **Commit changes** (commit straight
   to `main`).
4. Within a minute or two, Vercel/Railway start a new deployment automatically.
   Watch progress in the Vercel/Railway dashboard.

**Option 2 — GitHub Desktop (good for non-coders making many changes):**
1. Install **GitHub Desktop** (https://desktop.github.com) and sign in.
2. **Clone** the repository to your computer.
3. Edit files, then in GitHub Desktop write a short summary and click
   **Commit to main**, then **Push origin**.
4. The deployment starts automatically.

**Option 3 — Command line (for developers):**
```bash
git add .
git commit -m "Describe your change"
git push origin main
```

### Good habit: preview before going live (optional)

Both platforms support **branches**. If you push to a branch *other than* `main`
(e.g. `new-feature`):
- **Vercel** automatically builds a **Preview URL** so you can see changes before
  they hit the real site. Merge the branch into `main` (via a GitHub "Pull
  Request") when you're happy, and it goes live.
- This lets you avoid breaking the live site. It's optional but recommended once
  you're comfortable.

### Watching a deployment

- **Vercel**: Dashboard → your project → **Deployments**. Green = live. Click a
  deployment to see logs if it fails.
- **Railway**: Dashboard → your service → **Deployments**. Click the latest to see
  build + run logs.

---

## Optional — Use your own domain name

By default you get `something.vercel.app` and `something.up.railway.app`. To use a
custom domain like `www.perspectiva.com`:

### Point the website (frontend) at your domain

1. Buy a domain (Namecheap, GoDaddy, Cloudflare, etc.) if you don't have one.
2. In **Vercel** → your project → **Settings** → **Domains** → **Add**.
3. Type your domain (e.g. `www.perspectiva.com`) and follow Vercel's instructions.
   Vercel tells you exactly which **DNS records** to add at your domain registrar
   (usually a `CNAME` record, or an `A` record for the bare domain).
4. Add those records at your registrar and wait (minutes to a few hours).
   Vercel shows a green check when it's verified, and sets up HTTPS for free.

### Tell the backend about the new domain

Because you changed the website's address, update the backend's allow-list:

1. **Railway** → `insight-forge-api` → **Variables**:
   - Update `CORS_ORIGINS` to include the new domain (comma-separated, keep the
     `.vercel.app` one too if you still use it):
     ```
     CORS_ORIGINS=https://www.perspectiva.com,https://insight-forge-frontend.vercel.app
     ```
   - Update `FRONTEND_URL` to your **primary** domain
     (e.g. `https://www.perspectiva.com`) so email links use it.
2. Save (Railway redeploys).

### (Optional) Custom domain for the backend too

You can give the API a domain like `api.perspectiva.com` in **Railway** →
**Settings** → **Networking** → **Custom Domain**, then add the DNS record Railway
shows. If you do this, also update **`VITE_API_URL`** in **Vercel** to the new API
address and redeploy the frontend.

---

## Optional — "Sign in with Google"

Skip this unless you want the Google login button to work.

1. Go to https://console.cloud.google.com → create a project.
2. **APIs & Services** → **OAuth consent screen** → set it up (External), add your
   app name and your email.
3. **APIs & Services** → **Credentials** → **Create Credentials** →
   **OAuth client ID** → Application type **Web application**.
4. Under **Authorized JavaScript origins**, add your frontend address(es):
   - `https://insight-forge-frontend.vercel.app` (and your custom domain if any)
5. Create it. Copy the **Client ID** (looks like `xxxx.apps.googleusercontent.com`).
6. Add it in **two** places, using the **same** value:
   - **Railway** variable `GOOGLE_CLIENT_ID = xxxx.apps.googleusercontent.com`
   - **Vercel** variable `VITE_GOOGLE_CLIENT_ID = xxxx.apps.googleusercontent.com`
7. Redeploy the frontend in Vercel (Deployments → ⋯ → **Redeploy**) so it picks up
   the new variable. Railway redeploys automatically when you save its variable.

---

## Troubleshooting

**The website loads but I can't log in / sign up.**
- 99% of the time this is `CORS_ORIGINS` or `FRONTEND_URL` on Railway not exactly
  matching your real frontend address. Re-check Step G. No trailing slash, correct
  `https://`, exact spelling. Save and wait for the redeploy.
- Open the browser's developer console (press **F12** → **Console** tab) and look
  for red errors mentioning "CORS", "blocked", or "CSRF" — these confirm the cause.

**`/health` shows `degraded` / "database unreachable".**
- Your `DATABASE_URL` is wrong or the Neon project is paused. Re-copy the **direct**
  connection string from Neon (Step A). Paste it into Railway exactly. Save.
- Make sure you didn't accidentally add spaces or cut off the end of the string.

**Railway deployment keeps crashing / restarting.**
- Open Railway → service → **Deployments** → click the latest → read the logs.
- A message like `JWT_SECRET must be at least 32 characters` means your
  `JWT_SECRET` is missing or too short — fix it in Variables (Step D).
- A database connection error means `DATABASE_URL` is wrong (see above).

**Emails aren't arriving.**
- Check the recipient's **spam** folder first.
- Confirm `SMTP_FROM` is an address you **verified** in Brevo (Step C1). Brevo
  refuses to send "from" unverified addresses.
- Confirm `SMTP_PASSWORD` is the **SMTP key**, not your Brevo account password,
  and `SMTP_USER` is the **Login** shown on Brevo's SMTP page.
- In Brevo, check **Transactional → Logs / Statistics** to see if the message was
  accepted or rejected and why.

**"Too many requests" / users get blocked unexpectedly.**
- Make sure `TRUSTED_PROXIES=*` is set on Railway (Step E2). Without it, everyone
  shares one rate-limit bucket.
- Check your Upstash `REDIS_URL` starts with `rediss://`.

**I changed code but the site didn't update.**
- Make sure you committed to the **`main`** branch.
- Check the Vercel/Railway **Deployments** tab — there should be a new deployment.
  If it failed, click it to read the error in the logs.

**Vercel build fails.**
- Open the failed deployment's logs. If it mentions a missing dependency, make sure
  `package-lock.json` is committed (it is, in this repo). Re-deploy.

---

## Appendix — Every setting, in one place

### Railway (backend: `insight-forge-api`) — Variables

| Variable | Where it comes from | Example |
|---|---|---|
| `DATABASE_URL` | Neon (Step A), direct connection | `postgresql://user:pass@ep-x.aws.neon.tech/neondb?sslmode=require` |
| `REDIS_URL` | Upstash (Step B), the `rediss://` URL | `rediss://default:pass@x.upstash.io:6379` |
| `JWT_SECRET` | You generate it (Step D) | a 64-char random string |
| `APP_ENV` | Fixed value | `production` |
| `TRUSTED_PROXIES` | Fixed value for Railway | `*` |
| `SMTP_HOST` | Brevo | `smtp-relay.brevo.com` |
| `SMTP_PORT` | Brevo | `587` |
| `SMTP_USER` | Brevo SMTP page (Login) | `xxxxx@smtp-brevo.com` |
| `SMTP_PASSWORD` | Brevo SMTP key | a long key |
| `SMTP_FROM` | Your verified Brevo sender | `noreply@yourdomain.com` |
| `CORS_ORIGINS` | Your Vercel/custom address(es) | `https://app.vercel.app` |
| `FRONTEND_URL` | Your primary frontend address | `https://app.vercel.app` |
| `GOOGLE_CLIENT_ID` | Optional (Google sign-in) | blank, or `xxxx.apps.googleusercontent.com` |

> Optional/advanced (leave unset to use sensible defaults): `JWT_EXPIRE_MINUTES`,
> `REFRESH_TOKEN_EXPIRE_DAYS`, `DB_POOL_SIZE`, `DB_MAX_OVERFLOW`,
> `DB_POOL_TIMEOUT`, `DB_POOL_RECYCLE`. See `.env.example`.

### Vercel (frontend: `insight-forge-frontend`) — Environment Variables

| Variable | Where it comes from | Example |
|---|---|---|
| `VITE_API_URL` | Your Railway backend URL (Step E3) | `https://insight-forge-api-production-xxxx.up.railway.app` |
| `VITE_GOOGLE_CLIENT_ID` | Optional (Google sign-in) | blank, or `xxxx.apps.googleusercontent.com` |

### The five values you collect (your notepad)

1. `DATABASE_URL` — from Neon
2. `REDIS_URL` — from Upstash
3. Brevo: `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`
4. `JWT_SECRET` — generated
5. Backend URL (from Railway) → goes into Vercel's `VITE_API_URL`;
   Frontend URL (from Vercel) → goes into Railway's `CORS_ORIGINS` & `FRONTEND_URL`

---

*Done. Once the six checks in Step H pass, every future `git push` to `main`
updates the live site automatically.*
