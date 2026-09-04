#!/usr/bin/env node
/**
 * Static validation for News editorial schema (PR #47).
 * Does not require a running database.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function readJson(relativePath) {
  const full = join(root, relativePath);
  if (!existsSync(full)) {
    throw new Error(`Missing file: ${relativePath}`);
  }
  return JSON.parse(readFileSync(full, "utf8"));
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const news = readJson("src/api/news-item/content-types/news-item/schema.json");

assert(news.options?.draftAndPublish === true, "News must have draftAndPublish: true");
assert(news.pluginOptions?.i18n?.localized === true, "News must be i18n localized");

const attrs = news.attributes ?? {};
const requiredFields = [
  "title",
  "slug",
  "excerpt",
  "published_date",
  "location_date",
  "cover",
  "lead_points",
  "content",
  "featured",
  "order",
  "seo_title",
  "seo_description",
  "category",
];

for (const field of requiredFields) {
  assert(field in attrs, `News missing field: ${field}`);
}

assert(attrs.content.type === "dynamiczone", "content must be dynamiczone");
const dzComponents = attrs.content.components ?? [];
const expectedDz = [
  "content.paragraph",
  "content.heading",
  "content.image",
  "content.quote",
];
for (const comp of expectedDz) {
  assert(dzComponents.includes(comp), `Dynamic zone missing component: ${comp}`);
}

assert(attrs.lead_points.component === "news.lead-point", "lead_points must use news.lead-point");
assert(attrs.lead_points.repeatable === true, "lead_points must be repeatable");

assert(attrs.cover.allowedTypes?.includes("images"), "cover must allow images only");
assert(attrs.cover.multiple === false, "cover must be single media");

const localized = (name) => attrs[name]?.pluginOptions?.i18n?.localized === true;
const shared = (name) => attrs[name]?.pluginOptions?.i18n?.localized === false;

for (const name of ["title", "slug", "excerpt", "location_date", "lead_points", "content", "seo_title", "seo_description"]) {
  assert(localized(name), `${name} must be localized`);
}
for (const name of ["published_date", "cover", "featured", "order", "category"]) {
  assert(shared(name), `${name} must not be localized`);
}

const imageComp = readJson("src/components/content/image.json");
assert(imageComp.attributes?.image?.allowedTypes?.includes("images"), "content.image.image must be images only");
assert(imageComp.attributes?.image?.required === true, "content.image.image must be required");

const headingComp = readJson("src/components/content/heading.json");
assert(headingComp.attributes?.level?.enum?.includes("h2"), "heading level must include h2");
assert(headingComp.attributes?.level?.enum?.includes("h3"), "heading level must include h3");

console.log("News editorial schema validation passed.");
console.log(`  Fields: ${requiredFields.join(", ")}`);
console.log(`  Dynamic zone: ${dzComponents.join(", ")}`);
console.log("  draftAndPublish: true");
console.log("  i18n: es/en field split OK");
