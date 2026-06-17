# Nexus AI — Deployment Guide

## Pre-Deployment Checklist

Run through every item before deploying:

### Authentication
- [ ] `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` set in Google Cloud Console
- [ ] `RESEND_API_KEY` configured, sending domain verified
- [ ] `NEXTAUTH_SECRET` generated: `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` set to production URL

### AI Providers
- [ ] `NVIDIA_API_KEY` from [build.nvidia.com](https://build.nvidia.com)
- [ ] `OPENROUTER_API_KEY` from [openrouter.ai](https://openrouter.ai) (fallback)
- [ ] Test NVIDIA endpoint: `curl https://integrate.api.nvidia.com/v1/models -H "Authorization: Bearer $NVIDIA_API_KEY"`

### Database
- [ ] MongoDB Atlas cluster created
- [ ] `MONGODB_URI` connection string configured
- [ ] IP allowlist includes `0.0.0.0/0` (for Vercel) or specific Vercel IPs
- [ ] Indexes created (see below)

### File Storage
- [ ] Cloudinary account created
- [ ] `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` set
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` set for client-side uploads
- [ ] Upload presets configured in Cloudinary dashboard

### Research
- [ ] `TAVILY_API_KEY` from [tavily.com](https://tavily.com)
- [ ] `FIRECRAWL_API_KEY` from [firecrawl.dev](https://firecrawl.dev)

### Monitoring
- [ ] Sentry project created
- [ ] `SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN` set
- [ ] `SENTRY_AUTH_TOKEN` set for source map uploads

## MongoDB Indexes

Run in MongoDB Atlas or mongosh:

```js
// Users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

// Sessions
db.sessions.createIndex({ token: 1 }, { unique: true });
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// OTP
db.otp_verifications.createIndex({ email: 1 });
db.otp_verifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Documents
db.documents.createIndex({ userId: 1, uploadedAt: -1 });

// Knowledge Vault
db.knowledge_vault.createIndex({ name: "text", tags: "text" });
db.knowledge_vault.createIndex({ createdAt: -1 });

// Chat History
db.chat_history.createIndex({ userId: 1, createdAt: -1 });

// Research Sessions
db.research_sessions.createIndex({ userId: 1, createdAt: -1 });

// Agents
db.agents.createIndex({ agentId: 1, createdAt: -1 });

// Meeting Summaries
db.meeting_summaries.createIndex({ createdAt: -1 });
```

## Vercel Deployment

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment variables (or use Vercel dashboard)
vercel env add NVIDIA_API_KEY production
vercel env add MONGODB_URI production
# ... repeat for all variables in .env.example
```

## Feature Verification After Deploy

Test each feature:

```bash
BASE=https://your-app.vercel.app

# Auth
curl -X POST $BASE/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"TestPass123"}'

# AI Chat
curl -X POST $BASE/api/ai-chat -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Research
curl -X POST $BASE/api/research -H "Content-Type: application/json" \
  -d '{"query":"NVIDIA NIM 2025"}'

# Voice command
curl -X POST $BASE/api/voice -H "Content-Type: application/json" \
  -d '{"transcript":"Create task finish report"}'
```

## Voice Assistant (Browser)

Voice features use the Web Speech API — no additional setup needed:
- `SpeechRecognition` for voice input
- `SpeechSynthesis` for AI voice output
- Commands: "Create Task", "Open Research", "Search Knowledge Vault", "Summarize Document", "Generate Notes"
- Supported: Chrome, Edge, Safari (limited Firefox support)
