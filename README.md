# XIFOZ — Cybersecurity Consulting Website

Production-ready marketing website for XIFOZ, a cybersecurity consulting firm.

## Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 19 · TypeScript · Vite · Tailwind |
| Backend   | Node.js · Express · TypeScript          |
| Database  | PostgreSQL · Prisma ORM                 |
| Container | Docker · Docker Compose · nginx         |

---

## Quick Start (Development)

### Prerequisites
- Node.js 22+
- PostgreSQL 16+

### 1. Frontend

```bash
npm install
cp .env.example .env.local   # set VITE_API_URL
npm run dev
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env          # fill DATABASE_URL and CORS_ORIGIN
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

Frontend: `http://localhost:5173` — API: `http://localhost:4000`

---

## Docker (Production)

```bash
cp server/.env.example server/.env   # edit CORS_ORIGIN
export POSTGRES_PASSWORD=your_strong_password
export VITE_API_URL=https://api.yourdomain.com
docker-compose up --build -d
docker-compose exec api npx prisma migrate deploy
```

---

## Environment Variables

### Frontend (`.env.local`)
| Variable       | Description                | Required |
|----------------|----------------------------|----------|
| VITE_API_URL   | Base URL of the API server | Yes      |

### Backend (`server/.env`)
| Variable              | Description                          | Required |
|-----------------------|--------------------------------------|----------|
| DATABASE_URL          | PostgreSQL connection string         | Yes      |
| CORS_ORIGIN           | Allowed frontend origin              | Yes      |
| NODE_ENV              | development or production            | No       |
| PORT                  | API port (default 4000)              | No       |
| RATE_LIMIT_WINDOW_MS  | Rate limit window ms (default 900000)| No       |
| RATE_LIMIT_MAX        | Max requests per window (default 100)| No       |

---

## API Reference

### GET /api/health
Returns server health status.

### POST /api/contact
Submit the contact form. Rate limited to 5 requests/hour per IP.

Body: `{ name, email, company?, service?, message }`  
Success: `201 { success: true, message }`  
Validation error: `422 { success: false, errors: { field: [messages] } }`

---

## Project Structure

```
xifoz/
├── src/                  # Frontend source
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks (useMeta, useScrollReveal…)
│   ├── pages/            # Route-level page components
│   ├── sections/         # Home page section components
│   ├── data/             # Static data (services, FAQ, etc.)
│   └── lib/              # Utilities
├── public/               # Static assets, fonts, sitemap, robots.txt
├── server/
│   ├── src/
│   │   ├── config/       # App config + DB connection
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Rate limiting, error handling
│   │   ├── routes/       # Route definitions
│   │   ├── services/     # Business logic + repository layer
│   │   ├── types/        # TypeScript interfaces
│   │   ├── utils/        # Logger
│   │   ├── validators/   # Zod schemas
│   │   └── database/     # Seed file
│   └── prisma/           # Prisma schema
├── Dockerfile            # Frontend Docker build (nginx)
├── nginx.conf            # nginx SPA + cache config
└── docker-compose.yml    # Full stack: web + api + postgres
```

---

## Production Checklist

- [ ] NODE_ENV=production set on server
- [ ] DATABASE_URL uses a strong password
- [ ] CORS_ORIGIN matches your exact production domain
- [ ] TLS/HTTPS configured (Cloudflare, load balancer, or nginx)
- [ ] POSTGRES_PASSWORD set as a secret (not in .env files committed to git)
- [ ] prisma migrate deploy run after each deployment
- [ ] Health endpoint responding: GET /api/health
- [ ] Logs monitored via stdout to your log aggregator
- [ ] robots.txt reviewed for production crawl policy
- [ ] sitemap.xml submitted to Google Search Console
- [ ] OG image present at /images/og/og-image.jpg
- [ ] VITE_API_URL set to production API URL at build time
