# Nexus AI — Personal AI Operating System v2.0

A production-ready, full-stack AI Operating System built with Next.js 16, React 19, TypeScript, and powered by **NVIDIA NIM**.

## ✨ Features

| Feature | Stack |
|---|---|
| **AI Chat** | NVIDIA NIM (LLaMA 3.1 70B) · Streaming · Voice input/output |
| **AI Research** | Tavily search · Firecrawl extraction · NVIDIA NIM synthesis |
| **Knowledge Vault** | Semantic search · Cloudinary storage · AI summaries |
| **Document Intelligence** | PDF/DOCX/PPTX · Q&A · Key insights · NVIDIA NIM |
| **Career Copilot** | ATS scoring · Cover letters · Interview prep · LinkedIn |
| **Voice Assistant** | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| **Agent Hub** | Research · Career · Document · Productivity agents |
| **Meeting Assistant** | Transcript processing · Tasks · Action items · Follow-ups |
| **Authentication** | Google OAuth · Email OTP via Resend · Session tokens |
| **Monitoring** | Sentry — frontend + backend + performance |

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env.local
# Fill in your API keys

# 3. Run development server
npm run dev

# 4. Open http://localhost:3000
```

## 🔑 Required API Keys

| Service | Purpose | Get Key |
|---|---|---|
| `NVIDIA_API_KEY` | Primary AI (LLaMA 3.1 70B) | [build.nvidia.com](https://build.nvidia.com) |
| `OPENROUTER_API_KEY` | AI fallback | [openrouter.ai](https://openrouter.ai) |
| `MONGODB_URI` | Database | [mongodb.com/atlas](https://mongodb.com/atlas) |
| `CLOUDINARY_*` | File storage | [cloudinary.com](https://cloudinary.com) |
| `RESEND_API_KEY` | Email OTP | [resend.com](https://resend.com) |
| `TAVILY_API_KEY` | Web search | [tavily.com](https://tavily.com) |
| `FIRECRAWL_API_KEY` | Content extraction | [firecrawl.dev](https://firecrawl.dev) |
| `SENTRY_DSN` | Error monitoring | [sentry.io](https://sentry.io) |

## 🏗️ Architecture

```
src/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # login, register, verify-otp, forgot-password
│   ├── dashboard/        # Main dashboard with greeting
│   ├── chat/             # AI Chat with streaming
│   ├── research/         # AI Research workspace
│   ├── knowledge-vault/  # Document semantic search
│   ├── documents/        # Document intelligence
│   ├── career/           # Career Copilot
│   ├── agents/           # Agent Hub
│   ├── meeting/          # Meeting Assistant
│   ├── settings/         # User settings
│   └── api/              # API routes
│       ├── ai-chat/      # Streaming chat (NVIDIA NIM)
│       ├── research/     # Tavily + Firecrawl + NIM
│       ├── career/       # ATS + cover letter + interview
│       ├── meeting/      # Transcript analysis
│       ├── agents/       # Autonomous agent execution
│       ├── voice/        # Voice command processing
│       └── auth/         # Register + Login + OTP
├── components/
│   ├── aurora/           # Aurora background (global visual)
│   ├── layout/           # AppLayout with sidebar
│   └── voice/            # VoiceAssistant (Web Speech API)
└── lib/
    ├── ai/providers/     # NVIDIA NIM + OpenRouter abstraction
    ├── mongodb.ts        # MongoDB Atlas singleton
    └── cloudinary.ts     # Cloudinary file storage
```

## 🤖 AI Provider Architecture

```
All AI requests → Provider Manager
      ↓
  NVIDIA NIM (primary)
      ↓ (on failure)
  OpenRouter (fallback)
      ↓
  Response returned
```

**Never call providers directly** — always use `src/lib/ai/providers/provider-manager.ts`

## 🧪 Testing

```bash
npm test          # Unit tests (Vitest)
npm run test:e2e  # E2E tests (Playwright)
```

## 📦 Deployment (Vercel)

1. Push to GitHub
2. Import to Vercel
3. Add all environment variables from `.env.example`
4. Deploy

Sentry monitoring activates automatically once `SENTRY_DSN` is set.
