import { expect, test } from "vitest";
import { formatAge } from "./format";

test("formats month ranges for babies", () => {
  expect(formatAge(0, 6)).toBe("0–6 months");
  expect(formatAge(6, 12)).toBe("6–12 months");
});

test("switches to years past 24 months", () => {
  expect(formatAge(36, 60)).toBe("3–5 years");
  expect(formatAge(24, 36)).toBe("2–3 years");
});

test("handles open-ended and capped ranges", () => {
  expect(formatAge(36, null)).toBe("3 years+");
  expect(formatAge(null, 12)).toBe("Up to 12 months");
  expect(formatAge(null, null)).toBeNull();
});

test("mixed units stay readable", () => {
  expect(formatAge(12, 36)).toBe("12 months – 3 years");
});

test("singular units are not pluralised", () => {
  expect(formatAge(12, null)).toBe("12 months+");
  expect(formatAge(null, 1)).toBe("Up to 1 month");
});
