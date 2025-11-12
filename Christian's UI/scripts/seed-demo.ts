import { mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { seedDemoData, getDemoSnapshot } from "../lib/data-store/demoStore";

async function main() {
  seedDemoData();
  const snapshot = getDemoSnapshot();
  const outfile = resolve(process.cwd(), "seed", "demo-data.json");
  mkdirSync(dirname(outfile), { recursive: true });
  writeFileSync(outfile, JSON.stringify(snapshot, null, 2));
  console.log(`Seeded demo data to ${outfile}`);
  console.log("Import this JSON into Firestore emulator or use it as fixture data.");
}

main();
