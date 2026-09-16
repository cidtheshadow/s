const fs = require('fs');
const code = fs.readFileSync('apps/backend/src/index.ts.clean', 'utf8');
const match = code.match(/const INDEX_HTML = "([\s\S]*?)";\n\n\/\/ Global Middleware/);
if (match) {
  // Need to unescape the JSON string literal to actual HTML
  let html = match[1];
  try {
    html = JSON.parse('"' + html + '"');
  } catch (e) {
    console.error("JSON parse failed, trying direct unescape");
    html = html.replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }
  fs.writeFileSync('previous_ui.html', html);
  console.log("Extracted HTML successfully.");
} else {
  console.log("No match found.");
}
