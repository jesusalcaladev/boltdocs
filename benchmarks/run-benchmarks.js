import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

function measureExecutionTime(name, command, cwd) {
  const start = performance.now();
  try {
    execSync(command, { cwd, stdio: 'ignore' });
  } catch (err) {
    return null;
  }
  const end = performance.now();
  return end - start;
}

function runBenchmarks() {
  const root = process.cwd();
  const nextraDir = path.join(root, 'nextra-site');
  const boltdocsDir = path.join(root, 'boltdocs-site');

  const boltdocsTime = measureExecutionTime('LiteDocs', 'pnpm run build', boltdocsDir);
  const nextraTime = measureExecutionTime('Nextra', 'pnpm run build', nextraDir);

  const result = {
    benchmarks: {
      boltdocs: {
        timeMs: boltdocsTime,
        timeSec: boltdocsTime ? parseFloat((boltdocsTime / 1000).toFixed(2)) : null
      },
      nextra: {
        timeMs: nextraTime,
        timeSec: nextraTime ? parseFloat((nextraTime / 1000).toFixed(2)) : null
      }
    },
    comparison: {
      faster: boltdocsTime < nextraTime ? 'boltdocs' : 'nextra',
      ratio: parseFloat((Math.max(boltdocsTime, nextraTime) / Math.min(boltdocsTime, nextraTime)).toFixed(2))
    }
  };

  // Writing file for result
  const resultFilePath = path.join(root, 'result.json');
  fs.writeFileSync(resultFilePath, JSON.stringify(result, null, 2));
  console.log(`✅ Result written to ${resultFilePath}`);
}

runBenchmarks();
