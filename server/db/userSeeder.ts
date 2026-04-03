import { useDrizzle } from ".";
import * as schema from "./schema/usersSchema";

const seed = async () => {
  const db = useDrizzle();

  await db.insert(schema.usersTable).values([
    {
      name_lengkap: "Andi Kaprodi",
      email: "andi@univ.ac.id",
      password: "pass_kaprodi",
      jabatan: "Kaprodi Informatika",
      role: "kaprodi",
    },
    {
      name_lengkap: "Budi Ormawa",
      email: "budi@univ.ac.id",
      password: "pass_ormawa",
      jabatan: "Ketua BEM",
      role: "ormawa",
    },
    {
      name_lengkap: "Sari Dekan",
      email: "sari@univ.ac.id",
      password: "pass_dekan",
      jabatan: "Dekan Fakultas",
      role: "dekan",
    },
    {
      name_lengkap: "Eko SPI",
      email: "eko@univ.ac.id",
      password: "pass_spi",
      jabatan: "Internal Auditor",
      role: "SPI",
    },
    {
      name_lengkap: "Dina PPK",
      email: "dina@univ.ac.id",
      password: "pass_ppk",
      jabatan: "Pejabat Komitmen",
      role: "PPK",
    },
    {
      name_lengkap: "Roni Kabag",
      email: "roni@univ.ac.id",
      password: "pass_kabag",
      jabatan: "Kepala Bagian",
      role: "kabag",
    },
  ]);

  console.log("Seeding Success!");
};

seed().catch((err) => {
  console.log("gagal memuat seed");
  console.log(err);
});
