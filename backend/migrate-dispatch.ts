import { db } from "./src/db";

async function runMigration() {
  const statements = [
    `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('Visit') AND name='CareMode') ALTER TABLE Visit ADD CareMode NVARCHAR(20) NULL`,
    `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('Visit') AND name='PackagePlan') ALTER TABLE Visit ADD PackagePlan NVARCHAR(30) NULL`,
    `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('Visit') AND name='PackageShift') ALTER TABLE Visit ADD PackageShift NVARCHAR(10) NULL`,
    `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('Visit') AND name='CustomerArea') ALTER TABLE Visit ADD CustomerArea NVARCHAR(200) NULL`,
    `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('Visit') AND name='RequiredSpecialty') ALTER TABLE Visit ADD RequiredSpecialty NVARCHAR(100) NULL`,
    `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('Visit') AND name='AssignedAt') ALTER TABLE Visit ADD AssignedAt DATETIME NULL`,
    `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('Staff') AND name='ServiceArea') ALTER TABLE Staff ADD ServiceArea NVARCHAR(500) NULL`,
    `IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id=OBJECT_ID('Staff') AND name='MaxDailyVisits') ALTER TABLE Staff ADD MaxDailyVisits INT NOT NULL DEFAULT 3`,
  ];

  for (const sql of statements) {
    try {
      await (db as any).$executeRawUnsafe(sql);
      console.log("✅ OK:", sql.slice(0, 80));
    } catch (e: any) {
      console.error("❌ FAIL:", e.message);
    }
  }
  await (db as any).$disconnect();
  console.log("Migration done.");
}

runMigration();
