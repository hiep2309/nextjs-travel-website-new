import fs from "fs";

const p = "scripts/build-messages.mjs";
const s = fs.readFileSync(p, "utf8");
const i = s.indexOf("function deepClone");
const head = `import fs from "fs";

const vi = JSON.parse(fs.readFileSync("messages/vi.json", "utf8"));

`;
fs.writeFileSync(p, head + s.slice(i));
console.log("Updated build-messages.mjs to load messages/vi.json");
