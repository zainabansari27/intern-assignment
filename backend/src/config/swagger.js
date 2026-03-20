const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Intern Assignment API",
    version: "1.0.0",
    description: "REST API with JWT auth, RBAC, task CRUD, validation, and versioning"
  },
  servers: [{ url: "http://localhost:5000/api/v1" }],
  tags: [
    { name: "Auth" },
    { name: "Tasks" },
    { name: "Users (Admin)" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      RegisterBody: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Alice Doe" },
          email: { type: "string", format: "email", example: "alice@example.com" },
          password: { type: "string", format: "password", example: "supersecure123" },
          role: { type: "string", enum: ["user", "admin"] }
        }
      },
      LoginBody: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", format: "password" }
        }
      },
      TaskBody: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", example: "Finish assignment" },
          description: { type: "string", example: "Complete backend and frontend" },
          status: { type: "string", enum: ["todo", "in_progress", "done"] }
        }
      }
    }
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterBody" }
            }
          }
        },
        responses: { "201": { description: "Created" }, "409": { description: "Email exists" } }
      }
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginBody" }
            }
          }
        },
        responses: { "200": { description: "Success" }, "401": { description: "Unauthorized" } }
      }
    },
    "/tasks": {
      get: {
        tags: ["Tasks"],
        summary: "List tasks (user: own, admin: all)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Success" } }
      },
      post: {
        tags: ["Tasks"],
        summary: "Create task",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskBody" }
            }
          }
        },
        responses: { "201": { description: "Created" } }
      }
    },
    "/tasks/{id}": {
      get: {
        tags: ["Tasks"],
        summary: "Get task by id",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: { "200": { description: "Success" }, "404": { description: "Not found" } }
      },
      put: {
        tags: ["Tasks"],
        summary: "Update task by id",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TaskBody" }
            }
          }
        },
        responses: { "200": { description: "Success" } }
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete task by id",
        security: [{ bearerAuth: [] }],
        parameters: [{ in: "path", name: "id", required: true, schema: { type: "integer" } }],
        responses: { "204": { description: "Deleted" } }
      }
    },
    "/users": {
      get: {
        tags: ["Users (Admin)"],
        summary: "List users (admin only)",
        security: [{ bearerAuth: [] }],
        responses: { "200": { description: "Success" }, "403": { description: "Forbidden" } }
      }
    }
  }
};

export default swaggerSpec;