/**
 * One-off provisioning — run: npx tsx scripts/provision-users-once.ts
 * Uses DATABASE_URL from .env.local when set, else local JSON.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
config();

const ACCOUNTS = [
  {
    name: 'benunu',
    email: 'benunu@sekolah.id',
    role: 'teacher' as const,
    password: 'lembahbenunu123',
  },
  {
    name: 'ciapromax',
    email: 'ciapromax@sekolah.id',
    role: 'student' as const,
    password: 'hamapromax123',
    grade: 'Kelas X',
    class_name: 'X-MIPA 1',
  },
];

async function main() {
  const { db } = await import('../server/db.js');
  await db.ready();

  for (const acc of ACCOUNTS) {
    const existing = db.getUserByEmail(acc.email);
    if (existing) {
      db.updateUser(existing.id, {
        name: acc.name,
        password: acc.password,
        role: acc.role,
        ...(acc.role === 'student'
          ? { grade: acc.grade, class_name: acc.class_name }
          : {}),
      });
      console.log(`Updated: ${acc.email} (${acc.role})`);
      continue;
    }
    db.createUser(acc);
    console.log(`Created: ${acc.email} (${acc.role})`);
  }

  await db.ready();
  console.log('Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
