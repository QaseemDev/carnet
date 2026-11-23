import { describe, expect, it } from "vitest";
import { ageLabel, ageRanges, rangeIndex } from "./ages";

describe("timeline ages", () => {
  it("labels each slider position", () => {
    expect([-1, 0, 1, 12].map(ageLabel)).toEqual(["desire", "birth", "age", "age"]);
  });

  it("finds the range of an age", () => {
    expect([-1, 0, 1, 2, 12, 17, 18].map((age) => ageRanges[rangeIndex(age)].key)).toEqual([
      "desire",
      "baby",
      "baby",
      "early",
      "preteen",
      "teen",
      "handover",
    ]);
  });
});
