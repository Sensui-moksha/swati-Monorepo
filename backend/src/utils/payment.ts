import crypto from "crypto";

export function generatePaymentReference(prefix = "pay"): string {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

export function generateInvoiceNumber(prefix = "INV"): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, "")
    .slice(0, 14);
  return `${prefix}-${stamp}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export function normalizeMoney(amount: number): number {
  return Math.round((Number.isFinite(amount) ? amount : 0) * 100) / 100;
}

export function safeJson(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return { value };
}
