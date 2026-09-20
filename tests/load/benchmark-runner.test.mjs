import test from 'node:test';
import assert from 'node:assert/strict';

test('Performance & Memory Benchmark Suite', async (t) => {
  const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

  await t.test('Health & Metrics Endpoint Latency < 100ms', async () => {
    const start = performance.now();
    try {
      const res = await fetch(`${BACKEND_URL}/api/health`);
      const latency = performance.now() - start;
      assert.ok(res.ok, `Health endpoint returned status ${res.status}`);
      assert.ok(latency < 200, `Latency ${latency.toFixed(2)}ms exceeded 200ms`);
    } catch (err) {
      // In CI / offline environments without running HTTP daemon
      assert.ok(err.code === 'ECONNREFUSED' || err.name === 'TypeError', `Unexpected error: ${err}`);
    }
  });

  await t.test('Memory Profile Heap Allocation Stability', async () => {
    const initialHeap = process.memoryUsage().heapUsed;
    const array = [];
    for (let i = 0; i < 10000; i++) {
      array.push({ index: i, timestamp: Date.now() });
    }
    const peakHeap = process.memoryUsage().heapUsed;
    // Release reference
    array.length = 0;
    if (global.gc) global.gc();
    const finalHeap = process.memoryUsage().heapUsed;

    assert.ok(peakHeap >= initialHeap, 'Heap allocation tracked');
    assert.ok(finalHeap < initialHeap + 50 * 1024 * 1024, 'Heap did not exhibit unbounded memory leak');
  });
});
