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
  const litedocsDir = path.join(root, 'litedocs-site');

  const litedocsTime = measureExecutionTime('LiteDocs', 'pnpm run build', litedocsDir);
  const nextraTime = measureExecutionTime('Nextra', 'pnpm run build', nextraDir);

  const result = {
    benchmarks: {
      litedocs: {
        timeMs: litedocsTime,
        timeSec: litedocsTime ? parseFloat((litedocsTime / 1000).toFixed(2)) : null
      },
      nextra: {
        timeMs: nextraTime,
        timeSec: nextraTime ? parseFloat((nextraTime / 1000).toFixed(2)) : null
      }
    },
    comparison: {
      faster: litedocsTime < nextraTime ? 'litedocs' : 'nextra',
      ratio: parseFloat((Math.max(litedocsTime, nextraTime) / Math.min(litedocsTime, nextraTime)).toFixed(2))
    }
  };

  // Writing file for result
  const resultFilePath = path.join(root, 'result.json');
  fs.writeFileSync(resultFilePath, JSON.stringify(result, null, 2));
  console.log(`✅ Result written to ${resultFilePath}`);
}

runBenchmarks();
