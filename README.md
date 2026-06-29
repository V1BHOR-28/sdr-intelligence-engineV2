# SDR Intelligence Engine

Turn sales call transcripts into closable deals. Free, open-source, AI-powered sales call analyzer that extracts objections, competitors, CRM-ready summaries, action plans, and personalized follow-up emails in seconds.

## Features

- **One transcript in, a complete deal playbook out** — Paste any sales call and instantly get:
  - Key objections (spoken and implied)
  - Competitor intelligence
  - CRM-ready summary (3 bullets, paste-ready for Salesforce/HubSpot)
  - Prioritized 48-hour action plan
  - Strategic insights (buying signals, motivations, risks)
  - Personalized follow-up email draft
  - Deal stage and sentiment classification
  - Estimated deal value

- **Cloud sync** — Sign in with email to save analyses across devices (Postgres-backed)
- **Local-first** — Works without an account; analyses stored in browser localStorage
- **Dark/light themes** — Premium SaaS UI with smooth animations
- **Dashboard** — Pipeline stage distribution, top competitors, recent calls
- **History** — Searchable, filterable call library
- **100% free** — No API keys, no credit card, no usage limits

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: PostgreSQL (Neon recommended)
- **ORM**: Prisma
- **Auth**: NextAuth.js (email-based, passwordless)
- **AI**: Pollinations.ai (keyless, free)
- **State**: Zustand + persist middleware
- **Animations**: Framer Motion

## Quick Start

### Prerequisites

- Node.js 20+ or Bun
- A PostgreSQL database (free at [Neon](https://neon.tech))

### Setup

1. **Clone and install:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/sdr-intelligence-engine.git
   cd sdr-intelligence-engine
   bun install  # or npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in:
   - `DATABASE_URL` — your Neon pooled Postgres connection string
   - `NEXTAUTH_SECRET` — run `openssl rand -base64 32` and paste the output
   - `NEXTAUTH_URL` — `http://localhost:3000` for local dev

3. **Set up the database:**
   ```bash
   bun run db:push    # Creates all tables
   ```

4. **Run the dev server:**
   ```bash
   bun run dev
   ```

5. **Open http://localhost:3000** — you're live!

### Verify the AI provider (optional)

The app uses Pollinations.ai (free, keyless). To verify it works in your environment:

```bash
bun run scripts/test-pollinations.ts
```

## Deployment (Vercel — free)

1. Push your code to GitHub (make sure `.env` is NOT committed — it's in `.gitignore`)
2. Go to [vercel.com/new](https://vercel.com/new) and import your repo
3. Set these 3 environment variables in Vercel:
   - `DATABASE_URL` — your Neon pooled connection string
   - `NEXTAUTH_SECRET` — a fresh random string (run `openssl rand -base64 32`)
   - `NEXTAUTH_URL` — `https://your-app.vercel.app` (set after first deploy)
4. Click **Deploy** — done!

### Region recommendation

When creating your Neon database, choose **AWS US East (Ohio) — us-east-2** to match Vercel's default region for lowest latency.

Use the **pooled connection string** (has `-pooler` in the hostname) for serverless compatibility.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts      # AI analysis endpoint (Pollinations.ai)
│   │   ├── analyses/route.ts     # CRUD for analyses (auth-protected)
│   │   ├── sync/route.ts         # Bulk sync local→cloud
│   │   ├── preferences/route.ts  # User preferences
│   │   └── auth/[...nextauth]/   # NextAuth handler
│   ├── page.tsx                  # Main view router
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Theme + animations
├── components/
│   ├── app/                      # Nav, views (analyze, result, dashboard, history, settings)
│   ├── landing/                  # Marketing page sections
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── analysis-db.ts            # Prisma CRUD helpers
│   ├── db.ts                     # Prisma client
│   ├── store.ts                  # Zustand store
│   ├── types.ts                  # TypeScript types
│   └── samples.ts                # Sample transcripts
└── hooks/
    └── use-auth-sync.ts          # Bidirectional cloud sync

prisma/
└── schema.prisma                 # User, Account, Analysis, UserPreference

scripts/
└── test-pollinations.ts          # AI provider test
```

## Cost

$0/month to run, forever:

| Layer | Provider | Cost |
|---|---|---|
| Frontend + API | Vercel free tier | $0 |
| Database | Neon free tier (0.5GB) | $0 |
| Auth | NextAuth (self-hosted) | $0 |
| AI | Pollinations.ai (keyless) | $0 |

## License

MIT — free to use, modify, and distribute.

## Built with ❤️ for the SDR community
