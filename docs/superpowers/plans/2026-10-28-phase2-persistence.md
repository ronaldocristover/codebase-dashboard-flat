# Phase 2: Data Persistence & Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SSKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace in-memory member store with PostgreSQL database using Prisma ORM.

**Architecture:** 
- Set up PostgreSQL database and Prisma ORM
- Create Prisma schema for members, orders, and audit log
- Migrate memberStore to use database instead of in-memory array
- Add transaction support for data consistency
- Add backup/restore mechanism
- Add audit log for member changes

**Tech Stack:** 
- PostgreSQL
- Prisma ORM
- `@prisma/client`
- `@prisma/extension-accelerate` (for query acceleration)
- `pg` (for backup/restore)

**Spec:** See `docs/superpowers/plans/2026-10-28-saas-readiness-audit.md` findings #3, #4, #6, #7, #34

## Global Constraints

- **Svelte 5 Runes:** All components must use `$props()`, `$state`, `$derived`, `$effect`
- **TypeScript Strict:** No `any` without explicit comment
- **Indonesian Domain Identifiers:** Domain terms stay Indonesian (`bergabung`, `totalBelanja`, `anggota`)
- **File Structure:** `src/lib/server/memberStore.ts` is server-only; database models in `prisma/schema.prisma`
- **Testing:** Tests must be colocated with the code they test; `src/lib/server/**` excluded from Vitest

## Review Focus

1. **Data persistence:** Server restart doesn't wipe member data → Test: Create a member, restart the server, verify member still exists
2. **Transaction integrity:** Database transaction ensures data consistency → Test: Create a member while another process is modifying the same member
3. **Backup/restore:** Data can be backed up and restored → Test: Backup the database, restart the server, restore the backup, verify data is intact
4. **Audit log:** Member changes are logged → Test: Edit a member, check audit log for the change
5. **Multi-process access:** Multiple instances can access the database → Test: Run two instances and verify both can read/write data

---

## Task 1: Set up PostgreSQL and Prisma

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `prisma/migrations/...`
- Modify: `package.json` (add dependencies and scripts)
- Modify: `vite.config.ts` (exclude Prisma client from tests)

**Interfaces:**
- Consumes: None (first task)
- Produces: Prisma client, database schema, seed script

**Dependencies:** None

- [ ] **Step 1: Install dependencies**

```bash
npm install prisma @prisma/client @prisma/extension-accelerate pg
npm install -D prisma
```

- [ ] **Step 2: Create Prisma schema**

Create `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["accelerate"]
}

model Member {
  id          String   @id @default(cuid())
  nama        String
  email       String   @unique
  hp          String
  bergabung   DateTime @default(now())
  totalBelanja Int      @default(0)
  status      MemberStatus @default(AKTIF)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  orders      Order[]

  @@map("members")
}

model Order {
  id          String   @id @default(cuid())
  invoice     String   @unique
  memberId    String
  member      Member   @relation(fields: [memberId], references: [id], onDelete: Cascade)
  amount      Int
  status      OrderStatus @default(MENUNGGU)
  date        DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("orders")
}

model AuditLog {
  id          String   @id @default(cuid())
  action      AuditAction
  tableName   String
  recordId    String
  oldValues   Json?
  newValues   Json?
  userId      String
  createdAt   DateTime @default(now())

  @@map("audit_logs")
}

enum MemberStatus {
  AKTIF
  NONAKTIF
}

enum OrderStatus {
  LUNAS
  DIKIRIM
  MENUNGGU
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
}
```

- [ ] **Step 3: Create seed script**

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { members as seedMembers } from '../src/lib/mock/members';
import { ordersForMember } from '../src/lib/mock/orders';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.order.deleteMany();
  await prisma.member.deleteMany();

  // Seed members
  for (const member of seedMembers) {
    await prisma.member.create({
      data: {
        nama: member.nama,
        email: member.email,
        hp: member.hp,
        bergabung: member.bergabung,
        totalBelanja: member.totalBelanja,
        status: member.status === 'aktif' ? 'AKTIF' : 'NONAKTIF'
      }
    });
  }

  // Seed orders for each member
  for (const member of seedMembers) {
    const orders = ordersForMember(member.id);
    for (const order of orders) {
      await prisma.order.create({
        data: {
          invoice: order.invoice,
          memberId: member.id,
          amount: order.amount,
          status: order.status.toUpperCase() as any,
          date: order.date
        }
      });
    }
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

- [ ] **Step 4: Update package.json**

Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "prepare": "svelte-kit sync || echo ''",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "test:unit": "vitest",
    "test": "npm run test:unit -- --run --passWithNoTests",
    "db:push": "prisma db push",
    "db:seed": "prisma db seed",
    "db:generate": "prisma generate",
    "db:studio": "prisma studio",
    "db:backup": "node prisma/backup.js"
  }
}
```

- [ ] **Step 5: Create .env file**

Create `.env`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/tokoku?schema=public"
```

- [ ] **Step 6: Run migrations**

```bash
npx prisma db push
npx prisma db seed
```

- [ ] **Step 7: Test Prisma client**

Create a quick test to verify the connection works:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  const members = await prisma.member.findMany({ take: 1 });
  console.log('Database connected! First member:', members[0]);
  await prisma.$disconnect();
}

test();
```

- [ ] **Step 8: Commit**

```bash
git add prisma/ package.json .env
git commit -m "feat: set up PostgreSQL and Prisma ORM"
```

---

## Task 2: Migrate memberStore to use database

**Files:**
- Modify: `src/lib/server/memberStore.ts`
- Test: `src/lib/server/memberStore.test.ts`

**Interfaces:**
- Consumes: `PrismaClient` from `@prisma/client`
- Produces: Database-backed member operations

**Dependencies:** Task 1

- [ ] **Step 1: Update memberStore to use Prisma**

```typescript
import { PrismaClient } from '@prisma/client';
import type { Member, MemberInput } from '#lib/types';

const prisma = new PrismaClient();

export type { MemberInput };

export function listMembers(): Member[] {
  const members = prisma.member.findMany({
    orderBy: { bergabung: 'desc' },
    select: {
      id: true,
      nama: true,
      email: true,
      hp: true,
      bergabung: true,
      totalBelanja: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return members.map((m) => ({
    id: m.id,
    nama: m.nama,
    email: m.email,
    hp: m.hp,
    bergabung: m.bergabung.toISOString(),
    totalBelanja: m.totalBelanja,
    status: m.status === 'AKTIF' ? 'aktif' : 'nonaktif',
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString()
  }));
}

export function findMember(id: string): Member | undefined {
  const member = prisma.member.findUnique({
    where: { id },
    select: {
      id: true,
      nama: true,
      email: true,
      hp: true,
      bergabung: true,
      totalBelanja: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  });

  if (!member) return undefined;

  return {
    id: member.id,
    nama: member.nama,
    email: member.email,
    hp: member.hp,
    bergabung: member.bergabung.toISOString(),
    totalBelanja: member.totalBelanja,
    status: member.status === 'AKTIF' ? 'aktif' : 'nonaktif',
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString()
  };
}

export function createMember(input: MemberInput): Member {
  return prisma.$transaction(async (tx) => {
    const member = await tx.member.create({
      data: {
        nama: input.nama.trim(),
        email: input.email.trim(),
        hp: input.hp.trim(),
        bergabung: new Date(input.bergabung || new Date()),
        totalBelanja: 0,
        status: input.status === 'aktif' ? 'AKTIF' : 'NONAKTIF'
      }
    });

    return {
      id: member.id,
      nama: member.nama,
      email: member.email,
      hp: member.hp,
      bergabung: member.bergabung.toISOString(),
      totalBelanja: member.totalBelanja,
      status: member.status === 'AKTIF' ? 'aktif' : 'nonaktif',
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString()
    };
  });
}

export function updateMember(id: string, input: Partial<MemberInput>): Member | undefined {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.member.findUnique({
      where: { id }
    });

    if (!existing) return undefined;

    const updated = await tx.member.update({
      where: { id },
      data: {
        nama: input.nama ?? existing.nama,
        email: input.email ?? existing.email,
        hp: input.hp ?? existing.hp,
        status: input.status ? (input.status === 'aktif' ? 'AKTIF' : 'NONAKTIF') : existing.status
      }
    });

    return {
      id: updated.id,
      nama: updated.nama,
      email: updated.email,
      hp: updated.hp,
      bergabung: updated.bergabung.toISOString(),
      totalBelanja: updated.totalBelanja,
      status: updated.status === 'AKTIF' ? 'aktif' : 'nonaktif',
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString()
    };
  });
}

export function resetMembers(): void {
  prisma.member.deleteMany();
}
```

- [ ] **Step 2: Create test for memberStore**

```typescript
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { listMembers, findMember, createMember, updateMember } from './memberStore';

const prisma = new PrismaClient();

describe('memberStore (database-backed)', () => {
  beforeEach(async () => {
    await prisma.member.deleteMany();
  });

  afterEach(async () => {
    await prisma.member.deleteMany();
  });

  it('lists all members', async () => {
    const members = listMembers();
    expect(members).toHaveLength(0);
  });

  it('creates a member', async () => {
    const member = createMember({
      nama: 'Test Member',
      email: 'test@example.com',
      hp: '081234567890',
      status: 'aktif'
    });

    expect(member.nama).toBe('Test Member');
    expect(member.email).toBe('test@example.com');
  });

  it('finds a member by ID', async () => {
    const created = createMember({
      nama: 'Test Member',
      email: 'test@example.com',
      hp: '081234567890',
      status: 'aktif'
    });

    const found = findMember(created.id);
    expect(found).toBeTruthy();
    expect(found?.id).toBe(created.id);
    expect(found?.nama).toBe('Test Member');
  });

  it('returns undefined for non-existent member', async () => {
    const found = findMember('non-existent-id');
    expect(found).toBeUndefined();
  });

  it('updates a member', async () => {
    const created = createMember({
      nama: 'Test Member',
      email: 'test@example.com',
      hp: '081234567890',
      status: 'aktif'
    });

    const updated = updateMember(created.id, { nama: 'Updated Name' });
    expect(updated?.nama).toBe('Updated Name');
  });

  it('returns undefined for non-existent member update', async () => {
    const updated = updateMember('non-existent-id', { nama: 'Updated Name' });
    expect(updated).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run tests**

Run: `npm test -- src/lib/server/memberStore.test.ts`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/lib/server/memberStore.ts src/lib/server/memberStore.test.ts
git commit -m "feat: migrate memberStore to use PostgreSQL database"
```

---

## Task 3: Migrate orders to use database

**Files:**
- Modify: `src/lib/mock/orders.ts`
- Modify: `src/routes/api/members/[id]/orders/+server.ts`
- Test: `src/routes/api/members/[id]/orders/+server.test.ts`

**Interfaces:**
- Consumes: `PrismaClient` from `@prisma/client`
- Produces: Database-backed orders

**Dependencies:** Task 1

- [ ] **Step 1: Update orders mock to use database**

```typescript
import type { MemberOrder, OrderStatus } from '#lib/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const STATUS: OrderStatus[] = ['LUNAS', 'DIKIRIM', 'MENUNGGU'];

export function ordersForMember(memberId: string): MemberOrder[] {
  const orders = prisma.order.findMany({
    where: { memberId },
    orderBy: { date: 'desc' },
    select: {
      invoice: true,
      amount: true,
      status: true,
      date: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return orders.map((o) => ({
    invoice: o.invoice,
    amount: o.amount,
    status: o.status.toLowerCase() as any,
    date: o.date.toISOString()
  }));
}
```

- [ ] **Step 2: Update API endpoint to use database orders**

```typescript
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ordersForMember } from '#lib/mock/orders';
import { findMember } from '#lib/server/memberStore';

export const GET: RequestHandler = ({ params }) => {
  if (!findMember(params.id)) error(404, 'Member not found');
  return json(ordersForMember(params.id));
};
```

- [ ] **Step 3: Add test for orders endpoint**

```typescript
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { ordersForMember } from '#lib/mock/orders';

const prisma = new PrismaClient();

describe('ordersForMember (database-backed)', () => {
  beforeEach(async () => {
    await prisma.order.deleteMany();
    await prisma.member.deleteMany();
  });

  afterEach(async () => {
    await prisma.order.deleteMany();
    await prisma.member.deleteMany();
  });

  it('returns empty array for non-existent member', async () => {
    const orders = ordersForMember('non-existent-id');
    expect(orders).toHaveLength(0);
  });

  it('returns orders for existing member', async () => {
    const member = await prisma.member.create({
      data: {
        nama: 'Test Member',
        email: 'test@example.com',
        hp: '081234567890',
        status: 'AKTIF'
      }
    });

    await prisma.order.createMany({
      data: [
        { invoice: 'INV-001', memberId: member.id, amount: 100000, status: 'LUNAS' },
        { invoice: 'INV-002', memberId: member.id, amount: 200000, status: 'MENUNGGU' }
      ]
    });

    const orders = ordersForMember(member.id);
    expect(orders).toHaveLength(2);
    expect(orders[0].invoice).toBe('INV-002');
    expect(orders[0].status).toBe('menunggu');
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/routes/api/members/\[id\]/orders/+server.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/mock/orders.ts src/routes/api/members/\[id\]/orders/+server.ts src/routes/api/members/\[id\]/orders/+server.test.ts
git commit -m "feat: migrate orders to use PostgreSQL database"
```

---

## Task 4: Add backup/restore mechanism

**Files:**
- Create: `prisma/backup.js`
- Create: `prisma/restore.js`
- Test: `prisma/backup.test.ts`

**Interfaces:**
- Consumes: `pg` library
- Produces: Backup and restore scripts

**Dependencies:** Task 1

- [ ] **Step 1: Create backup script**

Create `prisma/backup.js`:

```javascript
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function backup() {
  console.log('Starting database backup...');

  const client = await pool.connect();
  try {
    const backupPath = path.join(__dirname, `backup-${Date.now()}.sql`);

    // Get all tables
    const tables = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
    `);

    // Backup each table
    for (const table of tables.rows) {
      const { tablename } = table;
      const result = await client.query(`SELECT * FROM ${tablename}`);
      const rows = result.rows.map(row => 
        rows.map(row => 
          `'${JSON.stringify(row).replace(/'/g, "''")}'`
        ).join(',')
      ).join(',\n');

      fs.appendFileSync(
        backupPath,
        `COPY ${tablename} FROM stdin WITH CSV HEADER;\n${rows}\n\\.\n`
      );
    }

    console.log(`Backup saved to ${backupPath}`);
    return backupPath;
  } finally {
    client.release();
  }
}

backup()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Backup failed:', err);
    process.exit(1);
  });
```

- [ ] **Step 2: Create restore script**

Create `prisma/restore.js`:

```javascript
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function restore(backupPath) {
  console.log('Starting database restore...');

  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(backupPath, 'utf8');

    // Split into individual statements
    const statements = sql.split(/;\n\n|\n\n/).filter(s => s.trim());

    for (const statement of statements) {
      await client.query(statement);
    }

    console.log('Restore complete!');
  } finally {
    client.release();
  }
}

const backupPath = process.argv[2];

if (!backupPath) {
  console.error('Usage: node restore.js <backup-file>');
  process.exit(1);
}

restore(backupPath)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Restore failed:', err);
    process.exit(1);
  });
```

- [ ] **Step 3: Add backup script to package.json**

```json
{
  "scripts": {
    "db:backup": "node prisma/backup.js"
  }
}
```

- [ ] **Step 4: Add test for backup**

```typescript
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import { Pool } from 'pg';

describe('backup/restore', () => {
  let pool: Pool;

  beforeEach(() => {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
  });

  afterEach(async () => {
    await pool.end();
  });

  it('creates and restores a backup', async () => {
    const client = await pool.connect();
    try {
      // Create test data
      await client.query(`
        INSERT INTO members (nama, email, hp, status) 
        VALUES ('Backup Test', 'backup@test.com', '081234567890', 'AKTIF')
      `);

      // Get initial count
      const before = await client.query('SELECT COUNT(*) FROM members');
      expect(before.rows[0].count).toBe('1');

      // Create backup
      execSync('npm run db:backup', { stdio: 'inherit' });

      // Delete data
      await client.query('DELETE FROM members');

      // Get count after deletion
      const afterDelete = await client.query('SELECT COUNT(*) FROM members');
      expect(afterDelete.rows[0].count).toBe('0');

      // Find and restore backup
      const backupFiles = execSync('ls -t prisma/backup-*.sql 2>/dev/null || true', { encoding: 'utf8' })
        .trim()
        .split('\n');

      if (backupFiles.length > 0) {
        execSync(`node prisma/restore.js ${backupFiles[0]}`, { stdio: 'inherit' });

        // Get count after restore
        const afterRestore = await client.query('SELECT COUNT(*) FROM members');
        expect(afterRestore.rows[0].count).toBe('1');
      }
    } finally {
      client.release();
    }
  });
});
```

- [ ] **Step 5: Run tests**

Run: `npm test -- prisma/backup.test.ts`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add prisma/backup.js prisma/restore.js package.json prisma/backup.test.ts
git commit -m "feat: add database backup and restore mechanism"
```

---

## Task 5: Add audit log for member changes

**Files:**
- Modify: `src/lib/server/memberStore.ts`
- Create: `src/lib/server/audit.ts`
- Test: `src/lib/server/audit.test.ts`

**Interfaces:**
- Consumes: `PrismaClient` from `@prisma/client`
- Produces: Audit log entries for member changes

**Dependencies:** Task 1

- [ ] **Step 1: Create audit utilities**

Create `src/lib/server/audit.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import type { MemberInput } from '#lib/types';

const prisma = new PrismaClient();

export async function logMemberChange(
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  tableName: string,
  recordId: string,
  oldValues: Record<string, unknown> | null,
  newValues: Record<string, unknown> | null,
  userId: string
) {
  await prisma.auditLog.create({
    data: {
      action,
      tableName,
      recordId,
      oldValues,
      newValues,
      userId
    }
  });
}

export async function logMemberCreate(input: MemberInput, userId: string) {
  const newValues = {
    nama: input.nama,
    email: input.email,
    hp: input.hp,
    status: input.status === 'aktif' ? 'AKTIF' : 'NONAKTIF'
  };

  await logMemberChange('CREATE', 'members', '', null, newValues, userId);
}

export async function logMemberUpdate(
  id: string,
  oldMember: { nama?: string; email?: string; hp?: string; status?: string },
  newMember: { nama?: string; email?: string; hp?: string; status?: string },
  userId: string
) {
  const oldValues: Record<string, unknown> = {};
  const newValues: Record<string, unknown> = {};

  if (oldMember.nama !== newMember.nama) oldValues.nama = oldMember.nama;
  if (oldMember.email !== newMember.email) oldValues.email = oldMember.email;
  if (oldMember.hp !== newMember.hp) oldValues.hp = oldMember.hp;
  if (oldMember.status !== newMember.status) oldValues.status = oldMember.status;

  if (Object.keys(oldValues).length > 0) {
    newValues.nama = newMember.nama;
    newValues.email = newMember.email;
    newValues.hp = newMember.hp;
    newValues.status = newMember.status;

    await logMemberChange('UPDATE', 'members', id, oldValues, newValues, userId);
  }
}
```

- [ ] **Step 2: Integrate audit log into memberStore**

Update `src/lib/server/memberStore.ts` to use audit log:

```typescript
// Add to top of file
import { sessionStore } from './sessionStore';
import { logMemberCreate, logMemberUpdate } from './audit';

// Update createMember
export function createMember(input: MemberInput): Member {
  return prisma.$transaction(async (tx) => {
    const member = await tx.member.create({
      data: {
        nama: input.nama.trim(),
        email: input.email.trim(),
        hp: input.hp.trim(),
        bergabung: new Date(input.bergabung || new Date()),
        totalBelanja: 0,
        status: input.status === 'aktif' ? 'AKTIF' : 'NONAKTIF'
      }
    });

    // Get user ID from session
    const { getSession } = await sessionStore({ request: new Request('http://localhost'), cookies: { get: () => '', set: () => {}, delete: () => {} } });
    const session = await getSession();
    const userId = session?.userId || 'system';

    await logMemberCreate(input, userId);

    return {
      id: member.id,
      nama: member.nama,
      email: member.email,
      hp: member.hp,
      bergabung: member.bergabung.toISOString(),
      totalBelanja: member.totalBelanja,
      status: member.status === 'AKTIF' ? 'aktif' : 'nonaktif',
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString()
    };
  });
}

// Update updateMember
export function updateMember(id: string, input: Partial<MemberInput>): Member | undefined {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.member.findUnique({
      where: { id }
    });

    if (!existing) return undefined;

    const oldMember = {
      nama: existing.nama,
      email: existing.email,
      hp: existing.hp,
      status: existing.status
    };

    const updated = await tx.member.update({
      where: { id },
      data: {
        nama: input.nama ?? existing.nama,
        email: input.email ?? existing.email,
        hp: input.hp ?? existing.hp,
        status: input.status ? (input.status === 'aktif' ? 'AKTIF' : 'NONAKTIF') : existing.status
      }
    });

    const newMember = {
      nama: updated.nama,
      email: updated.email,
      hp: updated.hp,
      status: updated.status
    };

    // Get user ID from session
    const { getSession } = await sessionStore({ request: new Request('http://localhost'), cookies: { get: () => '', set: () => {}, delete: () => {} } });
    const session = await getSession();
    const userId = session?.userId || 'system';

    await logMemberUpdate(id, oldMember, newMember, userId);

    return {
      id: updated.id,
      nama: updated.nama,
      email: updated.email,
      hp: updated.hp,
      bergabung: updated.bergabung.toISOString(),
      totalBelanja: updated.totalBelanja,
      status: updated.status === 'AKTIF' ? 'aktif' : 'nonaktif',
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString()
    };
  });
}
```

- [ ] **Step 3: Add test for audit log**

```typescript
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { logMemberCreate, logMemberUpdate } from './audit';

const prisma = new PrismaClient();

describe('audit log', () => {
  beforeEach(async () => {
    await prisma.auditLog.deleteMany();
  });

  afterEach(async () => {
    await prisma.auditLog.deleteMany();
  });

  it('logs member creation', async () => {
    await logMemberCreate(
      {
        nama: 'Test Member',
        email: 'test@example.com',
        hp: '081234567890',
        status: 'aktif'
      },
      'user-123'
    );

    const logs = await prisma.auditLog.findMany();
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe('CREATE');
    expect(logs[0].tableName).toBe('members');
    expect(logs[0].userId).toBe('user-123');
  });

  it('logs member update', async () => {
    await logMemberUpdate(
      'member-123',
      { nama: 'Old Name', email: 'old@test.com', hp: '081111111111', status: 'aktif' },
      { nama: 'New Name', email: 'new@test.com', hp: '081222222222', status: 'nonaktif' },
      'user-456'
    );

    const logs = await prisma.auditLog.findMany();
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe('UPDATE');
    expect(logs[0].recordId).toBe('member-123');
    expect(logs[0].userId).toBe('user-456');
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/lib/server/audit.test.ts`
Expected: All tests pass

- [ ] **Step 5: Commit**

```bash
git add src/lib/server/audit.ts src/lib/server/memberStore.ts src/lib/server/audit.test.ts
git commit -m "feat: add audit log for member changes"
```

---

## Phase 2 Completion Checklist

- [ ] All tasks completed
- [ ] All tests pass (`npm test`)
- [ ] svelte-check passes (`npm run check`)
- [ ] Database is set up and seeded
- [ ] MemberStore uses database instead of in-memory
- [ ] Orders use database
- [ ] Backup/restore mechanism works
- [ ] Audit log is in place
- [ ] Data persists across server restarts

---

## Success Criteria for Phase 2

- Creating a member saves it to the database
- Server restart doesn't wipe member data
- Backup and restore work correctly
- Audit log records all member changes
- Multiple processes can access the database
- All tests pass and code follows project conventions

---

## Next Phase

Proceed to **Phase 3: API Scalability & Security** (`docs/superpowers/plans/2026-10-28-phase3-api.md`)
