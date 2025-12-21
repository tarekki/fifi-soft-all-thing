# Trendyol Syria - E-commerce Platform

Multi-vendor e-commerce platform for the Syrian market, starting with **Fifi** (Children's Shoes) and **Soft** (Women's Shoes & Bags).

## Tech Stack

- **Backend**: Django REST Framework + PostgreSQL
- **Web Frontend**: Next.js 14 (React)
- **Mobile App**: React Native (Expo)
- **Infrastructure**: Docker Compose

## Project Structure

```
trendyol-syria/
├── backend/              # Django REST API
├── frontend-web/         # Next.js Website
├── frontend-mobile/      # React Native App
├── docker/              # Docker configurations
└── docs/                # Documentation & Planning
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.11+
- Git

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd trendyol-syria

# Start all services with Docker
docker-compose up

# Access the services:
# - Backend API: http://localhost:8000
# - API v1: http://localhost:8000/api/v1/
# - API Documentation (Swagger): http://localhost:8000/api/schema/swagger-ui/
# - Web Frontend: http://localhost:3000
# - PostgreSQL: localhost:5432
# - pgAdmin: http://localhost:5050
```

## Development

See `/docs/roadmap.md` for the complete development plan.

## License

Proprietary - All rights reserved
