const { spawnSync, spawn } = require('node:child_process');

const prisma = process.platform === 'win32' ? 'prisma.cmd' : 'prisma';
const baseline = '20260719060000_academic_mvp';

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', stdio: ['inherit', 'pipe', 'pipe'] });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return result;
}

let migration = run(prisma, ['migrate', 'deploy']);

if (migration.status !== 0) {
  const output = `${migration.stdout || ''}\n${migration.stderr || ''}`;
  if (!output.includes('P3005')) process.exit(migration.status || 1);

  console.log('Base existente detectada. Registrando baseline sin eliminar datos.');
  const resolved = run(prisma, ['migrate', 'resolve', '--applied', baseline]);
  if (resolved.status !== 0) process.exit(resolved.status || 1);

  migration = run(prisma, ['migrate', 'deploy']);
  if (migration.status !== 0) process.exit(migration.status || 1);
}

const app = spawn(process.execPath, ['dist/main'], { stdio: 'inherit' });
app.on('exit', code => process.exit(code ?? 1));
app.on('error', error => {
  console.error(error);
  process.exit(1);
});
