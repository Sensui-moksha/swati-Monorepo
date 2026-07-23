import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { formatINR } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Cart — Swathi Publications" }] }),
  component: () => {
    const [items, setItems] = useState([
      { id: 1, name: "Digital + Print — Monthly", desc: "Auto-renew · Cancel anytime", price: 449, qty: 1 },
      { id: 2, name: "Print Anthology 2025", desc: "Hardback, 384 pages", price: 899, qty: 1 },
    ]);
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;
    return (
      <SiteLayout>
        <div className="container-edit py-12">
          <div className="eyebrow">Checkout</div>
          <h1 className="mt-2 font-serif text-4xl">Your cart</h1>

          <div className="mt-10 grid md:grid-cols-[minmax(0,1fr)_360px] gap-10">
            <div>
              <ul className="divide-y divide-rule border-y border-rule">
                {items.map((it) => (
                  <li key={it.id} className="py-5 grid grid-cols-[minmax(0,1fr)_auto_auto] gap-6 items-center">
                    <div>
                      <div className="font-serif text-lg">{it.name}</div>
                      <div className="text-xs text-muted-foreground">{it.desc}</div>
                    </div>
                    <div className="text-sm">{formatINR(it.price)}</div>
                    <button onClick={() => setItems(items.filter((i) => i.id !== it.id))} className="text-muted-foreground hover:text-primary" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                  </li>
                ))}
                {items.length === 0 && <li className="py-10 text-center text-muted-foreground">Your cart is empty. <Link to="/pricing" className="text-primary underline">Browse plans</Link></li>}
              </ul>
            </div>

            <aside className="border border-rule p-6 h-fit bg-secondary/40">
              <h3 className="font-serif text-xl">Order summary</h3>
              <div className="mt-5 space-y-2 text-sm">
                <Row label="Subtotal" value={formatINR(subtotal)} />
                <Row label="GST (18%)" value={formatINR(tax)} />
                <div className="rule-top pt-3 mt-3 flex justify-between font-serif text-lg"><span>Total</span><span>{formatINR(total)}</span></div>
              </div>
              <button disabled={items.length === 0} className="mt-6 w-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90 disabled:opacity-50">Proceed to payment</button>
              <div className="mt-3 text-xs text-muted-foreground text-center">Secure checkout · UPI, Card, Netbanking</div>
            </aside>
          </div>
        </div>
      </SiteLayout>
    );
  },
});

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>;
}
