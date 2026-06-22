# Perspectiva — Full Stack Setup Guide

Survey platform with gamification. This guide covers setting up both the backend and frontend from scratch.
Perspectiva's fronted has been copied to a personal account for free hosting on vercel

---

## Repository Structure

```
perspectiva/
├── backend/
│   └── insight-forge-api/          # FastAPI backend
└── Frontend/
    └── insight-forge-game-Vinayak/
        └── insight-forge-game-Vinayak/   # React frontend
```

---

## Prerequisites

- **Python 3.11+** — [python.org](https://www.python.org/downloads/)
- **Node.js 18+** + **npm** — [nodejs.org](https://nodejs.org/)
- **PostgreSQL 18** (local) — [postgresql.org](https://www.postgresql.org/download/)
- **pgAdmin 4** (optional) — comes with PostgreSQL installer
- **Git**

---

## Step 1 — Set Up PostgreSQL

Open **pgAdmin** or **psql** and run:

```sql
CREATE USER insight WITH PASSWORD 'insight_secret';
CREATE DATABASE insight_forge OWNER insight;
```

---

## Step 2 — Backend Setup

```bash
cd backend/insight-forge-api

python -m venv .venv

# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Mac/Linux:
source .venv/bin/activate

pip install -r requirements.txt
pip install requests
pip install bcrypt==4.0.1
```

### Configure environment

```bash
cp .env.example .env
```

Default `.env` works for local development — no changes needed.

### Run database migrations

```bash
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

> If you set up the project after saved surveys and ratings were added, one migration covers everything.
> If you already had an earlier migration, run a second one:
>
> ```bash
> alembic revision --autogenerate -m "add saved_surveys and survey_ratings"
> alembic upgrade head
> ```

### Start the backend

```bash
uvicorn app.main:app --reload
```

Running at: **http://localhost:8000**
Health check: `http://localhost:8000/health` → `{"status": "ok"}`
API docs: **http://localhost:8000/docs**

---

## Step 3 — Frontend Setup

Open a **new terminal** (keep the backend running):

```bash
cd Frontend/insight-forge-game-Vinayak/insight-forge-game-Vinayak

npm install --legacy-peer-deps

npm run dev
```

Running at: **http://localhost:5173**

---

## Step 4 — Verify Everything Works

1. Open `http://localhost:5173`
2. **Sign up** → you start with 10 points
3. **Complete the Categorizer** (`/categorizer`) → saves your profession and category to your profile
4. **Create Survey** → fill in title + questions → **Publish** (costs 2 points) → lands on confirmation page
5. **For You** → your survey appears → click **Take Survey** → complete → **rate the survey** (1–5 stars) → earn 10 points
6. **Profile** → see real name, points, created surveys, completed surveys, transaction history, real avg rating
7. **Communities** → 12 communities from backend → click one → **Join Community** → see real leaderboard
8. **Pricing** → click **Buy Bundle** → coins added to your balance
9. **Edit Profile** → update name, institution, category

---

## Full API Reference

| Method | Endpoint                        | Auth | Description                                   |
| ------ | ------------------------------- | ---- | --------------------------------------------- |
| POST   | `/auth/signup`                  | No   | Register (gets 10 points)                     |
| POST   | `/auth/signin`                  | No   | Sign in                                       |
| POST   | `/auth/google`                  | No   | Sign in with Google ID token                  |
| GET    | `/users/me`                     | Yes  | Get profile (includes real avg_rating)        |
| PUT    | `/users/me`                     | Yes  | Update profile                                |
| GET    | `/users/me/transactions`        | Yes  | Points/coins history                          |
| GET    | `/users/me/saved-surveys`       | Yes  | Saved surveys list                            |
| GET    | `/users/me/completed-surveys`   | Yes  | Surveys you have submitted                    |
| GET    | `/communities`                  | No   | List all 12 communities                       |
| GET    | `/communities/{id}`             | No   | Community detail + is_member flag             |
| POST   | `/communities/{id}/join`        | Yes  | Join a community                              |
| GET    | `/communities/{id}/leaderboard` | No   | Top 10 members by responses in that community |
| GET    | `/surveys/published`            | No   | Published surveys feed                        |
| GET    | `/surveys/me`                   | Yes  | Your created surveys                          |
| POST   | `/surveys`                      | Yes  | Create survey (saves as draft)                |
| POST   | `/surveys/{id}/publish`         | Yes  | Publish (costs 2 points)                      |
| POST   | `/surveys/{id}/submit`          | Yes  | Submit response (earns 10 points)             |
| POST   | `/surveys/{id}/rate`            | Yes  | Rate a survey 1–5 stars (after submitting)    |
| POST   | `/surveys/{id}/save`            | Yes  | Save a survey to your list                    |
| DELETE | `/surveys/{id}/save`            | Yes  | Unsave a survey                               |
| GET    | `/surveys/{id}/analytics`       | Yes  | Full analytics (creator only)                 |
| POST   | `/payments/coins/purchase`      | Yes  | Buy coins (mock — no real payment)            |
| GET    | `/health`                       | No   | Health check                                  |

---

## Gamification Rules

| Action            | Effect                                   |
| ----------------- | ---------------------------------------- |
| Sign up           | +10 points                               |
| Publish a survey  | −2 points                                |
| Complete a survey | +10 points                               |
| Rate a survey     | no points, improves creator's avg rating |
| Buy a coin bundle | +coins (mock purchase)                   |

---

## Pages & Routes

| Route                    | Page                                  | Auth | Status                     |
| ------------------------ | ------------------------------------- | ---- | -------------------------- |
| `/`                      | Landing page                          | No   | Working                    |
| `/sign-in`               | Sign in                               | No   | Working                    |
| `/sign-up`               | Sign up                               | No   | Working                    |
| `/categorizer`           | User profiling questionnaire          | No   | Working — saves to backend |
| `/communities`           | Featured communities                  | No   | Working                    |
| `/communities/all`       | All communities                       | No   | Working                    |
| `/communities/:id`       | Community detail + Join + Leaderboard | No   | Working                    |
| `/pricing`               | Pricing + Buy coins                   | No   | Working                    |
| `/for-you`               | Survey feed + Save                    | Yes  | Working                    |
| `/survey`                | Take + submit + rate a survey         | Yes  | Working                    |
| `/survey-published`      | Post-publish confirmation             | Yes  | Working                    |
| `/create-survey`         | Build and publish a survey            | Yes  | Working                    |
| `/profile`               | Profile, wallet, all survey tabs      | Yes  | Working                    |
| `/edit-profile`          | Edit profile fields                   | Yes  | Working                    |
| `/surveys/:id/analytics` | Survey analytics (creator only)       | Yes  | Working                    |
| `/converter`             | Points ↔ Coins calculator             | Yes  | Working                    |

---

## Troubleshooting

| Problem                                            | Fix                                                                                     |
| -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `ModuleNotFoundError: No module named 'requests'`  | `pip install requests` inside the venv                                                  |
| `bcrypt` / passlib error on signup                 | `pip install bcrypt==4.0.1`                                                             |
| `npm install` fails with peer dependency error     | Use `npm install --legacy-peer-deps`                                                    |
| `vite is not recognized`                           | Run `npm install` before `npm run dev`                                                  |
| Frontend shows "Failed to fetch"                   | Make sure backend is running on port 8000                                               |
| Can't publish (not enough points)                  | Run `UPDATE users SET points_balance = 10 WHERE username = 'your_username';` in pgAdmin |
| `alembic upgrade head` does nothing                | Run `alembic revision --autogenerate -m "initial"` first                                |
| New tables missing (saved_surveys, survey_ratings) | Run `alembic revision --autogenerate -m "add tables"` then `alembic upgrade head`       |

---

## Tech Stack

| Layer      | Technology                                                                         |
| ---------- | ---------------------------------------------------------------------------------- |
| Backend    | Python 3.13, FastAPI 0.115, SQLAlchemy 2.0 (async), asyncpg, PostgreSQL 18         |
| Auth       | JWT (7-day expiry), bcrypt, Google OAuth (backend ready, frontend needs Client ID) |
| Migrations | Alembic                                                                            |
| Frontend   | React 18, TypeScript, Vite                                                         |
| Styling    | Tailwind CSS, shadcn/ui                                                            |
| State      | TanStack Query, React Context                                                      |
| Forms      | React Hook Form + Zod                                                              |
| Charts     | Recharts                                                                           |

---

## Still Needs Work

This section lists every remaining gap — what it is, which files to touch in the backend and frontend, and what exactly needs to be built.

---

### 1. Google Sign In

**What:** The Google button is visible on Sign In and Sign Up pages. The backend endpoint (`POST /auth/google`) is fully implemented. The frontend loads Google's Identity Services script and posts the credential. It will not work until a real Google Client ID is configured.

**To activate:**

1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create OAuth 2.0 Client ID (Web application)
2. Add `http://localhost:5173` as an authorized JavaScript origin
3. Create `Frontend/insight-forge-game-Vinayak/insight-forge-game-Vinayak/.env.local`:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```
4. Restart `npm run dev`

**Backend files:** `app/auth/service.py` → `sign_in_with_google()` — already complete
**Frontend files:** `src/features/auth/components/GoogleSignInButton.tsx` — already complete, just needs the env var

---

### 2. Real Payment Processing (Coins)

**What:** The "Buy Bundle" buttons on the Pricing page call `POST /payments/coins/purchase` and immediately grant coins with no actual payment. This is fine for development but must be replaced before any real launch.

**What needs to be built:**

- Integrate a payment provider (Stripe is the standard choice)
- Create a Stripe Checkout session on the backend, redirect user to Stripe, handle the webhook on success before granting coins
- Store payment receipts

**Backend files to create/modify:**

- `app/payments/router.py` — replace mock grant with Stripe session creation
- New `app/payments/webhook.py` — handle `checkout.session.completed` Stripe webhook to grant coins after confirmed payment

**Frontend files to modify:**

- `src/components/pricing/CoinBundleCard.tsx` — redirect to Stripe Checkout URL instead of calling the mock endpoint directly
- `src/components/pricing/RecurringPlanCard.tsx` — same, wire the subscribe buttons

---

### 3. Recurring Subscription Plans

**What:** The Pricing page shows three subscription plan cards (from `src/lib/pricing-data.ts`) but the "Subscribe" buttons do nothing. There is no backend model for subscriptions.

**What needs to be built:**

- Backend: `subscriptions` table (user_id, plan_id, status, billing_cycle, next_billing_date)
- Backend: `POST /subscriptions` — create subscription (via Stripe)
- Backend: `GET /users/me/subscription` — get active plan
- Frontend: `src/components/pricing/RecurringPlanCard.tsx` — wire Subscribe button
- Frontend: Show active plan badge on Profile or Pricing page

**Backend files to create:**

- `app/subscriptions/models.py`
- `app/subscriptions/schemas.py`
- `app/subscriptions/router.py`

**Frontend files to modify:**

- `src/components/pricing/RecurringPlanCard.tsx`
- `src/pages/Profile.tsx` — show active subscription tier

---

### 4. Survey Published Confirmation — Acknowledgement Field

**What:** When creating a survey, there is no field to enter an acknowledgement text (the consent statement shown to respondents before they start). It defaults to a generic string in the backend.

**What needs to be built:**

- Frontend: Add an "Acknowledgement / Consent Statement" textarea in the Create Survey form
- It maps to the `acknowledgement` field already accepted by `POST /surveys`

**Frontend files to modify:**

- `src/pages/CreateSurvey.tsx` — add acknowledgement textarea field and wire it to the reducer state
- `src/features/survey-builder/domain/types.ts` — add `acknowledgement` field to the survey builder state type
- `src/features/survey-builder/domain/reducer.ts` — handle it in `SET_FIELD`

---

### 5. Points-to-Coins Conversion (Actual Transaction)

**What:** The `/converter` page lets you calculate the exchange rate between points and coins, but clicking nothing actually converts anything. There is no `POST /convert` endpoint.

**What needs to be built:**

- Backend: `POST /users/me/convert` — spends N points, grants equivalent coins (or vice versa), records two ledger transactions
- Frontend: Add a "Convert" button to the Converter page that calls the endpoint

**Backend files to modify:**

- `app/users/router.py` — add convert endpoint
- `app/ledger/service.py` — already has `spend_points` and `add_coins`, just call both in sequence

**Frontend files to modify:**

- `src/pages/Converter.tsx` — add Convert button, call the endpoint, invalidate `["profile"]` on success

---

### 6. Survey Time Limit — Not Enforced on Frontend

**What:** Surveys can have a `time_limit_minutes` field set in the backend. The Survey page displays the time limit but does not enforce it — there is no countdown timer and no auto-submit when time runs out.

**What needs to be built:**

- Frontend: A countdown timer component shown during the survey
- Auto-submit (or lock) when the timer hits zero

**Frontend files to modify:**

- `src/pages/Survey.tsx` — add countdown timer using `useEffect` + `setInterval`, auto-submit on expiry

---

### 7. Avg Rating — Not Shown After Rating

**What:** After a user submits and rates a survey, their own profile's avg rating updates live in the database. However, the survey card in the For You feed still shows no rating information — respondents cannot see a survey's average rating before deciding to take it.

**What needs to be built:**

- Backend: Add `avg_rating: float | None` to the `SurveySummary` schema returned by `GET /surveys/published`, computed from `survey_ratings`
- Frontend: Show a star or rating badge on each survey card in the For You feed

**Backend files to modify:**

- `app/surveys/schemas.py` — add `avg_rating` field
- `app/surveys/service.py` → `list_published_surveys()` — join `survey_ratings` to compute average per survey

**Frontend files to modify:**

- `src/pages/ForYou.tsx` — add rating display on each survey card

---

### 8. Leaderboard — Only Shows Community Survey Completions

**What:** The community leaderboard currently ranks members only by how many surveys _within that specific community_ they have completed. If a community has no surveys, the leaderboard is empty for everyone.

**What needs to be built (optional improvement):**

- Change ranking to also count surveys created within the community, or use overall platform points as a secondary sort
- Or add a global leaderboard page (`/leaderboard`) showing top users by points across the whole platform

**Backend files to modify:**

- `app/communities/router.py` → `community_leaderboard()` — adjust the query or add a secondary sort

---

### 9. Edit Profile — No Avatar Upload

**What:** The profile avatar is auto-generated from the username via DiceBear. Users cannot upload a custom photo.

**What needs to be built:**

- Backend: File upload endpoint, store URL (or use an external service like Cloudinary/S3)
- Frontend: Avatar upload button on Edit Profile page

**Backend files to create/modify:**

- `app/users/router.py` — add `POST /users/me/avatar` file upload endpoint
- `app/users/models.py` — add `avatar_url` field

**Frontend files to modify:**

- `src/pages/EditProfile.tsx` — add avatar upload input
- `src/pages/Profile.tsx` — use `user.avatar_url` if set, else DiceBear fallback

---

### 10. Landing Page Footer Links

**What:** Several links in the footer (`src/components/Footer.tsx`) point to `#` or non-existent pages.

**Frontend files to modify:**

- `src/components/Footer.tsx` — wire links to actual routes or remove dead ones
