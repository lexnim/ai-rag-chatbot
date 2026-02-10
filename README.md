# AI Chatbot

A Next.js AI chatbot with support for text and file attachments, multiple AI models, optional web search, and RAG (retrieval-augmented generation) over uploaded documents.

## Features

- **Chat**
  - Send text messages and ask questions.
  - Attach files (images, PDFs, audio, video) and ask questions about them.
  - Switch between AI models (Gemini, GPT-4o, Claude, etc.) via the model selector.
  - Toggle **web search** to let the assistant search the web for current or general information.
- **Knowledge base (RAG)**
  - Upload PDFs on the **Upload** page; they are chunked, embedded, and stored in the database.
  - The assistant can search this knowledge base and use it to answer questions about your documents.
  - Only logged-in users with an **admin** role can access the upload route; the role must be set as user metadata in the [Clerk Dashboard](https://dashboard.clerk.com/).
- **Streaming**
  - Responses stream in real time via the Vercel AI SDK.
- **Authentication**
  - [Clerk](https://clerk.com/) is used for authentication management (sign-up, sign-in, sessions).

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19
- **AI:** [Vercel AI SDK](https://sdk.vercel.ai/) with [Google AI SDK](https://www.npmjs.com/package/@ai-sdk/google) (Gemini models, embeddings)
- **Database:** [Neon](https://neon.tech/) (serverless Postgres) with [Drizzle ORM](https://orm.drizzle.team/)
- **Auth:** [Clerk](https://clerk.com/) for authentication management
- **Styling:** Tailwind CSS, Radix UI, shadcn-style components

## Getting Started

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech/) database (for RAG and document storage)
- A [Google AI](https://ai.google.dev/) API key (for Gemini chat and embeddings)

### Environment Variables

Create a `.env.local` in the project root:

```env
# Required for Auth, chat and RAG
GOOGLE_GENERATIVE_AI_API_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEON_DATABASE_URL
```

### Upload route: admin role

The upload route is restricted to logged-in users with an **admin** role. Set this in the [Clerk Dashboard](https://dashboard.clerk.com/): go to your application → **Users** → select a user → **Metadata** (e.g. public or private metadata), and add a role field (e.g. `"role": "admin"` or `"admin": true`) so your app can allow access to the upload page.

### Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the **Chat** page to talk to the assistant and the **Upload** page to add PDFs to the knowledge base.

### Database Migrations

If the database is empty, run migrations so the documents table exists:

```bash
npx drizzle-kit migrate
```

## Project Structure (relevant parts)

- `src/app/chat/` – Chat UI, model selector, web search toggle, attachment handling
- `src/app/upload/` – PDF upload and processing (chunking → embeddings → DB)
- `src/app/api/chat/route.ts` – Chat API: streaming, tools (knowledge base search, optional web search)
- `src/lib/` – `search.ts` (vector search), `embeddings.ts` (Gemini), `chunking.ts`, `db-config.ts`, `db-schema.ts`

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Deploy on Vercel](https://nextjs.org/docs/app/building-your-application/deploying)
