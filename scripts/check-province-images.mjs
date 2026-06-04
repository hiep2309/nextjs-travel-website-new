import fs from "fs";

const src = fs.readFileSync("lib/provinceDestinationImages.ts", "utf8");
const block = src.match(/PROVINCE_DESTINATION_FILE[\s\S]*?\};/)[0];
const re = /"([^"]+)":\s*"([^"]+)"/g;
const missing = [];
let m;
while ((m = re.exec(block))) {
  const [, name, file] = m;
  const path = `public/destinations/${file}`;
  if (!fs.existsSync(path)) missing.push({ name, file });
}
const onDisk = fs.readdirSync("public/destinations").filter((f) => !f.startsWith("."));
const mapped = new Set([...block.matchAll(/:\s*"([^"]+)"/g)].map((x) => x[1]));
const unmapped = onDisk.filter((f) => !mapped.has(f));

console.log(`Missing province images: ${missing.length}`);
for (const x of missing) console.log(` - ${x.name} -> ${x.file}`);
if (unmapped.length) {
  console.log(`Unmapped on disk: ${unmapped.join(", ")}`);
}
