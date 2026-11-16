import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const backendDir = dirname(fileURLToPath(import.meta.url));
const windowsPython = join(backendDir, 'venv', 'Scripts', 'python.exe');
const unixPython = join(backendDir, 'venv', 'bin', 'python');
const python = process.env.PYTHON ||
  (existsSync(windowsPython) ? windowsPython : existsSync(unixPython) ? unixPython : 'python');

const server = spawn(python, ['manage.py', 'runserver', '127.0.0.1:8000'], {
  cwd: backendDir,
  stdio: 'inherit',
});

server.on('error', (error) => {
  console.error(`Could not start the Django backend with ${python}: ${error.message}`);
  process.exitCode = 1;
});

server.on('exit', (code) => {
  process.exitCode = code ?? 1;
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.kill(signal));
}
