import { useState, useEffect } from "react";
import { useSettings, useUpdateSettings } from "@/lib/api/hooks";
import { Card, Btn } from "@/components/ui-primitives";
import { toast } from "sonner";

interface Field {
  id: string;
  label: string;
  value: any;
  type?: "text" | "number" | "boolean" | "select" | "color" | "password" | "textarea";
  options?: string[];
  description?: string;
  readOnly?: boolean;
}

interface SettingsCategoryFormProps {
  category: string;
  title?: string;
  description?: string;
}

export function SettingsCategoryForm({ category, title, description }: SettingsCategoryFormProps) {
  const { data, isLoading } = useSettings(category);
  const updateSettings = useUpdateSettings();

  const rawFields: Field[] = data?.data?.fields || [];
  const displayTitle =
    title || data?.data?.title || category.charAt(0).toUpperCase() + category.slice(1);
  const displayDescription =
    description || data?.data?.description || `${displayTitle} platform settings.`;

  const [formState, setFormState] = useState<Record<string, any>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Sync initial server values into local state
  useEffect(() => {
    if (rawFields.length > 0) {
      const initial: Record<string, any> = {};
      rawFields.forEach((f) => {
        initial[f.id] = f.value;
      });
      setFormState(initial);
    }
  }, [data]);

  const getValue = (f: Field) => {
    return formState[f.id] !== undefined ? formState[f.id] : f.value;
  };

  const handleChange = (id: string, val: any) => {
    setFormState((prev) => ({ ...prev, [id]: val }));
  };

  const handleSave = () => {
    const updatedFields = rawFields.map((f) => ({
      ...f,
      value: formState[f.id] !== undefined ? formState[f.id] : f.value,
    }));

    // If branding, apply live theme effects
    if (category === "branding") {
      const primary = formState["primaryColor"];
      if (primary) {
        document.documentElement.style.setProperty("--primary", primary);
      }
      const themeMode = formState["themeMode"];
      if (themeMode === "dark") {
        document.documentElement.classList.add("dark");
      } else if (themeMode === "light") {
        document.documentElement.classList.remove("dark");
      }
    }

    updateSettings.mutate(
      {
        category,
        data: {
          category,
          title: displayTitle,
          description: displayDescription,
          fields: updatedFields,
        },
      },
      {
        onSuccess: () => toast.success(`${displayTitle} settings saved successfully`),
        onError: () => toast.error("Failed to save settings"),
      },
    );
  };

  const handleDiscard = () => {
    const resetState: Record<string, any> = {};
    rawFields.forEach((f) => {
      resetState[f.id] = f.value;
    });
    setFormState(resetState);
    toast.info("Changes discarded");
  };

  return (
    <div className="grid gap-6 max-w-4xl">
      <Card title={`${displayTitle} Settings`}>
        {isLoading ? (
          <div className="p-4 space-y-4 animate-pulse">
            <div className="h-12 bg-secondary/50 rounded w-full" />
            <div className="h-12 bg-secondary/50 rounded w-full" />
            <div className="h-12 bg-secondary/50 rounded w-full" />
          </div>
        ) : rawFields.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground text-sm">
            No settings fields found.
          </div>
        ) : (
          <div className="space-y-6">
            {rawFields.map((f) => {
              const currentValue = getValue(f);
              const isReadOnly = !!f.readOnly;

              return (
                <div
                  key={f.id}
                  className="pb-4 border-b border-rule/50 last:border-0 last:pb-0 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                      {f.label}
                    </label>
                    {isReadOnly && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-rule">
                        Read-Only
                      </span>
                    )}
                  </div>

                  {/* Render based on input type */}
                  {f.type === "boolean" ? (
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() => handleChange(f.id, !currentValue)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                          currentValue ? "bg-primary" : "bg-muted-foreground/30"
                        } ${isReadOnly ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            currentValue ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="text-sm font-medium">
                        {currentValue ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  ) : f.type === "select" ? (
                    <select
                      disabled={isReadOnly}
                      value={currentValue ?? ""}
                      onChange={(e) => handleChange(f.id, e.target.value)}
                      className="w-full border border-rule bg-paper rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                    >
                      {(f.options || []).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "color" ? (
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        disabled={isReadOnly}
                        value={currentValue || "#000000"}
                        onChange={(e) => handleChange(f.id, e.target.value)}
                        className="h-9 w-12 rounded cursor-pointer border border-rule bg-paper p-0.5 disabled:opacity-60"
                      />
                      <input
                        type="text"
                        disabled={isReadOnly}
                        value={currentValue ?? ""}
                        onChange={(e) => handleChange(f.id, e.target.value)}
                        className="w-full border border-rule bg-paper rounded-md px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                      />
                    </div>
                  ) : f.type === "password" ? (
                    <div className="relative">
                      <input
                        type={showPasswords[f.id] ? "text" : "password"}
                        disabled={isReadOnly}
                        value={currentValue ?? ""}
                        onChange={(e) => handleChange(f.id, e.target.value)}
                        className="w-full border border-rule bg-paper rounded-md px-3 py-2 text-sm pr-16 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((p) => ({ ...p, [f.id]: !p[f.id] }))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground hover:text-foreground px-2 py-1"
                      >
                        {showPasswords[f.id] ? "Hide" : "Show"}
                      </button>
                    </div>
                  ) : f.type === "textarea" ? (
                    <textarea
                      rows={3}
                      disabled={isReadOnly}
                      value={currentValue ?? ""}
                      onChange={(e) => handleChange(f.id, e.target.value)}
                      className="w-full border border-rule bg-paper rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 resize-y"
                    />
                  ) : (
                    <input
                      type={f.type === "number" ? "number" : "text"}
                      disabled={isReadOnly}
                      value={currentValue ?? ""}
                      onChange={(e) =>
                        handleChange(
                          f.id,
                          f.type === "number" ? Number(e.target.value) : e.target.value,
                        )
                      }
                      className="w-full border border-rule bg-paper rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60"
                    />
                  )}

                  {f.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">
                      {f.description}
                    </p>
                  )}
                </div>
              );
            })}

            <div className="flex gap-3 pt-4 border-t border-rule">
              <Btn onClick={handleSave} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? "Saving..." : "Save changes"}
              </Btn>
              <Btn variant="outline" onClick={handleDiscard}>
                Discard
              </Btn>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
