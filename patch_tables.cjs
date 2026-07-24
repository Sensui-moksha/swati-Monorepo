const fs = require('fs');
const path = require('path');

const dir = './src/routes';
const genericTables = [
  "admin.reports.scheduled.tsx",
  "admin.rec-analytics.tsx",
  "admin.reports.library.tsx",
  "admin.reports.exports.tsx"
];

for (const file of genericTables) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  if (content.includes('useAdminGeneric')) continue;

  const entity = file.replace('admin.', '').replace('.tsx', '');
  const routeMatch = content.match(/export const Route = createFileRoute\("([^"]+)"\)\(\{\s*component:\s*\(\)\s*=>\s*\(([\s\S]+)\),\s*\}\);/);
  
  if (routeMatch) {
    const routePath = routeMatch[1];
    let jsx = routeMatch[2].trim();
    
    const arrayFromMatch = jsx.match(/\{Array\.from\(\{[^}]*\}\)\.map\(\(_,i\)=>\(\s*<tr key=\{i\}[^>]*>([\s\S]*?)<\/tr>\s*\)\)\}/);
    
    if (arrayFromMatch) {
      let trContent = arrayFromMatch[1];
      trContent = trContent.replace(/>[A-Za-z -]+ record #\{1000\+i\}</, `>{row.name || '${entity} record #' + row.id}<`);
      trContent = trContent.replace(/>\{\["Active","Draft","Archived","Active"\]\[i%4\]\}</, `>{row.status || 'Active'}<`);
      trContent = trContent.replace(/>\{\["R. Iyer","M. Sundaram","N. Ravi","S. Krishnan"\]\[i%4\]\}</, `>{row.owner || 'System'}<`);
      trContent = trContent.replace(/>2026-07-\{String\(13-\(i%13\)\)\.padStart\(2,'0'\)\}</, `>{row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : '-'}<`);
      
      const newMap = `
            {isLoading ? (
              <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center">No records found</td></tr>
            ) : items.map((row: any) => (
              <tr key={row.id} className="border-t border-rule/50 hover:bg-secondary/30">
                ${trContent.trim()}
              </tr>
            ))}
      `.trim();
      
      jsx = jsx.replace(arrayFromMatch[0], newMap);
      jsx = jsx.replace(/<span>Showing 1–12 of 248<\/span>/, `<span>Showing {items.length} of {data?.meta?.total ?? items.length}</span>`);
      
      const newContent = `import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/shells";
import { PageHeader, Btn, StatusPill, KpiCard, Card } from "@/components/ui-primitives";
import { useAdminGeneric } from "@/lib/api/hooks";

export const Route = createFileRoute("${routePath}")({
  component: Page,
});

function Page() {
  const { data, isLoading } = useAdminGeneric("${entity}");
  const items = data?.data ?? [];

  return (
    ${jsx}
  );
}
`;
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log('Patched', file);
    }
  }
}
