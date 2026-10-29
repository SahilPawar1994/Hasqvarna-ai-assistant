# Deployment Guide

This document describes a proposed deployment architecture for the Husqvarna AI Assistant. It is a deployment plan, not a claim that the application has already been deployed to a cloud account.

## Architecture

- **Frontend:** Build the React application and host the static assets using Amazon S3 and CloudFront, or an equivalent Azure static hosting service.
- **Backend:** Package the Node.js API as a Docker image and deploy it to Amazon ECS with AWS Fargate, or Azure Container Apps.
- **HTTPS and routing:** Use an Application Load Balancer with HTTPS on AWS, or an Azure-managed ingress endpoint.
- **Secrets:** Store the LLM API key and JWT secret in AWS Secrets Manager or Azure Key Vault.
- **Logging and monitoring:** Use Amazon CloudWatch or Azure Monitor.
- **Container registry:** Use Amazon ECR or Azure Container Registry.

## AWS deployment outline

### 1. Build and publish the image

Build and test the backend image locally:

```bash
cd backend
npm ci
npm test
npm run build
docker build -t husqvarna-ai-backend .
```

Create an ECR repository, authenticate Docker to ECR, tag the image with the repository URI, and push it to the registry.

Use immutable version tags or commit-based tags rather than relying solely on `latest`.

### 2. Configure secrets and environment variables

Store sensitive values in AWS Secrets Manager:

- `OPENAI_API_KEY`
- `JWT_SECRET`

Configure the ECS task definition with non-sensitive settings such as:

- `PORT`
- `NODE_ENV=production`
- `LLM_PROVIDER`
- `OPENAI_MODEL`
- `FRONTEND_URL`

Use `LLM_PROVIDER=mock` for a demonstration environment without provider credentials. Use `LLM_PROVIDER=openai` only after configuring a valid API key and confirming provider quota.

### 3. Deploy the backend

Create an ECS Fargate service with:

- A task definition referencing the ECR image.
- An execution role for pulling images and writing logs.
- A task role with least-privilege permissions.
- Private subnets for application tasks where practical.
- An Application Load Balancer terminating HTTPS.
- A target group health check using `/health`.
- Security groups allowing only required inbound traffic.

Configure the container's listening port to match `PORT`.

### 4. Deploy the frontend

Build the frontend using the production API URL:

```bash
cd frontend
npm ci
npm run build
```

Publish the generated `dist/` directory to an S3 bucket configured for private origin access through CloudFront, or use an equivalent static hosting service.

Configure SPA fallback routing if needed.

Do not put private credentials into frontend environment variables. Variables prefixed with `VITE_` are exposed to browser code after the frontend is built. The demo JWT is not a production authentication mechanism.

### 5. Configure networking and CORS

Set the backend's `FRONTEND_URL` to the actual frontend origin. Configure DNS and TLS certificates for the public application endpoints.

Keep the backend inaccessible directly from the public internet where the architecture permits it, exposing it through the load balancer.

### 6. Monitoring and operations

- Send container logs to CloudWatch.
- Configure alarms for unhealthy targets, elevated 5xx responses, and task restarts.
- Monitor latency, request volume, and provider errors.
- Set provider timeouts and quotas appropriate to the application.
- Use rolling deployments and retain a known-good image for rollback.

## Azure alternative

A comparable Azure deployment can use:

- Azure Container Registry for the Docker image.
- Azure Container Apps for the backend API.
- Azure Key Vault for secrets.
- Azure Monitor and Log Analytics for diagnostics.
- Azure Static Web Apps or Storage plus Azure Front Door for the frontend.

Configure the backend ingress, HTTPS, CORS, health probes, and secret references according to the selected Azure service.

## CI/CD recommendations

A production pipeline should:

1. Install dependencies using lockfiles.
2. Run backend tests and TypeScript builds.
3. Build the Docker image.
4. Scan dependencies and the image for vulnerabilities.
5. Publish a versioned image to the registry.
6. Deploy to a staging environment.
7. Run smoke tests against `/health` and the protected query endpoint.
8. Promote the validated release and retain a rollback path.

Prefer short-lived CI identity credentials, such as GitHub Actions OIDC with AWS IAM, over long-lived cloud access keys.

## Production readiness checklist

- [ ] Real secrets stored in a managed secret store.
- [ ] Production authentication replaces the demo JWT.
- [ ] HTTPS enabled.
- [ ] CORS restricted to approved frontend origins.
- [ ] Health probes and monitoring configured.
- [ ] Container runs as a non-root user.
- [ ] Provider timeouts, quotas, and failure responses tested.
- [ ] CI/CD and rollback procedures validated.
- [ ] Cloud deployment smoke tests completed.
