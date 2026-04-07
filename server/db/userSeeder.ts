// db/seed.ts
import { useDrizzle } from ".";
import { usersTable } from "./schema/usersSchema";

const seed = async () => {
  const db = useDrizzle();

  console.log("Seeding started...");

  await db.insert(usersTable).values([
    {
      users_id: "01",
      email: "kaprodi@univ.ac.id",
      passwordHash: "pass123",
      fullName: "Kaprodi Satu",
      role: "kaprodi",
      isActive: true,
    },
    {
      users_id: "02",
      email: "ormawa@univ.ac.id",
      passwordHash: "pass123",
      fullName: "Ormawa Satu",
      role: "ormawa",
      isActive: true,
    },
    {
      users_id: "03",
      email: "ppk@univ.ac.id",
      passwordHash: "pass123",
      fullName: "PPK Satu",
      role: "ppk",
      isActive: true,
    },
    {
      users_id: "04",
      email: "spi@univ.ac.id",
      passwordHash: "pass123",
      fullName: "SPI Satu",
      role: "spi",
      isActive: true,
    },
  ]);

  console.log("Seeding Success!");
};

seed().catch((err) => {
  console.error("Gagal memuat seed:");
  console.error(err);
  process.exit(1);
});
