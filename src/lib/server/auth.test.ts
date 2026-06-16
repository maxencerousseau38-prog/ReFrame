import { describe, it, expect, afterEach, vi } from "vitest";

// SECRET is captured at module load, so each case resets modules + env.
describe("authSecretSecure", () => {
  const original = process.env.AUTH_SECRET;
  afterEach(() => {
    if (original === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = original;
    vi.resetModules();
  });

  it("is false when AUTH_SECRET is unset", async () => {
    delete process.env.AUTH_SECRET;
    vi.resetModules();
    const { authSecretSecure } = await import("./auth");
    expect(authSecretSecure()).toBe(false);
  });

  it("is false when AUTH_SECRET is the dev default", async () => {
    process.env.AUTH_SECRET = "reframe-dev-secret-change-me-in-production";
    vi.resetModules();
    const { authSecretSecure } = await import("./auth");
    expect(authSecretSecure()).toBe(false);
  });

  it("is true when a real secret is configured", async () => {
    process.env.AUTH_SECRET = "a-strong-randomly-generated-secret-value";
    vi.resetModules();
    const { authSecretSecure } = await import("./auth");
    expect(authSecretSecure()).toBe(true);
  });
});
