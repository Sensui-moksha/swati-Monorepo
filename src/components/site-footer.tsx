import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Linkedin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="rule-top mt-24 bg-secondary/40">
      <div className="container-edit py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="font-serif text-2xl">
              <span className="text-primary">Swathi</span> Publications
            </div>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              Independent journalism, long-form analysis, and cultural criticism since 1998.
            </p>
            <div className="mt-5 flex items-center gap-3 text-muted-foreground">
              <a href="#" aria-label="Facebook" className="hover:text-primary"><Facebook className="h-4 w-4" /></a>
              <a href="#" aria-label="X (formerly Twitter)" className="hover:text-primary">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="hover:text-primary"><Instagram className="h-4 w-4" /></a>
              <a href="#" aria-label="YouTube" className="hover:text-primary"><Youtube className="h-4 w-4" /></a>
              <a href="#" aria-label="LinkedIn" className="hover:text-primary"><Linkedin className="h-4 w-4" /></a>
            </div>
          </div>
          <FooterCol title="Company" links={[["About", "/about"], ["Careers", "/about"], ["Contact", "/contact"]]} />
          <FooterCol title="Resources" links={[["Publications", "/articles"], ["Categories", "/categories"], ["Pricing", "/pricing"]]} />
          <FooterCol title="Support" links={[["FAQs", "/contact"], ["Privacy Policy", "/about"], ["Terms of Service", "/about"], ["Admin", "/admin"]]} />
        </div>
        <div className="rule-top mt-10 pt-6 flex flex-col sm:flex-row justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Swathi Publications. All rights reserved.</span>
          <span>Printed and published from Chennai · RNI No. 61234/98</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="eyebrow mb-4">{title}</div>
      <ul className="space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link to={href} className="text-foreground/80 hover:text-primary">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
