# SupportDesk CRM

A customer support ticketing system I built as part of the Datastraw internship assessment. It lets support teams create tickets, track their status, search through them, and add notes as issues get resolved.

---

## What it does

- Create support tickets with customer info and issue details
- View all tickets in a list with live search and status filtering
- Click into any ticket to see full details and history
- Update ticket status (Open → In Progress → Closed)
- Add internal notes to track progress on a ticket
- Auto-generated ticket IDs (e.g. TCK-A3F9X2)

---

## Tech stack

**Backend** — Node.js + Express + TypeScript, Prisma ORM, PostgreSQL (Neon DB)

**Frontend** — Next.js 14 (App Router), TypeScript, plain CSS

**Deployed on** — Backend on Render.com, Frontend on Vercel

---

## Project structure

```
crm/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server entry point
│   │   ├── routes/tickets.ts     # All ticket API routes
│   │   ├── middleware/           # Error handling
│   │   └── lib/                  # Prisma client, helper functions
│   └── prisma/schema.prisma      # Database schema
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx               # Home — ticket list, search, filters
        │   ├── tickets/new/           # Create ticket form
        │   └── tickets/[id]/          # Ticket detail + update + notes
        └── lib/
            ├── api.ts                 # All fetch calls to the backend
            └── utils.ts              # Date formatting, status helpers
```

---

## Running locally

You'll need Node.js 18+ and a Neon DB account (free at neon.tech).

**1. Clone the repo**
```bash
git clone https://github.com/YOUR_USERNAME/support-crm.git
cd support-crm
```

**2. Set up the backend**
```bash
cd crm/backend
npm install
cp .env.example .env
```

Open `.env` and add your Neon DB connection string:
```
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"
PORT=4000
FRONTEND_URL=http://localhost:3000
```

Push the schema and start the server:
```bash
npx prisma db push
npm run dev
```

Backend runs at `http://localhost:4000`

**3. Set up the frontend**
```bash
cd crm/frontend
npm install
```

Create a `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start the dev server:
```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## API endpoints

| Method | Endpoint | What it does |
|--------|----------|--------------|
| GET | `/health` | Check if server is up |
| POST | `/api/tickets` | Create a new ticket |
| GET | `/api/tickets` | Get all tickets (supports `?status=` and `?search=`) |
| GET | `/api/tickets/:ticket_id` | Get a single ticket with all its notes |
| PUT | `/api/tickets/:ticket_id` | Update status or add a note |

---

## Deployment

**Backend is on Render.com**

- Root directory: `crm/backend`
- Build command: `npm install && npx prisma generate && npx tsc`
- Start command: `node dist/index.js`
- Environment variables: `DATABASE_URL`, `PORT`, `FRONTEND_URL`, `NODE_ENV=production`

**Frontend is on Vercel**

- Root directory: `crm/frontend`
- Framework: Next.js (auto-detected)
- Environment variable: `NEXT_PUBLIC_API_URL` pointing to the Render backend URL

---

## Database schema

Two tables — `Ticket` and `Note`. Tickets hold all the customer and issue info. Notes are linked to a ticket and store any updates added over time.

```prisma
model Ticket {
  id             Int      @id @default(autoincrement())
  ticket_id      String   @unique
  customer_name  String
  customer_email String
  subject        String
  description    String
  status         String   @default("OPEN")
  created_at     DateTime @default(now())
  updated_at     DateTime @updatedAt
  notes          Note[]
}

model Note {
  id         Int      @id @default(autoincrement())
  ticket_id  String
  note_text  String
  created_at DateTime @default(now())
  ticket     Ticket   @relation(fields: [ticket_id], references: [ticket_id])
}
```

---

## Challenges I ran into

**TypeScript on Render** — The `@types/*` packages were in `devDependencies`, which Render skips in production. Moved them to `dependencies` and that fixed the build.

**CORS trailing slash** — The `FRONTEND_URL` env variable had a trailing slash which made the CORS header not match the actual origin. Removing the slash fixed it instantly.

**Prisma on serverless** — Used a singleton pattern for the Prisma client to avoid opening too many database connections in development with hot reload.

---

## If I had more time

- Add authentication so only logged-in agents can manage tickets
- Email notifications when a ticket is created or updated
- Priority levels (Low / Medium / High / Urgent)
- Ticket assignment to specific team members
- A dashboard with charts showing ticket volume over time
