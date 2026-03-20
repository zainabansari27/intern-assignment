# Scalability Note

The codebase is modular (config, middleware, modules, routes), so each domain can be separated into services later.

Current scalability-friendly decisions:
- Stateless JWT authentication, allowing horizontal scaling behind a load balancer.
- Versioned API (`/api/v1`) to support backward-compatible evolution.
- Validation and centralized error middleware to keep behavior predictable as endpoints grow.
- Clear separation of auth, users, and tasks modules.

Current storage choice:
- This assignment build now uses a local JSON datastore (`backend/data/db.json`) for easy setup.
- For real production scale, swap the storage layer to PostgreSQL/MongoDB without changing route contracts.

Recommended production next steps:
- Replace file storage with PostgreSQL and add indexes for high-volume query patterns.
- Add Redis for caching and token/session blacklisting.
- Introduce queue workers (BullMQ/RabbitMQ) for async jobs (emails, reports, notifications).
- Add structured logging (Winston/Pino) and OpenTelemetry tracing.
- Deploy with Kubernetes or ECS and autoscaling.