import { execSync } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';

const PORT = Number(process.env.PORT_DEV || 5174);
const projectDir = process.cwd();

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, '127.0.0.1');
  });
}

function listPidsOnPort(port) {
  try {
    // macOS: lsof returns PIDs listening on the port
    const output = execSync(`lsof -n -P -i TCP:${port} -sTCP:LISTEN -t`, { encoding: 'utf8' });
    return output
      .split(/\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s));
  } catch {
    return [];
  }
}

function safeKill(pid) {
  try {
    process.kill(pid, 'SIGTERM');
  } catch {}
  // Wait briefly then hard kill if still present
  try {
    setTimeout(() => {
      try { process.kill(pid, 'SIGKILL'); } catch {}
    }, 500);
  } catch {}
}

function commandForPid(pid) {
  try {
    const cmd = execSync(`ps -p ${pid} -o command=`, { encoding: 'utf8' }).trim();
    return cmd;
  } catch {
    return '';
  }
}

async function ensureDevPort() {
  const free = await isPortFree(PORT);
  if (free) {
    console.log(`Dev port ${PORT} is free.`);
    return;
  }

  const pids = listPidsOnPort(PORT);
  if (pids.length === 0) {
    console.log(`Port ${PORT} busy but no PIDs found via lsof.`);
    return;
  }

  console.log(`Port ${PORT} is in use by PIDs: ${pids.join(', ')}`);
  for (const pid of pids) {
    const cmd = commandForPid(pid);
    const isVite = /vite|node/.test(cmd);
    const isProject = cmd.includes(path.basename(projectDir));
    if (isVite && isProject) {
      console.log(`Killing dev process ${pid}: ${cmd}`);
      safeKill(pid);
    } else {
      console.log(`Skipping non-project process ${pid}: ${cmd}`);
    }
  }

  // Wait a moment and re-check
  await new Promise((r) => setTimeout(r, 800));
  const freeAfter = await isPortFree(PORT);
  if (!freeAfter) {
    console.log(`Warning: Port ${PORT} still busy after attempted cleanup.`);
  } else {
    console.log(`Port ${PORT} freed.`);
  }
}

await ensureDevPort();

