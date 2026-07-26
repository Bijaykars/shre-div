import { expect, test } from "vitest";
import { hashPassword, verifyPassword } from "./password";

test("accepts the correct password", async () => {
  const stored = await hashPassword("correct horse battery");
  expect(await verifyPassword("correct horse battery", stored)).toBe(true);
});

test("rejects the wrong password", async () => {
  const stored = await hashPassword("correct horse battery");
  expect(await verifyPassword("Correct horse battery", stored)).toBe(false);
  expect(await verifyPassword("", stored)).toBe(false);
});

test("salts each hash, so identical passwords store differently", async () => {
  const a = await hashPassword("same-password");
  const b = await hashPassword("same-password");
  expect(a).not.toBe(b);
  // ...and both still verify.
  expect(await verifyPassword("same-password", a)).toBe(true);
  expect(await verifyPassword("same-password", b)).toBe(true);
});

test("returns false for missing or malformed stored hashes instead of throwing", async () => {
  for (const bad of [null, "", "nosalt", "deadbeef:", ":deadbeef", "zz:zz"]) {
    expect(await verifyPassword("anything", bad)).toBe(false);
  }
});
