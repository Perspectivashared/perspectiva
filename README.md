# Insight Forge — Frontend

React + TypeScript frontend for the Perspectiva survey platform. Fully integrated with the Insight Forge API backend.

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — build tool
- **Tailwind CSS** + **shadcn/ui** — styling and components
- **TanStack Query** — server state management
- **React Router v6** — routing
- **React Hook Form** + **Zod** — form validation
- **Recharts** — charts (analytics)

---

## Prerequisites

- Node.js 18+ installed
- npm installed
- The backend (Insight Forge API) must be running on `http://localhost:8000`

---

## Setup

### 1. Clone the repo
```bash
git clone <repo-url>
cd insight-forge-game-Vinayak
```

### 2. Install dependencies
```bash
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is required due to an eslint peer dependency conflict in the project.

### 3. Start the dev server
```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Environment Variables (optional)

By default the frontend calls `http://localhost:8000`. If your backend runs on a different URL, create a `.env.local` file:

```
VITE_API_URL=http://localhost:8000
```

---

## Pages & Features

| Route | Page | Auth Required |
|-------|------|---------------|
| `/` | Landing page | No |
| `/sign-in` | Sign in | No |
| `/sign-up` | Sign up | No |
| `/communities` | Featured communities | No |
| `/communities/all` | All communities | No |
| `/communities/:id` | Community details | No |
| `/pricing` | Pricing plans | No |
| `/for-you` | Survey feed | **Yes** |
| `/survey` | Take a survey | **Yes** |
| `/create-survey` | Build & publish a survey | **Yes** |
| `/profile` | User profile + wallet | **Yes** |
| `/converter` | Points ↔ Coins converter | **Yes** |

Protected routes redirect to `/sign-in` if not authenticated.

---

## How Authentication Works

- JWT token is stored in `localStorage` under the key `token`
- Token is auto-attached to every API request via `src/lib/api.ts`
- `AuthContext` (`src/features/auth/context/AuthContext.tsx`) manages auth state
- Sign out clears the token and redirects to home

---

## Project Structure

```
src/
├── app/                  # Router, providers, protected routes
├── components/           # Shared UI components (Navigation, CommunityCard, etc.)
├── features/
│   ├── auth/             # Auth context, schemas, service
│   ├── communities/      # Community data, repository (calls real API)
│   ├── profile/          # Profile service (calls real API)
│   ├── surveys/          # Survey types, normalizers, question inputs
│   ├── survey-builder/   # Survey builder state machine + draft storage
│   └── pricing/          # Pricing data
├── lib/
│   ├── api.ts            # Base API client with JWT attachment
│   └── routes.ts         # Route constants
├── pages/                # Page components
└── shared/               # Layout, async state, utilities
```

---

## Key Flows

### Sign Up
1. Go to `/sign-up`
2. Fill in name, username, password, profession
3. On success → JWT stored → redirected to home
4. New users receive **10 points** on signup

### Create & Publish a Survey
1. Go to `/create-survey`
2. Fill in title, description, add questions
3. Click **Publish Survey** — costs **2 points**
4. Survey appears in the **For You** feed for others

### Take a Survey
1. Go to `/for-you`
2. Click **Take Survey** on any listing
3. Accept acknowledgement → answer questions → Submit
4. Earn **10 points** on completion

---

## Known Issues / TODO

- Sign up / sign in with Google not wired up yet (backend supports it)
- Edit Profile page not implemented
- User profiling questionnaire (Categorizer page) not connected to backend
- Survey analytics page not wired up yet
- Payment portal for coins not implemented
- Saved surveys tab is empty (no backend support yet)
- Landing page footer links not all connected
- Survey published confirmation page missing

---

## Backend

Make sure the backend is running before starting the frontend. See the backend README for setup instructions.

Backend repo: `insight-forge-api`
Backend URL: `http://localhost:8000`
API docs: `http://localhost:8000/docs`
