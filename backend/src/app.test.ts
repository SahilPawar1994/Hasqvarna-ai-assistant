
import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import type { Express } from "express";

const testSecret = "vitest-test-secret-at-least-32-characters-long";

let app: any;
let token: string;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.PORT = "3001";
  process.env.LLM_PROVIDER = "mock";
  process.env.JWT_SECRET = testSecret;
  process.env.FRONTEND_URL = "http://localhost:5173";

  const module = await import("./app.js");
  app = module.default;

  token = jwt.sign(
    { sub: "test-user" },
    testSecret,
    { algorithm: "HS256", expiresIn: "1h" },
  );
});

describe("GET /health", () => {
  it("returns a healthy status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("POST /api/query", () => {
  it("rejects requests without a token", async () => {
    const response = await request(app)
      .post("/api/query")
      .send({ query: "Hello" });

    expect(response.status).toBe(401);
  });

  it("rejects an invalid token", async () => {
    const response = await request(app)
      .post("/api/query")
      .set("Authorization", "Bearer invalid-token")
      .send({ query: "Hello" });

    expect(response.status).toBe(401);
  });

  it("rejects an empty query", async () => {
    const response = await request(app)
      .post("/api/query")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: "   " });

    expect(response.status).toBe(400);
  });

  it("rejects a query longer than 2000 characters", async () => {
    const response = await request(app)
      .post("/api/query")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: "a".repeat(2001) });

    expect(response.status).toBe(400);
  });

  it("returns a mock answer for a valid request", async () => {
    const response = await request(app)
      .post("/api/query")
      .set("Authorization", `Bearer ${token}`)
      .send({ query: "Explain REST APIs" });

    expect(response.status).toBe(200);
    expect(response.body.answer).toContain("MOCK RESPONSE");
    expect(response.body.answer).toContain("Explain REST APIs");
  });
});
