import request from "supertest";

import app from "../src/app";
import { cleanupDatabase, createTestUser } from "./helpers/dbHelpers";

describe("Reservations API", () => {
  let authToken: string;

  beforeEach(async () => {
    // Clean up first to ensure a clean slate
    await cleanupDatabase();

    const { token } = await createTestUser({
      password: "Password123!",
    });
    authToken = token;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("POST /api/reservations", () => {
    test("should create a new reservation successfully", async () => {
      const reservationData = {
        booking_nr: "BK123456",
        room: "Room 101",
        page_url: "https://example.com/booking",
      };

      const response = await request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${authToken}`)
        .send(reservationData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.booking_nr).toBe(reservationData.booking_nr);
      expect(response.body.room).toBe(reservationData.room);
      expect(response.body.state).toBe("pending");
      expect(response.body.balance).toBe(0);
      expect(response.body.adults).toBe(1);
    });

    test("should return 401 without authentication", async () => {
      const reservationData = {
        booking_nr: "BK123456",
        room: "Room 101",
      };

      await request(app)
        .post("/api/reservations")
        .send(reservationData)
        .expect(401);
    });

    test("should return 400 for missing required fields", async () => {
      const reservationData = {
        room: "Room 101",
      };

      await request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${authToken}`)
        .send(reservationData)
        .expect(400);
    });

    test("should return 400 for invalid URL", async () => {
      const reservationData = {
        booking_nr: "BK123456",
        room: "Room 101",
        page_url: "not-a-valid-url",
      };

      await request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${authToken}`)
        .send(reservationData)
        .expect(400);
    });
  });

  describe("GET /api/reservations", () => {
    beforeEach(async () => {
      const reservationData = {
        booking_nr: "BK123456",
        room: "Room 101",
        page_url: "https://example.com/booking",
      };

      await request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${authToken}`)
        .send(reservationData);
    });

    test("should get all reservations successfully", async () => {
      const response = await request(app)
        .get("/api/reservations")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("index");
      expect(response.body).toHaveProperty("page");
      expect(response.body).toHaveProperty("per_page");
      expect(response.body).toHaveProperty("total");
      expect(response.body).toHaveProperty("page_count");
      expect(Array.isArray(response.body.index)).toBe(true);
      expect(response.body.index.length).toBe(1);
    });

    test("should get reservations with pagination", async () => {
      const response = await request(app)
        .get("/api/reservations?page=1&per_page=5")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.page).toBe(1);
      expect(response.body.per_page).toBe(5);
    });

    test("should filter reservations by status", async () => {
      const response = await request(app)
        .get("/api/reservations?status=pending")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(
        response.body.index.every(
          (r: { state: string }) => r.state === "pending"
        )
      ).toBe(true);
    });

    test("should search reservations by booking number", async () => {
      const response = await request(app)
        .get("/api/reservations?q=BK123")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(
        response.body.index.every((r: { booking_nr: string }) =>
          r.booking_nr.includes("BK123")
        )
      ).toBe(true);
    });

    test("should return 401 without authentication", async () => {
      await request(app).get("/api/reservations").expect(401);
    });
  });

  describe("GET /api/reservations/:id", () => {
    let reservationId: number;

    beforeEach(async () => {
      const reservationData = {
        booking_nr: "BK123456",
        room: "Room 101",
        page_url: "https://example.com/booking",
      };

      const response = await request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${authToken}`)
        .send(reservationData);

      reservationId = response.body.id;
    });

    test("should get reservation by id successfully", async () => {
      const response = await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(reservationId);
      expect(response.body.booking_nr).toBe("BK123456");
      expect(response.body).toHaveProperty("guests");
    });

    test("should return 404 for non-existent reservation", async () => {
      await request(app)
        .get("/api/reservations/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });

    test("should return 401 without authentication", async () => {
      await request(app).get(`/api/reservations/${reservationId}`).expect(401);
    });

    test("should return 400 for invalid id parameter", async () => {
      await request(app)
        .get("/api/reservations/invalid-id")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe("PATCH /api/reservations/:id", () => {
    let reservationId: number;

    beforeEach(async () => {
      const reservationData = {
        booking_nr: "BK123456",
        room: "Room 101",
        page_url: "https://example.com/booking",
      };

      const response = await request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${authToken}`)
        .send(reservationData);

      reservationId = response.body.id;
    });

    test("should update reservation successfully", async () => {
      const updateData = {
        state: "started",
        primary_guest_name: "John Doe",
        guest_email: "john@example.com",
      };

      const response = await request(app)
        .patch(`/api/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(reservationId);
      expect(response.body.state).toBe("started");
      expect(response.body.primary_guest_name).toBe("John Doe");
      expect(response.body.guest_email).toBe("john@example.com");
      expect(response.body.updated_at).toBeTruthy();
    });

    test("should return 404 for non-existent reservation", async () => {
      const updateData = {
        state: "started",
      };

      await request(app)
        .patch("/api/reservations/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);
    });

    test("should return 401 without authentication", async () => {
      const updateData = {
        state: "started",
      };

      await request(app)
        .patch(`/api/reservations/${reservationId}`)
        .send(updateData)
        .expect(401);
    });

    test("should validate state values", async () => {
      const updateData = {
        state: "invalid-state",
      };

      await request(app)
        .patch(`/api/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });
  });

  describe("DELETE /api/reservations/:id", () => {
    let reservationId: number;

    beforeEach(async () => {
      const reservationData = {
        booking_nr: "BK123456",
        room: "Room 101",
        page_url: "https://example.com/booking",
      };

      const response = await request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${authToken}`)
        .send(reservationData);

      reservationId = response.body.id;
    });

    test("should delete reservation successfully", async () => {
      const response = await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(reservationId);

      // Verify reservation is actually deleted
      await request(app)
        .get(`/api/reservations/${reservationId}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });

    test("should return 404 for non-existent reservation", async () => {
      await request(app)
        .delete("/api/reservations/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(404);
    });

    test("should return 401 without authentication", async () => {
      await request(app)
        .delete(`/api/reservations/${reservationId}`)
        .expect(401);
    });
  });

  describe("Edge Cases", () => {
    test("should handle date range filtering", async () => {
      const reservationData = {
        booking_nr: "BK123456",
        room: "Room 101",
        page_url: "https://example.com/booking",
      };

      await request(app)
        .post("/api/reservations")
        .set("Authorization", `Bearer ${authToken}`)
        .send(reservationData);

      const today = new Date().toISOString().split("T")[0];
      const response = await request(app)
        .get(`/api/reservations?from=${today}&to=${today}`)
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty("index");
    });

    test("should handle empty search results", async () => {
      const response = await request(app)
        .get("/api/reservations?q=NONEXISTENT")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.index).toHaveLength(0);
      expect(response.body.total).toBe(0);
    });

    test("should handle large page numbers gracefully", async () => {
      const response = await request(app)
        .get("/api/reservations?page=1000")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.index).toHaveLength(0);
      expect(response.body.page).toBe(1000);
    });
  });
});
