import { defineConfig } from 'vitest/config';

// Test files share one SQLite file and each re-seeds it; run them serially.
export default defineConfig({ test: { fileParallelism: false } });
