import { createContext, runInContext } from 'vm';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  logs: string[];
  testResults: TestResult[];
  passedCount: number;
  totalCount: number;
  error?: string;
}

export class SandboxService {
  /**
   * Executes untrusted JavaScript safely inside a sandboxed VM with stdout/stderr capture
   * and automated assertion test suite runner.
   */
  async runCodeWithTests(
    code: string,
    testCases: { name: string; assertion: string; input?: string; expected?: string }[] = []
  ): Promise<ExecutionResult> {
    const logs: string[] = [];
    const testResults: TestResult[] = [];

    // Capture console output safely
    const customConsole = {
      log: (...args: any[]) => logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
      error: (...args: any[]) => logs.push('[ERR] ' + args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
      warn: (...args: any[]) => logs.push('[WARN] ' + args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
      info: (...args: any[]) => logs.push('[INFO] ' + args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
    };

    const sandbox = {
      console: customConsole,
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval,
      Buffer,
      Math,
      Date,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      Map,
      Set,
      Promise,
      Error,
      TypeError,
      RangeError,
      SyntaxError,
    };

    const context = createContext(sandbox);

    try {
      // 1. Execute User Code Definition
      runInContext(code, context, { timeout: 3000 });

      // 2. Run Test Cases
      for (const tc of testCases) {
        const start = Date.now();
        try {
          // Wrapped in async IIFE to support async user functions
          const testScript = `
            (async () => {
              ${tc.assertion}
            })()
          `;
          const assertionPromise = runInContext(testScript, context, { timeout: 3000 });
          const passed = await assertionPromise;

          testResults.push({
            name: tc.name,
            passed: passed !== false && passed !== undefined && passed !== null,
            durationMs: Date.now() - start
          });
        } catch (err: any) {
          testResults.push({
            name: tc.name,
            passed: false,
            error: err?.message || String(err),
            durationMs: Date.now() - start
          });
        }
      }

      const passedCount = testResults.filter(t => t.passed).length;
      const totalCount = testResults.length;
      const allPassed = totalCount === 0 ? true : passedCount === totalCount;

      return {
        success: allPassed,
        output: logs.join('\n'),
        logs,
        testResults,
        passedCount,
        totalCount
      };
    } catch (err: any) {
      return {
        success: false,
        output: logs.join('\n'),
        logs,
        testResults,
        passedCount: 0,
        totalCount: testCases.length,
        error: `Runtime Exception: ${err?.message || String(err)}`
      };
    }
  }
}

export const sandboxService = new SandboxService();
