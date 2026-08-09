import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Mail, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Swathi Publications" },
      { name: "description", content: "Get in touch with our editors and support." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <div className="container-edit py-14">
        <div className="eyebrow">Contact</div>
        <h1 className="mt-2 font-serif text-5xl">Reach the newsroom</h1>

        <div className="mt-10 grid md:grid-cols-2 gap-12">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Field label="Your name">
              <input
                className="w-full border border-input px-3 py-2.5 focus:outline-none focus:border-primary"
                placeholder="Full name"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                className="w-full border border-input px-3 py-2.5 focus:outline-none focus:border-primary"
                placeholder="you@example.com"
              />
            </Field>
            <Field label="Subject">
              <input
                className="w-full border border-input px-3 py-2.5 focus:outline-none focus:border-primary"
                placeholder="What is this about?"
              />
            </Field>
            <Field label="Message">
              <textarea
                rows={6}
                className="w-full border border-input px-3 py-2.5 focus:outline-none focus:border-primary"
                placeholder="Tell us more..."
              />
            </Field>
            <button className="bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90">
              Send message
            </button>
          </form>

          <aside className="space-y-6">
            <ContactItem icon={Mail} label="Editorial" value="editor@swathi.example" />
            <ContactItem icon={Mail} label="Support" value="support@swathi.example" />
            <ContactItem icon={Phone} label="Subscriptions" value="+91 44 4000 0000" />
            <ContactItem icon={MapPin} label="Newsroom" value="Swathi Complex, Vijayawada 520002" />
            <div className="border border-rule p-6 bg-secondary/50 mt-8">
              <div className="eyebrow">Tip line</div>
              <p className="mt-2 text-sm">
                Have a story? Send tips securely to{" "}
                <span className="text-primary">tips@swathi.example</span>. We protect our sources.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </SiteLayout>
  ),
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow block mb-1.5">{label}</span>
      {children}
    </label>
  );
}
function ContactItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex gap-4">
      <Icon className="h-5 w-5 text-primary mt-0.5" />
      <div>
        <div className="eyebrow">{label}</div>
        <div className="mt-1">{value}</div>
      </div>
    </div>
  );
}
