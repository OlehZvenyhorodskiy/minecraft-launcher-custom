import { describe, expect, it } from "vitest";
import { buildJvmArgs, recommendedHeapGb } from "./jvmArgs";
import type { LauncherProfile } from "@shared/types";

describe("recommendedHeapGb", () => {
  it("keeps heap conservative by memory class", () => {
    expect(recommendedHeapGb(8)).toBe(4);
    expect(recommendedHeapGb(16)).toBe(10);
    expect(recommendedHeapGb(32)).toBe(16);
    expect(recommendedHeapGb(64)).toBe(20);
  });
});

describe("buildJvmArgs", () => {
  it("puts heap flags before tuning flags", () => {
    const profile = {
      ramMinGb: 2,
      ramMaxGb: 8,
      jvmArgs: ["-XX:+UseG1GC"]
    } as LauncherProfile;

    expect(buildJvmArgs(profile)).toEqual(["-Xms2G", "-Xmx8G", "-XX:+UseG1GC"]);
  });
});

