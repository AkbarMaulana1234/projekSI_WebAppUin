import { eq } from "drizzle-orm";
import { useDrizzle } from "~~/server/db";
import {
  pengajuanRabTable,
  approvalLogTable,
} from "~~/server/db/schema";

// Mapping keputusan PPK ke statusEnum dan action approval_log
const KEPUTUSAN_MAP = {
  disetujui: {
    statusBaru: "waiting_spi" as const,
    action: "disetujui",
  },
  revisi: {
    statusBaru: "revisi_ppk" as const,
    action: "revisi",
  },
  tolak: {
    statusBaru: "revisi_ppk" as const,
    action: "ditolak",
  },
} as const;

type Keputusan = keyof typeof KEPUTUSAN_MAP;

export default defineEventHandler(async (event) => {
  try {
    const id = Number(getRouterParam(event, "id"));
    if (isNaN(id) || id <= 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID pengajuan tidak valid",
      });
    }

    const body = await readBody(event);
    const { keputusan, catatan } = body ?? {};

    // Validasi keputusan
    if (!keputusan || !Object.keys(KEPUTUSAN_MAP).includes(keputusan)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Keputusan tidak valid. Pilihan: ${Object.keys(KEPUTUSAN_MAP).join(", ")}`,
      });
    }

    // Catatan wajib jika revisi atau tolak
    if ((keputusan === "revisi" || keputusan === "tolak") && !catatan?.trim()) {
      throw createError({
        statusCode: 400,
        statusMessage: "Catatan wajib diisi untuk keputusan revisi atau tolak",
      });
    }

    const db = useDrizzle();
    const user = event.context.user;

    // Pastikan pengajuan ada dan statusnya memang waiting_ppk
    const [pengajuan] = await db
      .select({
        id: pengajuanRabTable.id,
        status: pengajuanRabTable.status,
        judulKegiatan: pengajuanRabTable.judulKegiatan,
      })
      .from(pengajuanRabTable)
      .where(eq(pengajuanRabTable.id, id));

    if (!pengajuan) {
      throw createError({
        statusCode: 404,
        statusMessage: "Pengajuan tidak ditemukan",
      });
    }

    if (pengajuan.status !== "waiting_ppk") {
      throw createError({
        statusCode: 422,
        statusMessage: `Pengajuan tidak bisa diproses. Status saat ini: ${pengajuan.status}`,
      });
    }

    const { statusBaru, action } = KEPUTUSAN_MAP[keputusan as Keputusan];

    // Jalankan update status + insert approval_log dalam satu transaksi
    await db.transaction(async (tx) => {
      await tx
        .update(pengajuanRabTable)
        .set({
          status: statusBaru,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(pengajuanRabTable.id, id));

      await tx.insert(approvalLogTable).values({
        pengajuanRabId: id,
        actorId: user.id,
        action,
        catatanRevisi: catatan?.trim() ?? "",
      });
    });

    return {
      success: true,
      message: `Pengajuan berhasil ${action === "disetujui" ? "disetujui dan diteruskan ke SPI" : action === "revisi" ? "dikembalikan untuk revisi" : "ditolak"}`,
      data: {
        pengajuanId: id,
        keputusan: action,
        statusBaru,
      },
    };
  } catch (error: any) {
    console.error("Error POST /api/ppk/kegiatan/[id]/keputusan:", error);
    if (error.statusCode) throw error;
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal memproses keputusan",
      data: error,
    });
  }
});