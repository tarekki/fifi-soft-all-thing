# Frontend Web - Trendyol Syria

Next.js 14 frontend for the multi-vendor e-commerce platform.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Zod (Validation)

## Project Structure

See `docs/task.md` for complete architecture documentation.

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000/api/v1)
- `NEXT_PUBLIC_FRONTEND_URL`: Frontend URL (default: http://localhost:3000)

