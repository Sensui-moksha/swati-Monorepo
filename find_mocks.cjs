const fs = require("fs");
const path = require("path");

const dir = "./src/routes";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".tsx"));

const mockFiles = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(dir, file), "utf8");
  // Look for Array.from that are NOT just `<div className="animate-pulse"`
  if (content.includes("Array.from")) {
    // Check if it has <tr> or actual text data inside the map
    if (
      content.includes("<tr key={i}") ||
      content.includes("record #") ||
      content.match(/Array\.from\(\{length:\d+\}\)\.map\(\(_,i\)=>\(/) ||
      content.match(/\{Array\.from\(\{\s*length:\s*[4-8]\s*\}\)\.map\(\(_, i\) => \(\s*<Link/)
    ) {
      mockFiles.push(file);
    }
  }
}
console.log("Found mock files:", mockFiles.length);
console.log(mockFiles.join("\n"));
