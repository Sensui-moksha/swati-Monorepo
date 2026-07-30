import fs from "fs";
import path from "path";
import os from "os";
import { LinearizationService } from "../services/LinearizationService";

// Minimal linearized PDF header (contains /Linearized marker)
const linearizedHeader = Buffer.from(
  "%PDF-1.6\n1 0 obj\n<</Linearized 1 /L 1234567>>\n",
  "ascii",
);

// Non-linearized PDF header
const normalHeader = Buffer.from(
  "%PDF-1.4\n%âãÏÓ\n1 0 obj\n<</Type /Catalog>>\n",
  "ascii",
);

describe("LinearizationService", () => {
  let tmpDir: string;
  const svc = new LinearizationService();

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "pdf-test-"));
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  const writeTmpPDF = (name: string, content: Buffer): string => {
    const p = path.join(tmpDir, name);
    fs.writeFileSync(p, content);
    return p;
  };

  it("detects linearized PDF", async () => {
    const filePath = writeTmpPDF("linearized.pdf", linearizedHeader);
    const result = await svc.detectLinearization(filePath);
    expect(result.isLinearized).toBe(true);
    expect(result.pdfVersion).toBe("1.6");
  });

  it("detects non-linearized PDF", async () => {
    const filePath = writeTmpPDF("normal.pdf", normalHeader);
    const result = await svc.detectLinearization(filePath);
    expect(result.isLinearized).toBe(false);
    expect(result.pdfVersion).toBe("1.4");
  });

  it("handles empty file gracefully", async () => {
    const filePath = writeTmpPDF("empty.pdf", Buffer.alloc(0));
    const result = await svc.detectLinearization(filePath);
    expect(result.isLinearized).toBe(false);
    expect(result.pdfVersion).toBeNull();
  });
});
