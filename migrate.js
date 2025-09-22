const { execSync } = require('child_process');

console.log('Running Prisma migrations...');
try {
  execSync('pnpm --filter @pomogator/prisma migrate deploy', { stdio: 'inherit' });
  console.log('Migrations completed successfully');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
