import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";

export type Category = "Lpg" | "Rab";
export type Status =
  | "DiTolak"
  | "Selesai"
  | "SedangBerlangsung"
  | "sedangDiAjukan";

const rootPath = join(cwd(), "uploads");
export async function createFilePath(
  category: Category,
  status: Status,
): Promise<string> {
  try {
    const targetPath = join(rootPath, category, status);
    await mkdir(targetPath, { recursive: true });
    return targetPath;
  } catch (error) {
    console.error("gagal bikin folder!", error);
    throw error;
  }
}
