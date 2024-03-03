import { describe, expect, it } from "vitest";
import {
  formatCountdown,
  formatDateTime,
  isFutureLocalInput,
  localInputMin,
  localInputToIso,
  millisecondsUntil,
  parseServerDate,
} from "@/lib/datetime";

describe("parseServerDate", () => {
  it("reads the backend's naive datetime as UTC", () => {
    const parsed = parseServerDate("2024-03-01 12:00:00");
    expect(parsed).toBeInstanceOf(Date);
    expect(parsed.toISOString()).toBe("2024-03-01T12:00:00.000Z");
  });

  it("accepts a naive value without seconds", () => {
    expect(parseServerDate("2024-03-01 12:00").toISOString()).toBe("2024-03-01T12:00:00.000Z");
  });

  it("keeps an explicit offset intact", () => {
    expect(parseServerDate("2024-03-01T12:00:00+02:00").toISOString()).toBe(
      "2024-03-01T10:00:00.000Z"
    );
  });

  it("passes Date and epoch values straight through", () => {
    const date = new Date("2024-03-01T00:00:00Z");
    expect(parseServerDate(date)).toBe(date);
    expect(parseServerDate(date.getTime()).toISOString()).toBe(date.toISOString());
  });

  it("returns null rather than an Invalid Date", () => {
    expect(parseServerDate(null)).toBeNull();
    expect(parseServerDate("")).toBeNull();
    expect(parseServerDate(undefined)).toBeNull();
    expect(parseServerDate("not a date")).toBeNull();
    expect(parseServerDate(new Date("nope"))).toBeNull();
  });
});

describe("millisecondsUntil", () => {
  const now = Date.UTC(2024, 2, 1, 12, 0, 0);

  it("counts forward to a future instant", () => {
    expect(millisecondsUntil("2024-03-01 12:00:30", now)).toBe(30_000);
  });

  it("floors at zero once the moment has passed", () => {
    expect(millisecondsUntil("2024-03-01 11:59:00", now)).toBe(0);
  });

  it("treats an unparseable value as elapsed", () => {
    expect(millisecondsUntil("garbage", now)).toBe(0);
  });
});

describe("formatCountdown", () => {
  it("pads a sub-day duration to hh:mm:ss", () => {
    expect(formatCountdown(1000 * (3 * 3600 + 4 * 60 + 5))).toBe("03:04:05");
  });

  it("breaks days out instead of reporting 748 hours", () => {
    expect(formatCountdown(1000 * (31 * 86400 + 4 * 3600 + 5 * 60 + 6))).toBe("31d 04:05:06");
  });

  it("renders zero and negative durations as 00:00:00", () => {
    expect(formatCountdown(0)).toBe("00:00:00");
    expect(formatCountdown(-5000)).toBe("00:00:00");
  });
});

describe("localInputToIso", () => {
  it("turns a datetime-local value into an absolute instant", () => {
    const iso = localInputToIso("2024-03-01T12:00");
    expect(iso).toBe(new Date(2024, 2, 1, 12, 0).toISOString());
    expect(iso.endsWith("Z")).toBe(true);
  });

  it("returns null for empty or invalid input", () => {
    expect(localInputToIso("")).toBeNull();
    expect(localInputToIso("tomorrow")).toBeNull();
  });
});

describe("isFutureLocalInput", () => {
  const now = new Date(2024, 2, 1, 12, 0).getTime();

  it("accepts a later local time", () => {
    expect(isFutureLocalInput("2024-03-01T12:01", now)).toBe(true);
  });

  it("rejects the present moment and the past", () => {
    expect(isFutureLocalInput("2024-03-01T12:00", now)).toBe(false);
    expect(isFutureLocalInput("2024-02-29T12:00", now)).toBe(false);
    expect(isFutureLocalInput("", now)).toBe(false);
  });
});

describe("localInputMin", () => {
  it("formats the current local time for a datetime-local min attribute", () => {
    const now = new Date(2024, 2, 1, 9, 5).getTime();
    expect(localInputMin(now)).toBe("2024-03-01T09:05");
  });
});

describe("formatDateTime", () => {
  it("renders a readable local timestamp", () => {
    expect(formatDateTime("2024-03-01 12:00:00", "en-GB")).toContain("2024");
  });

  it("falls back to an em dash when there is nothing to show", () => {
    expect(formatDateTime(null)).toBe("—");
    expect(formatDateTime("nonsense")).toBe("—");
  });
});
