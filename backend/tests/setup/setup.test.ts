import { cleanupDatabase, createTestUser } from "../helpers/dbHelpers";

describe("Test Setup Verification", () => {
  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  test("should connect to test database", async () => {
    const { user, token } = await createTestUser();

    expect(user).toBeDefined();
    expect(user.email).toContain("@example.com");
    expect(token).toBeDefined();
  });
});
