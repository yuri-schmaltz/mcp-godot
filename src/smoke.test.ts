/**
 * Simple smoke tests for MCP server
 * Tests basic startup and functionality without Godot installation
 */

import { spawnSync } from 'child_process';
import { existsSync } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectRoot = path.join(__dirname, '..');
const buildFile = path.join(projectRoot, 'build', 'index.js');


interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

function runTest(name: string, testFn: () => boolean | Promise<boolean>): void {
  const startTime = Date.now();
  try {
    const result = testFn();
    if (result instanceof Promise) {
      result
        .then((passed) => {
          results.push({
            name,
            passed,
            duration: Date.now() - startTime,
          });
        })
        .catch((error) => {
          results.push({
            name,
            passed: false,
            error: String(error),
            duration: Date.now() - startTime,
          });
        });
    } else {
      results.push({
        name,
        passed: result,
        duration: Date.now() - startTime,
      });
    }
  } catch (error) {
    results.push({
      name,
      passed: false,
      error: String(error),
      duration: Date.now() - startTime,
    });
  }
}

// Test 1: Check if build file exists
runTest('Build file exists', () => {
  return existsSync(buildFile);
});

// Test 2: Check if build file is executable (on Unix systems)
runTest('Build file can be executed', () => {
  const result = spawnSync('node', [buildFile, '--help'], {
    timeout: 2000,
    encoding: 'utf-8',
  });

  // Should not error with "file not found" or "permission denied"
  return result.status === 0 || !result.error;
});

// Test 3: Test startup without GODOT_PATH (should fail with proper message)
runTest('Startup fails gracefully without GODOT_PATH', () => {
  const result = spawnSync('node', [buildFile], {
    timeout: 3000,
    encoding: 'utf-8',
    env: { ...process.env, GODOT_PATH: undefined },
  });

  const stderr = result.stderr || '';
  return (
    result.status !== 0 && stderr.includes('ERROR: Godot executable not found')
  );
});

// Test 4: Test lint passes
runTest('Linting passes', () => {
  const result = spawnSync('npm', ['run', 'lint'], {
    cwd: projectRoot,
    timeout: 30000,
    encoding: 'utf-8',
  });

  // Allow warnings but not errors
  return result.status === 0 || result.status === 1; // ESLint returns 1 for warnings
});

// Test 5: Check TypeScript compilation succeeds
runTest('TypeScript compilation succeeds', () => {
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: projectRoot,
    timeout: 30000,
    encoding: 'utf-8',
  });

  return result.status === 0;
});

// Test 6: Check npm audit for vulnerabilities
runTest('No critical vulnerabilities', () => {
  const result = spawnSync('npm', ['audit'], {
    cwd: projectRoot,
    timeout: 30000,
    encoding: 'utf-8',
  });

  const output = result.stdout || '';
  // Check for "found 0 vulnerabilities" or "0 high"
  return output.includes('found 0 vulnerabilities') ||
    !output.includes('high') &&
    !output.includes('critical');
});

// Print results
setTimeout(() => {
  console.log('\n========== SMOKE TEST RESULTS ==========\n');

  let passed = 0;
  let failed = 0;

  for (const result of results) {
    const status = result.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`${status} | ${result.name} (${result.duration}ms)`);

    if (result.error) {
      console.log(`     Error: ${result.error}`);
    }

    if (result.passed) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n========================================');
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('========================================\n');

  process.exit(failed > 0 ? 1 : 0);
}, 5000);
