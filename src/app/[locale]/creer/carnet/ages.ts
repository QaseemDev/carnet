// Step 7 timeline: the slider goes from -1 (Désir d'enfant) to 18; the
// "Tranche" buttons jump between these ranges (prototype `ageRanges`).
export const ageRanges = [
  { start: -1, key: "desire" },
  { start: 0, key: "baby" },
  { start: 2, key: "early" },
  { start: 5, key: "child" },
  { start: 11, key: "preteen" },
  { start: 13, key: "teen" },
  { start: 18, key: "handover" },
] as const;

export const minAge = -1;
export const maxAge = 18;

export function rangeIndex(age: number) {
  return ageRanges.findLastIndex((range) => age >= range.start);
}

// Message key under `Creation.carnet` for one slider position.
export function ageLabel(age: number) {
  return age < 0 ? "desire" : age === 0 ? "birth" : "age";
}
