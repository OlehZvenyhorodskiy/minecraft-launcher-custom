import { describe, expect, it } from "vitest";
import { __testing } from "./modrinth";

describe("modrinthUrl", () => {
  it("encodes Modrinth loader and game version filters", () => {
    const url = new URL(__testing.modrinthUrl("sodium", "1.21.8"));
    expect(url.pathname).toBe("/v2/project/sodium/version");
    expect(url.searchParams.get("game_versions")).toBe("[\"1.21.8\"]");
    expect(url.searchParams.get("loaders")).toBe("[\"fabric\"]");
  });
});