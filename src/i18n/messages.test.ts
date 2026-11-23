import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { defaultStage, stageText, stages } from "@/app/[locale]/exemple/demo";
import en from "./messages/en.json";
import fr from "./messages/fr.json";

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ""): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((out, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? { ...out, [path]: value } : { ...out, ...flatten(value, path) };
  }, {});
}

describe("messages", () => {
  const frFlat = flatten(fr);
  const enFlat = flatten(en);

  it("fr and en have the same keys", () => {
    expect(Object.keys(enFlat).sort()).toEqual(Object.keys(frFlat).sort());
  });

  it("no message is empty", () => {
    for (const [key, value] of Object.entries({ ...frFlat, ...enFlat })) {
      expect(value.trim(), key).not.toBe("");
    }
  });
});

// Every stage brings these itself (lists by their first item); the rest of
// its keys are optional, as long as they belong to the stage text.
const required = [
  "header.carnet",
  "steps.0.badge",
  "steps.1.title",
  "steps.1.p.1",
  "steps.1.quote",
  "steps.2.intro",
  "steps.4.title",
  "steps.4.p.1",
  "steps.4.quote",
  "steps.4.invite",
  "steps.5.title",
  "steps.5.items.1",
  "steps.5.quote",
  "questions.1.title",
  "questions.1.quote",
];
// La transmission is the handover, not an age: no articles, a step 4
// of fill-in lines only, and a letter in place of the keepsake list.
const requiredFor = (stage: string) =>
  stage === "transmission"
    ? [
        ...required.filter((key) => !/^steps\.(4\.(p\.1|quote|invite)|5\.items\.1)$/.test(key)),
        "steps.4.fields.1",
        "steps.5.lead",
        "steps.5.choices.1",
        "steps.5.choices.2",
        "questions.1.fields.1",
        "steps.5.letter.title",
        "steps.5.letter.p.1",
      ]
    : required;
const isStageText = (key: string) => stageText.some((part) => key === part || key.startsWith(`${part}.`));
// Every key a stage may have, so a misspelled optional key fails here
// instead of silently not showing.
const allowed = [
  /^header\.carnet$/,
  /^steps\.0\.badge$/,
  /^steps\.[1-5]\.(label|next)$/,
  /^steps\.3\.lead$/,
  /^steps\.1\.(title|subtitle|quote|p\.\d+)$/,
  /^steps\.2\.(title|intro|quote)$/,
  /^steps\.4\.(title|subtitle|after|quote|invite|p\.\d+|fields\.\d+)$/,
  /^steps\.5\.(title|quote|items\.\d+|fields\.\d+|lead|choices\.\d+|letter\.(title|p\.\d+|fields\.\d+))$/,
  /^questions\.\d+\.(title|lead|prompt|field|quote|options\.\d+|note|items\.\d+|fields\.\d+|short\.\d+|blocks\.\d+\.(lead|field|note|options\.\d+|choices\.\d+|items\.\d+))$/,
  /^articles\.[a-z]+\.(title|summary|p\.\d+|points\.\d+|closing\.\d+)$/,
];

describe("stage text", () => {
  const files = stages
    .filter((stage) => stage !== defaultStage)
    .map((stage) => {
      const read = (locale: string) =>
        flatten(JSON.parse(readFileSync(new URL(`./stages/${locale}/${stage}.json`, import.meta.url), "utf8")));
      return { stage, fr: read("fr"), en: read("en") };
    });
  const fourFive = Object.fromEntries(Object.entries(flatten(fr.Exemple)).filter(([key]) => isStageText(key)));

  for (const { stage, fr: own, en: ownEn } of [{ stage: defaultStage, fr: fourFive, en: fourFive }, ...files]) {
    it(`${stage} has the stage text it needs, and nothing else`, () => {
      const keys = Object.keys(own);
      for (const key of requiredFor(stage)) expect(keys, key).toContain(key);
      for (const key of keys)
        expect(
          allowed.some((pattern) => pattern.test(key)),
          key,
        ).toBe(true);
      for (const [key, value] of Object.entries({ ...own, ...ownEn })) expect(value.trim(), key).not.toBe("");
      // Each question and each article is complete.
      for (const n of new Set(keys.filter((k) => k.startsWith("questions.")).map((k) => k.split(".")[1]))) {
        expect(keys).toContain(`questions.${n}.title`);
        expect(keys).toContain(`questions.${n}.quote`);
      }
      for (const slug of new Set(keys.filter((k) => k.startsWith("articles.")).map((k) => k.split(".")[1]))) {
        for (const key of ["title", "p.1"]) expect(keys).toContain(`articles.${slug}.${key}`);
        // "phrases" is laid out as an intro, five phrase pairs and a conclusion.
        if (slug === "phrases") for (let i = 1; i <= 12; i++) expect(keys).toContain(`articles.phrases.p.${i}`);
      }
    });

    it(`${stage} has the same keys in fr and en`, () => {
      expect(Object.keys(ownEn).sort()).toEqual(Object.keys(own).sort());
    });
  }
});
