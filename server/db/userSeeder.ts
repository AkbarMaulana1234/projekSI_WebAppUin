import { useDrizzle } from ".";
import * as schema from "./schema/usersSchema";

const seed = async () => {
  const db = useDrizzle();

  console.log("Seeding started...");

  await db.insert(schema.usersTable).values([
    {
      id_users: "198501012010121001", // Contoh NIP 18 digit
      name_lengkap: "Andi Kaprodi",
      email: "andi@univ.ac.id",
      password: "pass_kaprodi",
      jabatan: "Kaprodi Informatika",
      role: "kaprodi",
    },
    {
      id_users: "202100801011002", // Contoh NIM 15 digit
      name_lengkap: "Budi Ormawa",
      email: "budi@univ.ac.id",
      password: "pass_ormawa",
      jabatan: "Ketua BEM",
      role: "ormawa",
    },
    {
      id_users: "197505121998032002",
      name_lengkap: "Sari Dekan",
      email: "sari@univ.ac.id",
      password: "pass_dekan",
      jabatan: "Dekan Fakultas",
      role: "dekan",
    },
    {
      id_users: "198808222015041003",
      name_lengkap: "Eko SPI",
      email: "eko@univ.ac.id",
      password: "pass_spi",
      jabatan: "Internal Auditor",
      role: "SPI",
    },
    {
      id_users: "199002142018012005",
      name_lengkap: "Dina PPK",
      email: "dina@univ.ac.id",
      password: "pass_ppk",
      jabatan: "Pejabat Komitmen",
      role: "PPK",
    },
    {
      id_users: "198203032005011004",
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
  console.error("Gagal memuat seed:");
  console.error(err);
  process.exit(1);
});
