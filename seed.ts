/**
 * Validates `seed_data.json` for `seed_lambda.py` / `seed_api.py`.
 * Run: npx tsx seed.ts   (or compile & node)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedPath = path.join(__dirname, "seed_data.json");

const REQUIRED = [
  "branches",
  "users",
  "students",
  "classes",
  "curriculum",
  "lessonProgress",
  "lessonPlans",
  "studentReports",
] as const;

function main() {
  const raw = fs.readFileSync(seedPath, "utf8");
  const data = JSON.parse(raw) as Record<string, unknown>;
  for (const key of REQUIRED) {
    if (!(key in data)) throw new Error(`seed_data.json missing key: ${key}`);
    if (!Array.isArray(data[key])) throw new Error(`seed_data.json "${key}" must be an array`);
  }
  fs.writeFileSync(seedPath, JSON.stringify(data, null, 2));
  console.log("seed_data.json OK — required keys present and file pretty-printed.");
}

main();
