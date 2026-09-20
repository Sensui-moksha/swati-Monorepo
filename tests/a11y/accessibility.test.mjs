import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

test('Accessibility (a11y) & Semantic Structure Audit', async (t) => {
  const FRONTEND_DIR = path.resolve(process.cwd(), 'swati-clientside');

  await t.test('Reader components define ARIA attributes and keyboard shortcuts', async () => {
    const readerComponentPath = path.join(FRONTEND_DIR, 'src', 'components', 'FlipBookReader.tsx');
    if (fs.existsSync(readerComponentPath)) {
      const content = fs.readFileSync(readerComponentPath, 'utf8');
      assert.ok(
        content.includes('aria-label') || content.includes('role=') || content.includes('keydown') || content.includes('tabIndex'),
        'FlipBookReader should include ARIA or keyboard navigation support'
      );
    }
  });

  await t.test('Navigation & Header elements use semantic markup', async () => {
    const headerPath = path.join(FRONTEND_DIR, 'src', 'components', 'Navbar.tsx');
    if (fs.existsSync(headerPath)) {
      const content = fs.readFileSync(headerPath, 'utf8');
      assert.ok(
        content.includes('<nav') || content.includes('<header') || content.includes('aria-label'),
        'Navbar should use semantic HTML5 elements'
      );
    }
  });
});
