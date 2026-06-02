// seed.ts
import { useDrizzle } from "./index";
import {
  fakultasTable,
  programStudiTable,
  ormawaTable,
  usersTable,
} from "./schema/index";

const db = useDrizzle();

async function seed() {
  console.log("🌱 Seeding data...");

  // 1. FAKULTAS
  const [fakultasTeknik] = await db
    .insert(fakultasTable)
    .values({ nama: "Fakultas Teknik", kode: "1" })
    .$returningId();
  const fakultasTeknikId = fakultasTeknik!.id;

  const [fakultasEkonomi] = await db
    .insert(fakultasTable)
    .values({ nama: "Fakultas Ekonomi", kode: "2" })
    .$returningId();
  const fakultasEkonomiId = fakultasEkonomi!.id;

  // 2. PROGRAM STUDI
  const [prodiTi] = await db
    .insert(programStudiTable)
    .values({
      nama: "Teknik Informatika",
      kode: "101",
      fakultasId: fakultasTeknikId,
    })
    .$returningId();
  const prodiTiId = prodiTi!.id;

  const [prodiManajemen] = await db
    .insert(programStudiTable)
    .values({ nama: "Manajemen", kode: "102", fakultasId: fakultasEkonomiId })
    .$returningId();
  const prodiManajemenId = prodiManajemen!.id;

  // 3. ORMAWA
  const [ormawaHimati] = await db
    .insert(ormawaTable)
    .values({
      nama: "Himpunan Mahasiswa Teknik Informatika",
      kode: "201",
      totalAnggaran: 50000000,
      prodiId: prodiTiId,
      fakultasId: fakultasTeknikId,
    })
    .$returningId();
  const ormawaHimatiId = ormawaHimati!.id;

  const [ormawaBem] = await db
    .insert(ormawaTable)
    .values({
      nama: "BEM Fakultas Ekonomi",
      kode: "202",
      totalAnggaran: 75000000,
      prodiId: prodiManajemenId,
      fakultasId: fakultasEkonomiId,
    })
    .$returningId();
  const ormawaBemId = ormawaBem!.id;

  // 4. USERS
  await db.insert(usersTable).values([
    {
      users_id: "1",
      email: "kaprodi@univ.ac.id",
      passwordHash: "pass123",
      fullName: "Kaprodi Teknik Informatika",
      role: "kaprodi",
      isActive: true,
      prodiId: prodiTiId,
      ormawaId: null,
      fakultasId: null,
    },
    {
      users_id: "2",
      email: "ormawa@univ.ac.id",
      passwordHash: "pass123",
      fullName: "Ketua HIMATI",
      role: "ormawa",
      isActive: true,
      prodiId: null,
      ormawaId: ormawaHimatiId,
      fakultasId: null,
    },
    {
      users_id: "3",
      email: "ppk@univ.ac.id",
      passwordHash: "pass123",
      fullName: "PPK Fakultas Teknik",
      role: "ppk",
      isActive: true,
      prodiId: null,
      ormawaId: null,
      fakultasId: fakultasTeknikId,
    },
    {
      users_id: "4",
      email: "spi@univ.ac.id",
      passwordHash: "pass123",
      fullName: "SPI Satu",
      role: "spi",
      isActive: true,
      prodiId: null,
      ormawaId: null,
      fakultasId: null,
    },
  ]);

  console.log("✅ Seeding selesai!");
}

seed().catch((err) => {
  console.error("❌ Seeding gagal:", err);
  process.exit(1);
});
