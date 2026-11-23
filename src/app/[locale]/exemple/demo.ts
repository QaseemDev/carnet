// Shape of the 4–5 years demo. Copy lives in `Exemple.*`; these are the counts
// of its numbered keys.

// No track in the prototype: the button stays hidden until the client confirms
// one and its rights. Turning it on needs this and the audio file.
export const hasMusic = false;

// The welcome page (step 0), then steps 1–5.
export const stepCount = 6;

// Questions, articles and lists come in different numbers per stage, so they
// are counted from the stage's own text: `numbered(t.raw(...))`.
export const numbered = (list: unknown) => Object.keys((list ?? {}) as object);
// The first 3 questions are shown, the rest behind "Découvrir d'autres questions".
export const shownQuestions = 3;

// The keys of `Exemple` that change with the life stage. A stage page drops
// all of them from the 4–5 text and takes its own, so nothing optional (a
// subtitle, a fifth article) leaks from 4–5 into another stage.
export const stageText = [
  "header.carnet",
  "steps.0.badge",
  "steps.1.title",
  "steps.1.p",
  "steps.1.quote",
  "steps.2.intro",
  "steps.2.quote",
  "steps.4.title",
  "steps.4.subtitle",
  "steps.4.p",
  "steps.4.fields",
  "steps.4.after",
  "steps.4.quote",
  "steps.4.invite",
  "steps.5.title",
  "steps.5.items",
  "steps.5.fields",
  "steps.5.quote",
  "questions",
  "articles",
];

// Placeholder actions: each opens the info popup with its title and line.
export type InfoKey = "expression" | "feuilleter" | "audio" | "video" | "photo" | "text";

export const range = (n: number) => Array.from({ length: n }, (_, i) => String(i + 1));

// Life stages in the stage picker, in order (client list).
// 4–5 is the original demo, its text in `Exemple.*`. Every other stage has its
// own text in `src/i18n/stages/<locale>/<stage>.json` (the `stageText` keys),
// shown on `/exemple/<stage>`. Every stage is the client's text (3–4 ans borrows
// 3–6 mois for now); the English is ours, pending client sign-off.
export const stages = [
  "desir",
  "grossesse",
  "accouchement",
  "parents",
  "0-3m",
  "3-6m",
  "6-9m",
  "9-12m",
  "12-24m",
  "2-3",
  "3-4",
  "4-5",
  "5-6",
  "6-7",
  "7-9",
  "9-11",
  "11-13",
  "13-15",
  "15-17",
  "17-18",
  "18",
  // The handover itself, last: no articles, writing prompts, a letter.
  "transmission",
  // Not ages either: life events that can come at any time, on the left menu, not in the picker.
  "naissance",
  "rupture",
] as const;
export type Stage = (typeof stages)[number];
export const defaultStage: Stage = "4-5";
export const isStage = (value: string): value is Stage => (stages as readonly string[]).includes(value);
export const stagePath = (stage: Stage) => (stage === defaultStage ? "/exemple" : `/exemple/${stage}`);
