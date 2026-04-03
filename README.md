# Vortex Social

> The next-generation social platform — connect, share, collaborate.

Vortex Social is a full-stack, real-time community platform built with Next.js, NestJS, PostgreSQL, Redis, and Socket.IO.

## 🏗️ Architecture

```
├── apps/
│   ├── api/          # NestJS REST + WebSocket backend
│   └── web/          # Next.js 14 frontend
├── packages/
│   ├── types/        # Shared TypeScript interfaces
│   ├── ui/           # Shared React UI components
│   └── config/       # Shared ESLint + TypeScript config
└── infra/            # Docker Compose + Dockerfiles
```

## ✨ Features

- **Auth** — JWT-based registration & login
- **Communities** — Create public/private communities with custom branding
- **Channels** — Text and voice channels per community
- **Content Feed** — Posts, comments, likes
- **Real-time Chat** — WebSocket-based messaging via Socket.IO
- **Direct Messages** — Private one-on-one conversations
- **Notifications** — In-app notification system
- **Moderation** — Role-based access (admin, moderator, member, guest)

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose

### Run with Docker
```bash
cd infra
docker-compose up
```

The app will be available at:
- Web: http://localhost:3000
- API: http://localhost:4000
- API Docs (Swagger): http://localhost:4000/api/docs

### Run locally

```bash
# Install dependencies
npm install

# Start all services (requires postgres + redis running)
npm run dev
```

### Environment Variables

Copy `.env.example` files and configure:

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Zustand |
| Backend | NestJS, TypeORM, Passport.js |
| Database | PostgreSQL 16 |
| Cache/Sessions | Redis 7 |
| Real-time | Socket.IO |
| Auth | JWT (access + refresh tokens) |
| Monorepo | npm workspaces + Turborepo |

## 🗺️ Development Roadmap

- [x] Phase 1 — Foundation: Auth, users, communities
- [x] Phase 2 — Content: Posts, comments, reactions, feeds
- [x] Phase 3 — Real-time: Text channels, DMs, WebSocket
- [ ] Phase 4 — Voice: WebRTC voice channels
- [ ] Phase 5 — Creator Tools: Branded pages, project spaces
- [ ] Phase 6 — Moderation & Scaling: Advanced tools, CDN, performance
Vortex is an IT company in development. Vortex Social is one of his first inventions, find communities, find friends, talk and chat with them while also sharing what you think with an entire community. 
