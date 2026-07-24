const fs = require('fs');
const path = require('path');

const dir = './src/routes';
const files = fs.readdirSync(dir).filter(f => f.startsWith('admin.settings.') && f !== 'admin.settings.tsx');

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');

  // Skip if already processed
  if (content.includes('useSettings')) return;

  // Extract Route path
  const routeMatch = content.match(/createFileRoute\("([^"]+)"\)/);
  const routePath = routeMatch ? routeMatch[1] : '';
  
  // Extract title and description from SettingsShell
  const shellMatch = content.match(/<SettingsShell title="([^"]+)" description="([^"]+)">/);
  const shellTitle = shellMatch ? shellMatch[1] : 'Settings';
  const shellDesc = shellMatch ? shellMatch[2] : '';
  
  // Extract Card title
  const cardMatch = content.match(/<Card title="([^"]+)">/);
  const cardTitle = cardMatch ? cardMatch[1] : 'Settings';

  const newContent = `import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, SettingsShell } from "@/components/shells";
import { Card, Btn } from "@/components/ui-primitives";
import { useSettings } from "@/lib/api/hooks";

export const Route = createFileRoute("${routePath}")({
  component: SettingsPage,
});

function SettingsPage() {
  const category = "${routePath.split('/').pop()}";
  const { data, isLoading } = useSettings(category);
  const fields = data?.data?.fields || ["Field label","Second field","Third field"];

  return (
    <AdminShell>
      <SettingsShell title="${shellTitle}" description="${shellDesc}">
        <div className="grid gap-6">
          <Card title="${cardTitle}">
            {isLoading ? (
               <div className="p-4 space-y-4 animate-pulse">
                 <div className="h-12 bg-secondary/50 rounded w-full" />
                 <div className="h-12 bg-secondary/50 rounded w-full" />
                 <div className="h-12 bg-secondary/50 rounded w-full" />
               </div>
            ) : (
            <div className="space-y-4">
              {fields.map((f: any)=>(
                <label key={f.id || f} className="block"><span className="text-xs uppercase tracking-widest text-muted-foreground">{f.label || f}</span><input className="mt-1 w-full border border-rule bg-paper rounded px-3 py-2 text-sm" placeholder="Sample value" defaultValue={f.value || ""} /></label>
              ))}
              <div className="flex gap-2 pt-2"><Btn>Save changes</Btn><Btn variant="outline">Discard</Btn></div>
            </div>
            )}
          </Card>
        </div>
      </SettingsShell>
    </AdminShell>
  );
}
`;

  fs.writeFileSync(filePath, newContent, 'utf-8');
});
console.log('Patched all settings files.');
