import { describe, expect, it } from "vitest";
import { API_BASE_URL, DEMO_MODE, PAGE_SIZE } from "@/lib/env";

describe("env", () => {
  it("falls back to the local Laravel API", () => {
    expect(API_BASE_URL).toBe("http://localhost/api/v1/");
  });

  it("always ends in a slash so axios joins relative paths correctly", () => {
    expect(API_BASE_URL.endsWith("/")).toBe(true);
  });

  it("keeps demo mode off unless it is explicitly switched on", () => {
    expect(DEMO_MODE).toBe(false);
  });

  it("uses a sane default page size", () => {
    expect(PAGE_SIZE).toBe(8);
  });
});
