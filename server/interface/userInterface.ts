export interface User {
  id: string;
  username: string;
  email: string;
  role: "ormawa" | "kaprodi" | "spi" | "ppk" | null;
  fakultas: number | null;
  prodi: number | null;
  ormawa: number | null;
}
