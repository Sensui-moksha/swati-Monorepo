const fs = require('fs');
const path = require('path');

const dir = './src/routes';
const files = fs.readdirSync(dir).filter(f => f.startsWith('admin.') && f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace remaining uses of `i` that break compilation
  let modified = false;
  
  // Replace status={["Active","Draft","Archived","Active"][i%4]}
  if (content.match(/status=\{\["Active","Draft","Archived","Active"\]\[i%4\]\}/)) {
    content = content.replace(/status=\{\["Active","Draft","Archived","Active"\]\[i%4\]\}/g, `status={row.status || 'Active'}`);
    modified = true;
  }
  
  // Replace any other [i%4] or [i%X] used inside JSX props
  if (content.match(/\{\[[^\]]+\]\[i%\d+\]\}/)) {
    content = content.replace(/\{\[[^\]]+\]\[i%\d+\]\}/g, `{'Mock data'}`);
    modified = true;
  }
  
  if (content.match(/\{1000\+i\}/)) {
    content = content.replace(/\{1000\+i\}/g, `{row.id || 'N/A'}`);
    modified = true;
  }
  
  if (content.match(/13-\(i%13\)/)) {
    content = content.replace(/2026-07-\{String\(13-\(i%13\)\)\.padStart\(2,'0'\)\}/g, `{row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-'}`);
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Fixed', file);
  }
}
