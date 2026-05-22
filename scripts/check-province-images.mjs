import fs from "fs";

const src = fs.readFileSync("lib/vietnamProvinces.ts", "utf8");
const block = src.match(/LOCAL_PROVINCE_IMAGE_BY_NAME[\s\S]*?\n};/)[0];
const re = /"([^"]+)":\s*"([^"]+)"/g;
const missing = [];
let m;
while ((m = re.exec(block))) {
  const [, name, url] = m;
  if (!url.startsWith("/")) continue;
  const rel = url.slice(1);
  if (!fs.existsSync(`public/${rel}`)) missing.push({ name, url });
}
console.log(`Missing province images: ${missing.length}`);
for (const x of missing) console.log(` - ${x.name} -> ${x.url}`);
