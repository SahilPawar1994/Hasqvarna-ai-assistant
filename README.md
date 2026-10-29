# Husqvarna AI Assistant

A full-stack AI query application built with React, TypeScript, Node.js, Express, and an LLM provider integration. The backend exposes a JWT-protected API and supports a mock provider for local development and demonstrations.

## Features

- React and TypeScript frontend for submitting natural-language queries.
- Express and TypeScript backend.
- LLM integration with configurable mock and OpenAI providers.
- JWT bearer-token authentication for the query endpoint.
- Request validation with Zod.
- Request timeout handling and structured API errors.
- Dockerized backend.
- Automated API tests using Vitest and Supertest.
- AWS/Azure deployment guidance.

## Architecture

- **Frontend:** React, TypeScript, Vite.
- **Backend:** Node.js, Express, TypeScript.
- **Validation:** Zod.
- **Authentication:** JSON Web Tokens (JWT).
- **LLM:** OpenAI provider or mock provider.
- **Testing:** Vitest and Supertest.
- **Containerization:** Docker.

## Prerequisites

- Node.js 20 or compatible supported version.
- npm.
- Docker Desktop (optional, for containerized backend execution).
- OpenAI API credentials only if using the live OpenAI provider.

## Local setup

### 1. Configure the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`. Keep `LLM_PROVIDER=mock` for local development without an LLM API key. Set a private `JWT_SECRET` containing at least 32 characters.

### 2. Start the backend

```bash
npm run dev
```

The default backend URL is `http://localhost:3000`.

Check the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{"status":"ok"}
```

### 3. Configure the frontend

In a separate terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
```

Set `VITE_API_BASE_URL` to the backend URL. Set `VITE_DEMO_TOKEN` to a valid JWT signed using the backend's `JWT_SECRET`.

Start the frontend:

```bash
npm run dev
```

Vite typically serves the frontend at `http://localhost:5173`.

## API reference

### Health check

`GET /health`

Returns the backend health status.

### Submit a query

`POST /api/query`

Authentication: `Authorization: Bearer <JWT>`

Request body:

```json
{
  "query": "Explain REST APIs"
}
```

The query must contain between 1 and 2,000 characters after trimming whitespace.

Successful response:

```json
{
  "answer": "Generated answer..."
}
```

The answer depends on the configured LLM provider. In mock mode, the backend returns a demonstration response rather than a live AI-generated answer.

### Error responses

| HTTP status | Meaning |
|---|---|
| 400 | Invalid query input |
| 401 | Missing or invalid JWT |
| 404 | Unknown endpoint |
| 429 | Provider quota exhausted or rate limited |
| 502 | LLM provider request failed |
| 504 | LLM request timed out |

## Testing

From the `backend` directory:

```bash
npm test
npm run build
```

The test suite covers health checks, authentication, invalid query input, and a successful mock response.

## Docker

Build the backend image:

```bash
cd backend
docker build -t husqvarna-ai-backend .
```

Run it with the required environment variables configured:

```bash
docker run --rm --name husqvarna-backend \
  -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -e LLM_PROVIDER=mock \
  -e JWT_SECRET="replace-with-your-own-long-random-secret" \
  -e FRONTEND_URL=http://localhost:5173 \
  husqvarna-ai-backend
```

The backend health endpoint is available at `http://localhost:3000/health`.

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the configuration templates. Never commit real API keys, JWT secrets, or local environment files.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for an example container deployment architecture on AWS and guidance for Azure.

## Implementation notes

- Mock mode supports development and demonstration without provider credits.
- Live OpenAI requests require a valid API key and available provider quota.
- The live provider path should be verified with valid credentials before production use.
- The demo JWT configuration is for development only; production deployments should use a secure authentication and token-issuance process.

## License

This project was prepared as a technical assignment. Add a license if one is required by the project owner.
