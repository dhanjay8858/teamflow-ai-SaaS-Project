/**
 * TeamFlow AI — Performance Benchmark Script
 *
 * Measures API latency, provider latency, and search performance.
 * Run: npm run benchmark (or: npx tsx scripts/benchmark.ts)
 */

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

interface BenchmarkResult {
  name: string;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
  iterations: number;
}

async function measureLatency(
  name: string,
  fn: () => Promise<any>,
  iterations: number = 20
): Promise<BenchmarkResult> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    try {
      await fn();
    } catch {
      // Ignore errors — measuring latency even on failures
    }
    const end = performance.now();
    times.push(end - start);
  }

  times.sort((a, b) => a - b);
  const avg = times.reduce((s, t) => s + t, 0) / times.length;
  const p95Index = Math.floor(times.length * 0.95);

  return {
    name,
    avgMs: Math.round(avg * 100) / 100,
    minMs: Math.round(times[0] * 100) / 100,
    maxMs: Math.round(times[times.length - 1] * 100) / 100,
    p95Ms: Math.round(times[p95Index] * 100) / 100,
    iterations,
  };
}

async function runBenchmarks() {
  console.log('\n🏎️  TeamFlow AI — Performance Benchmark Suite\n');
  console.log('='.repeat(70));

  const results: BenchmarkResult[] = [];

  // ────── 1. Health endpoint ──────
  results.push(
    await measureLatency('GET /health', async () => {
      await fetch(`${BASE_URL}/health`);
    })
  );

  // ────── 2. Auth /me endpoint ──────
  results.push(
    await measureLatency('GET /api/v1/auth/me (401)', async () => {
      await fetch(`${BASE_URL}/api/v1/auth/me`);
    })
  );

  // ────── 3. AI Health endpoint ──────
  results.push(
    await measureLatency('GET /api/v1/ai/health', async () => {
      await fetch(`${BASE_URL}/api/v1/ai/health`);
    })
  );

  // ────── 4. 404 Handler ──────
  results.push(
    await measureLatency('GET /api/v1/nonexistent (404)', async () => {
      await fetch(`${BASE_URL}/api/v1/nonexistent-route`);
    })
  );

  // ────── 5. Registration validation rejection ──────
  results.push(
    await measureLatency('POST /api/v1/auth/register (400 validation)', async () => {
      await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid' }),
      });
    })
  );

  // ────── 6. Login validation rejection ──────
  results.push(
    await measureLatency('POST /api/v1/auth/login (400 validation)', async () => {
      await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    })
  );

  // ────── Print results ──────
  console.log('\n📊 Results:\n');
  console.log(
    '| Endpoint'.padEnd(50) +
      '| Avg (ms)'.padEnd(12) +
      '| Min'.padEnd(10) +
      '| Max'.padEnd(10) +
      '| P95'.padEnd(10) +
      '| Iters |'
  );
  console.log('-'.repeat(100));

  for (const r of results) {
    console.log(
      `| ${r.name}`.padEnd(50) +
        `| ${r.avgMs}`.padEnd(12) +
        `| ${r.minMs}`.padEnd(10) +
        `| ${r.maxMs}`.padEnd(10) +
        `| ${r.p95Ms}`.padEnd(10) +
        `| ${r.iterations}`.padEnd(7) +
        ' |'
    );
  }

  console.log('-'.repeat(100));
  console.log('\n✅ Benchmark complete.\n');
}

runBenchmarks().catch(console.error);
