const fs = require('fs');
const html = fs.readFileSync('public/index.html', 'utf8');
const escaped = JSON.stringify(html);
let template = fs.readFileSync('apps/backend/src/index.ts', 'utf8');

const before = template.substring(0, template.indexOf('const INDEX_HTML ='));
const afterRegex = /const INDEX_HTML = [\s\S]*?;/;
const match = template.match(afterRegex);
if (match) {
    const after = template.substring(template.indexOf(match[0]) + match[0].length);
    fs.writeFileSync('apps/backend/src/index.ts', before + 'const INDEX_HTML = ' + escaped + ';' + after);
    console.log("Injected UI safely.");
} else {
    console.log("Could not find INDEX_HTML block.");
}
