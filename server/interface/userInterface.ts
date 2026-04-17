export interface User {
  id: number;
  username: string;
  email: string;
  role: "ormawa" | "kaprodi" | "spi" | "ppk" | null;
  fakultas: number | null;
  prodi: number | null;
  ormawa: number | null;
}
