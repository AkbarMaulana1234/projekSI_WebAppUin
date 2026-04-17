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
  console.log("🌱 Seeding data dengan semua kode berupa angka...");

  // 1. FAKULTAS (kode angka)
  const [fakultasTeknik] = await db
    .insert(fakultasTable)
    .values({
      nama: "Fakultas Teknik",
      kode: "1", // kode angka
    })
    .$returningId();
  const fakultasTeknikId = fakultasTeknik!.id; // autoincrement, misal 1

  const [fakultasEkonomi] = await db
    .insert(fakultasTable)
    .values({
      nama: "Fakultas Ekonomi",
      kode: "2",
    })
    .$returningId();
  const fakultasEkonomiId = fakultasEkonomi!.id; // misal 2

  // 2. PROGRAM STUDI (kode angka)
  const [prodiTi] = await db
    .insert(programStudiTable)
    .values({
      nama: "Teknik Informatika",
      kode: "101", // kode angka
      fakultasId: fakultasTeknikId,
    })
    .$returningId();
  const prodiTiId = prodiTi!.id; // autoincrement, misal 1

  const [prodiManajemen] = await db
    .insert(programStudiTable)
    .values({
      nama: "Manajemen",
      kode: "102",
      fakultasId: fakultasEkonomiId,
    })
    .$returningId();
  const prodiManajemenId = prodiManajemen!.id; // misal 2

  // 3. ORMAWA (kode angka)
  const [ormawaHimati] = await db
    .insert(ormawaTable)
    .values({
      nama: "Himpunan Mahasiswa Teknik Informatika",
      kode: "201", // kode angka
      totalAnggaran: 50000000,
      prodiId: prodiTiId,
    })
    .$returningId();
  const ormawaHimatiId = ormawaHimati!.id; // misal 1

  const [ormawaBem] = await db
    .insert(ormawaTable)
    .values({
      nama: "BEM Fakultas Ekonomi",
      kode: "202",
      totalAnggaran: 75000000,
      prodiId: prodiManajemenId,
    })
    .$returningId();
  const ormawaBemId = ormawaBem!.id; // misal 2

  // 4. USERS (users_id berupa angka dalam string)
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
  console.log("Kode yang digunakan (semua angka):");
  console.log(`- Fakultas Teknik: kode "1", Ekonomi: kode "2"`);
  console.log(`- Prodi TI: kode "101", Manajemen: kode "102"`);
  console.log(`- Ormawa HIMATI: kode "201", BEM: kode "202"`);
  console.log(`- User ID: "1", "2", "3", "4"`);
}

seed().catch((err) => {
  console.error("❌ Seeding gagal:", err);
  process.exit(1);
});
