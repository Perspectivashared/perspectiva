import { describe, it, expect } from "vitest";
import { computeSceneEnabled, type SceneEnv } from "./useSceneEnabled";

const base: SceneEnv = {
  hasWebGL2: true,
  reducedMotion: false,
  cores: 8,
  memory: 8,
  width: 1440,
};

describe("computeSceneEnabled", () => {
  it("enables on a capable desktop", () => {
    expect(computeSceneEnabled(base)).toBe(true);
  });

  it("disables without WebGL2", () => {
    expect(computeSceneEnabled({ ...base, hasWebGL2: false })).toBe(false);
  });

  it("disables on reduced motion", () => {
    expect(computeSceneEnabled({ ...base, reducedMotion: true })).toBe(false);
  });

  it("disables on low core count (<= 4)", () => {
    expect(computeSceneEnabled({ ...base, cores: 4 })).toBe(false);
  });

  it("disables on low device memory (<= 4)", () => {
    expect(computeSceneEnabled({ ...base, memory: 4 })).toBe(false);
  });

  it("disables below 768px (mobile → poster)", () => {
    expect(computeSceneEnabled({ ...base, width: 767 })).toBe(false);
  });

  it("enables exactly at 768px", () => {
    expect(computeSceneEnabled({ ...base, width: 768 })).toBe(true);
  });

  it("treats unknown memory (undefined) as sufficient", () => {
    expect(computeSceneEnabled({ ...base, memory: undefined })).toBe(true);
  });
});
