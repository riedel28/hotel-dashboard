import request from "supertest";

import app from "../src/app";
import { db } from "../src/db/pool";
import { properties as propertiesTable } from "../src/db/schema";
import { cleanupDatabase, createTestUser } from "./helpers/dbHelpers";

describe("Properties API", () => {
  let authToken: string;

  beforeEach(async () => {
    const { token } = await createTestUser({
      password: "Password123!",
    });
    authToken = token;

    // Create test properties
    await db.insert(propertiesTable).values([
      {
        id: "9cb0e66a-9937-465d-a188-2c4c4ae2401f",
        name: "Development (2)",
        stage: "demo",
      },
      {
        id: "61eb0e32-2391-4cd3-adc3-66efe09bc0b7",
        name: "Staging",
        stage: "staging",
      },
      {
        id: "a4e1fa51-f4ce-4e45-892c-224030a00bdd",
        name: "Development 13, Adyen",
        stage: "template",
      },
      {
        id: "cc198b13-4933-43aa-977e-dcd95fa30770",
        name: "Kullturboden-Hallstadt",
        stage: "production",
      },
      {
        id: "f8a2b4c6-d8e0-4f2a-9b1c-3d5e7f9a1b2c",
        name: "Grand Hotel Vienna",
        stage: "production",
      },
      {
        id: "e7d6c5b4-a3f2-1e0d-9c8b-7a6f5e4d3c2b",
        name: "Seaside Resort Barcelona",
        stage: "staging",
      },
      {
        id: "b1a2c3d4-e5f6-7890-abcd-ef1234567890",
        name: "Mountain Lodge Switzerland",
        stage: "demo",
      },
      {
        id: "c2d3e4f5-a6b7-8901-cdef-234567890123",
        name: "Urban Boutique Hotel Berlin",
        stage: "template",
      },
      {
        id: "d3e4f5a6-b7c8-9012-def3-456789012345",
        name: "Historic Palace Hotel Prague",
        stage: "production",
      },
      {
        id: "cc198b13-4933-43aa-977e-dcd95fa30771",
        name: "Lorem ipsum dolor sit amet",
        stage: "production",
      },
    ]);
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("GET /api/properties", () => {
    test("should get all properties successfully with default pagination", async () => {
      const response = await request(app)
        .get("/api/properties")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("index");
      expect(response.body).toHaveProperty("page");
      expect(response.body).toHaveProperty("per_page");
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("page_count");
      expect(response.body.page).toBe(1);
      expect(response.body.per_page).toBe(10);
      expect(response.body.total).toBe(10);
      expect(response.body.page_count).toBe(1);
      expect(Array.isArray(response.body.index)).toBe(true);
      expect(response.body.index.length).toBe(10);

      // Verify property structure
      const property = response.body.index[0];
      expect(property).toHaveProperty("id");
      expect(property).toHaveProperty("name");
      expect(property).toHaveProperty("stage");
      expect(["demo", "production", "staging", "template"]).toContain(
        property.stage
      );
    });

    test("should return paginated results", async () => {
      const response = await request(app)
        .get("/api/properties?page=1&per_page=5")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.per_page).toBe(5);
      expect(response.body.total).toBe(10);
      expect(response.body.page_count).toBe(2);
      expect(response.body.index.length).toBe(5);
    });

    test("should return second page correctly", async () => {
      const response = await request(app)
        .get("/api/properties?page=2&per_page=5")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(2);
      expect(response.body.per_page).toBe(5);
      expect(response.body.total).toBe(10);
      expect(response.body.page_count).toBe(2);
      expect(response.body.index.length).toBe(5);
    });

    test("should return empty array for page beyond available data", async () => {
      const response = await request(app)
        .get("/api/properties?page=10&per_page=5")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(10);
      expect(response.body.per_page).toBe(5);
      expect(response.body.total).toBe(10);
      expect(response.body.page_count).toBe(2);
      expect(response.body.index.length).toBe(0);
    });

    test("should filter properties by search query", async () => {
      const response = await request(app)
        .get("/api/properties?q=Vienna")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.total).toBeGreaterThan(0);
      expect(
        response.body.index.some((prop: { name: string }) =>
          prop.name.includes("Vienna")
        )
      ).toBe(true);
    });

    test("should return empty results for non-matching search query", async () => {
      const response = await request(app)
        .get("/api/properties?q=NonexistentProperty123")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.total).toBe(0);
      expect(response.body.index.length).toBe(0);
    });

    test("should combine pagination and search", async () => {
      const response = await request(app)
        .get("/api/properties?q=Hotel&page=1&per_page=5")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.index.length).toBeLessThanOrEqual(5);
      expect(
        response.body.index.every((prop: { name: string }) =>
          prop.name.toLowerCase().includes("hotel")
        )
      ).toBe(true);
    });

    test("should return 401 without authentication", async () => {
      await request(app).get("/api/properties").expect(401);
    });

    test("should return 400 for invalid per_page value", async () => {
      await request(app)
        .get("/api/properties?per_page=3")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
    });

    test("should return 400 for invalid page value", async () => {
      await request(app)
        .get("/api/properties?page=0")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
    });

    test("should accept valid per_page values", async () => {
      const validPerPageValues = [5, 10, 25, 50, 100];

      for (const perPage of validPerPageValues) {
        const response = await request(app)
          .get(`/api/properties?per_page=${perPage}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.per_page).toBe(perPage);
      }
    });
  });
});
