import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/shells";
import { PageHeader, Card, Btn, Label } from "@/components/ui-primitives";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "@/lib/api/endpoints/profile";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/account/preferences")({
  component: AccountPreferencesPage,
});

function AccountPreferencesPage() {
  const queryClient = useQueryClient();
  const { data: prefData, isLoading } = useQuery({
    queryKey: ["userPreferences"],
    queryFn: () => profileApi.getPreferences().then((r) => r.data),
  });

  const [theme, setTheme] = useState("system");
  const [language, setLanguage] = useState("en");
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    if (prefData) {
      if (prefData.theme) setTheme(prefData.theme);
      if (prefData.language) setLanguage(prefData.language);
      if (prefData.notifications?.email !== undefined) setEmailNotifs(prefData.notifications.email);
      if (prefData.readingPreferences?.fontSize) setFontSize(prefData.readingPreferences.fontSize);
    }
  }, [prefData]);

  const updatePref = useMutation({
    mutationFn: (newPref: any) => profileApi.updatePreferences(newPref).then((r) => r.data),
    onSuccess: () => {
      toast.success("Preferences updated successfully");
      queryClient.invalidateQueries({ queryKey: ["userPreferences"] });
    },
    onError: () => toast.error("Failed to update preferences"),
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updatePref.mutate({
      theme,
      language,
      notifications: { email: emailNotifs },
      readingPreferences: { fontSize: Number(fontSize) },
    });
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-secondary rounded animate-pulse" />
          ))}
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <PageHeader
        eyebrow="Account"
        title="Preferences"
        description="Customize theme, reading layout, and notification settings."
      />
      <Card title="Display & Reading Preferences">
        <form onSubmit={handleSave} className="space-y-6 max-w-lg">
          <div className="space-y-2">
            <Label htmlFor="theme">Appearance Theme</Label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full border border-rule bg-paper rounded px-3 py-2 text-sm"
            >
              <option value="system">System Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border border-rule bg-paper rounded px-3 py-2 text-sm"
            >
              <option value="en">English</option>
              <option value="te">Telugu</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fontSize">Reader Font Size ({fontSize}px)</Label>
            <input
              id="fontSize"
              type="range"
              min={12}
              max={24}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              id="emailNotifs"
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="h-4 w-4 rounded border-rule text-primary"
            />
            <Label htmlFor="emailNotifs" className="cursor-pointer font-normal">
              Receive email notifications for new articles and issue releases
            </Label>
          </div>

          <Btn type="submit" disabled={updatePref.isPending}>
            {updatePref.isPending ? "Saving..." : "Save Preferences"}
          </Btn>
        </form>
      </Card>
    </DashboardShell>
  );
}
