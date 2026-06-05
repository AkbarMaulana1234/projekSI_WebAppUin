import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { cwd } from "node:process";
import { eq, sql } from "drizzle-orm";
import type { useDrizzle } from "~~/server/db";
import {
  dokumentasiKegiatanTable,
  kegiatanTable,
  pengajuanRabTable,
  tagihanPencairanTable,
  usersTable,
  ormawaTable,
} from "~~/server/db/schema";

export const GROUP_ID_OFFSET = 1_000_000;

type PencairanMeta = {
  spbFileUrl?: string | null;
  kwitansiFileUrl?: string | null;
  dokumentasiId?: number | null;
  transferDone?: boolean | null;
};

const pencairanMetaPath = (tagihanId: number) =>
  join(cwd(), "uploads", "ppk", "meta", `${tagihanId}.json`);

export async function readPencairanMeta(tagihanId: number): Promise<PencairanMeta> {
  try {
    const raw = await readFile(pencairanMetaPath(tagihanId), "utf-8");
    return JSON.parse(raw) as PencairanMeta;
  } catch {
    return {};
  }
}

export async function writePencairanMeta(
  tagihanId: number,
  patch: Partial<PencairanMeta>,
): Promise<PencairanMeta> {
  await mkdir(join(cwd(), "uploads", "ppk", "meta"), { recursive: true });
  const current = await readPencairanMeta(tagihanId);
  const next = { ...current, ...patch };
  await writeFile(pencairanMetaPath(tagihanId), JSON.stringify(next, null, 2), "utf-8");
  return next;
}

export async function getDokumenPpkFromMeta(tagihanId: number) {
  const meta = await readPencairanMeta(tagihanId);
  return {
    spbFileUrl: meta.spbFileUrl ?? null,
    kwitansiFileUrl: meta.kwitansiFileUrl ?? null,
  };
}

export const normalizeText = (value?: string | null) => (value ?? "").trim();

export const makeVirtualId = (dokumentasiId: number) => -Math.abs(dokumentasiId);

export const makeGroupId = (kegiatanId: number) =>
  -(GROUP_ID_OFFSET + Math.abs(kegiatanId));

export const isGroupId = (id: number) => id <= -GROUP_ID_OFFSET;

export const groupIdToKegiatanId = (id: number) => Math.abs(id) - GROUP_ID_OFFSET;

export const routeIdToDokumentasiId = (id: number) =>
  id < 0 && !isGroupId(id) ? Math.abs(id) : null;

// ✅ FIX: Decode URL-safe ID kembali ke format asli
// "v123" → -123 (virtual ID)
// "g123" → -1000123 (group ID)
// "5" → 5 (positif ID)
export const decodeUrlId = (urlId: any): number => {
  const str = String(urlId || "");

  if (str.startsWith("g")) {
    const kegiatanId = Number(str.slice(1));
    return Number.isNaN(kegiatanId) ? 0 : -(GROUP_ID_OFFSET + kegiatanId);
  }

  if (str.startsWith("v")) {
    const dokumentasiId = Number(str.slice(1));
    return Number.isNaN(dokumentasiId) ? 0 : -dokumentasiId;
  }

  const num = Number(str);
  return Number.isNaN(num) ? 0 : num;
};

/** Format datetime yang diterima kolom MySQL timestamp (bukan ISO dengan Z). */
export const mysqlTimestamp = () =>
  new Date().toISOString().slice(0, 19).replace("T", " ");

export const toPublicUploadUrl = (value?: string | null) => {
  if (!value) return null;

  let normalized = value.replace(/\\/g, "/").trim();
  const lower = normalized.toLowerCase();
  const uploadsIdx = lower.indexOf("uploads/");

  if (uploadsIdx >= 0) {
    normalized = normalized.slice(uploadsIdx);
  } else if (!normalized.includes("/")) {
    // Hanya nama file — path default upload jasa/barang
    normalized = `uploads/dokumentasi/jasa/${normalized}`;
  } else if (!lower.startsWith("uploads/")) {
    normalized = `uploads/${normalized.replace(/^\/+/, "")}`;
  }

  const withSlash = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return withSlash
    .split("/")
    .map((segment, index) => (index === 0 ? segment : encodeURIComponent(segment)))
    .join("/");
};

export const buildDocKey = (row: {
  kegiatanId: number;
  tipeTagihan: string;
  namaPenerima: string;
  rekeningPenerima: string;
}) =>
  [
    row.kegiatanId,
    row.tipeTagihan,
    normalizeText(row.namaPenerima).toLowerCase(),
    normalizeText(row.rekeningPenerima),
  ].join("|");

type DokumentasiRow = {
  dokumentasiId: number;
  kegiatanId: number;
  tipeDokumen: string;
  deskripsi: string | null;
  createdAt: string;
  namaToko: string | null;
  nomorRekeningToko: string | null;
  namaPemilikRekeningToko: string | null;
  fotoBarangUrl: string | null;
  strukBelanjaUrl: string | null;
  namaPenyediaJasa: string | null;
  nomorRekeningJasa: string | null;
  namaPemilikRekeningJasa: string | null;
  skUrl: string | null;
  spmtUrl: string | null;
  amprahUrl: string | null;
  npwpUrl: string | null;
  ktpUrl: string | null;
};

export const buildDokumenUpload = (row: DokumentasiRow) => {
  const isBarang = row.tipeDokumen === "BARANG";
  if (isBarang) {
    return [
      {
        id: "foto_barang",
        nama: "Foto Barang",
        url: toPublicUploadUrl(row.fotoBarangUrl),
        uploaded: Boolean(row.fotoBarangUrl),
      },
      {
        id: "struk_belanja",
        nama: "Foto Bon / Struk",
        url: toPublicUploadUrl(row.strukBelanjaUrl),
        uploaded: Boolean(row.strukBelanjaUrl),
      },
      {
        id: "nama_toko",
        nama: "Nama Toko",
        url: null,
        uploaded: Boolean(row.namaToko),
      },
      {
        id: "rekening_toko",
        nama: "No. Rekening Toko",
        url: null,
        uploaded: Boolean(row.nomorRekeningToko),
      },
      {
        id: "pemilik_rekening",
        nama: "Nama Pemilik Rekening",
        url: null,
        uploaded: Boolean(row.namaPemilikRekeningToko),
      },
    ];
  }

  return [
    {
      id: "sk",
      nama: "SK (Surat Keputusan)",
      url: toPublicUploadUrl(row.skUrl),
      uploaded: Boolean(row.skUrl),
    },
    {
      id: "spmt",
      nama: "SPMT",
      url: toPublicUploadUrl(row.spmtUrl),
      uploaded: Boolean(row.spmtUrl),
    },
    {
      id: "amprah",
      nama: "Amprah",
      url: toPublicUploadUrl(row.amprahUrl),
      uploaded: Boolean(row.amprahUrl),
    },
    {
      id: "npwp",
      nama: "NPWP",
      url: toPublicUploadUrl(row.npwpUrl),
      uploaded: Boolean(row.npwpUrl),
    },
    {
      id: "ktp",
      nama: "Foto KTP",
      url: toPublicUploadUrl(row.ktpUrl),
      uploaded: Boolean(row.ktpUrl),
    },
    {
      id: "rekening_penerima",
      nama: "No. Rekening Penerima",
      url: null,
      uploaded: Boolean(row.nomorRekeningJasa),
    },
    {
      id: "pemilik_rekening",
      nama: "Nama Pemilik Rekening",
      url: null,
      uploaded: Boolean(row.namaPemilikRekeningJasa),
    },
  ];
};

export const isAllDocsUploaded = (docs: { uploaded: boolean }[]) =>
  docs.length > 0 && docs.every((doc) => doc.uploaded);

export const getPenerimaFromDokumentasi = (row: DokumentasiRow) => {
  const isBarang = row.tipeDokumen === "BARANG";
  const namaPenerima = isBarang
    ? normalizeText(row.namaPemilikRekeningToko || row.namaToko)
    : normalizeText(row.namaPemilikRekeningJasa || row.namaPenyediaJasa);
  const rekeningPenerima = isBarang
    ? normalizeText(row.nomorRekeningToko)
    : normalizeText(row.nomorRekeningJasa);

  return {
    isBarang,
    namaPenerima,
    rekeningPenerima,
    detailPenerima: isBarang
      ? {
          namaItem: row.namaToko,
          namaToko: row.namaToko,
          nomorRekening: row.nomorRekeningToko,
          namaPemilikRekening: row.namaPemilikRekeningToko,
        }
      : {
          namaItem: row.namaPenyediaJasa,
          namaPenyediaJasa: row.namaPenyediaJasa,
          nomorRekening: row.nomorRekeningJasa,
          namaPemilikRekening: row.namaPemilikRekeningJasa,
        },
  };
};

export type TagihanLookup = {
  tagihanId: number;
  statusTagihan: string | null;
  nominal: string | null;
  spbFileUrl: string | null;
  kwitansiFileUrl: string | null;
};

export async function findTagihanForDokumentasi(
  db: ReturnType<typeof useDrizzle>,
  params: {
    kegiatanId: number;
    tipeTagihan: string;
    namaPenerima: string;
    rekeningPenerima: string;
  },
): Promise<TagihanLookup | null> {
  const rows = await db
    .select({
      tagihanId: tagihanPencairanTable.id,
      statusTagihan: tagihanPencairanTable.statusTagihan,
      nominal: tagihanPencairanTable.nominal,
      namaPenerima: tagihanPencairanTable.namaPenerima,
      rekeningPenerima: tagihanPencairanTable.rekeningPenerima,
      kegiatanId: tagihanPencairanTable.kegiatanId,
      tipeTagihan: tagihanPencairanTable.tipeTagihan,
    })
    .from(tagihanPencairanTable)
    .where(eq(tagihanPencairanTable.kegiatanId, params.kegiatanId));

  const docKey = buildDocKey({
    kegiatanId: params.kegiatanId,
    tipeTagihan: params.tipeTagihan,
    namaPenerima: params.namaPenerima,
    rekeningPenerima: params.rekeningPenerima,
  });

  const matched = rows.find(
    (item) =>
      buildDocKey({
        kegiatanId: item.kegiatanId,
        tipeTagihan: item.tipeTagihan,
        namaPenerima: item.namaPenerima,
        rekeningPenerima: item.rekeningPenerima,
      }) === docKey,
  );

  if (!matched) return null;

  const meta = await readPencairanMeta(matched.tagihanId);
  const spbFileUrl = meta.spbFileUrl ?? null;
  const kwitansiFileUrl = meta.kwitansiFileUrl ?? null;

  return {
    tagihanId: matched.tagihanId,
    statusTagihan: matched.statusTagihan,
    nominal: matched.nominal,
    spbFileUrl,
    kwitansiFileUrl,
  };
}

export async function ensureTagihanForDokumentasi(
  db: ReturnType<typeof useDrizzle>,
  dokumentasiId: number,
  ppkUserId: number,
  fakultasId: number,
) {
  const [row] = await db
    .select({
      dokumentasiId: dokumentasiKegiatanTable.id,
      kegiatanId: dokumentasiKegiatanTable.kegiatanId,
      tipeDokumen: dokumentasiKegiatanTable.tipeDokumen,
      deskripsi: dokumentasiKegiatanTable.deskripsi,
      createdAt: dokumentasiKegiatanTable.createdAt,
      namaToko: dokumentasiKegiatanTable.namaToko,
      nomorRekeningToko: dokumentasiKegiatanTable.nomorRekeningToko,
      namaPemilikRekeningToko: dokumentasiKegiatanTable.namaPemilikRekeningToko,
      fotoBarangUrl: dokumentasiKegiatanTable.fotoBarangUrl,
      strukBelanjaUrl: dokumentasiKegiatanTable.strukBelanjaUrl,
      namaPenyediaJasa: dokumentasiKegiatanTable.namaPenyediaJasa,
      nomorRekeningJasa: dokumentasiKegiatanTable.nomorRekeningJasa,
      namaPemilikRekeningJasa: dokumentasiKegiatanTable.namaPemilikRekeningJasa,
      skUrl: dokumentasiKegiatanTable.skUrl,
      spmtUrl: dokumentasiKegiatanTable.spmtUrl,
      amprahUrl: dokumentasiKegiatanTable.amprahUrl,
      npwpUrl: dokumentasiKegiatanTable.npwpUrl,
      ktpUrl: dokumentasiKegiatanTable.ktpUrl,
      pengajuFakultasId: usersTable.fakultasId,
    })
    .from(dokumentasiKegiatanTable)
    .innerJoin(usersTable, eq(dokumentasiKegiatanTable.uploadedBy, usersTable.id))
    .where(eq(dokumentasiKegiatanTable.id, dokumentasiId));

  if (!row || row.pengajuFakultasId !== fakultasId) {
    return null;
  }

  const penerima = getPenerimaFromDokumentasi(row);

  const existing = await findTagihanForDokumentasi(db, {
    kegiatanId: row.kegiatanId,
    tipeTagihan: row.tipeDokumen,
    namaPenerima: penerima.namaPenerima,
    rekeningPenerima: penerima.rekeningPenerima,
  });

  if (existing) {
    await writePencairanMeta(existing.tagihanId, { dokumentasiId });
    return existing.tagihanId;
  }

  const [kegiatan] = await db
    .select({ pengajuanRabId: kegiatanTable.pengajuanRabId })
    .from(kegiatanTable)
    .where(eq(kegiatanTable.id, row.kegiatanId));

  const [pengajuan] = kegiatan
    ? await db
        .select({ totalAnggaran: pengajuanRabTable.totalAnggaran })
        .from(pengajuanRabTable)
        .where(eq(pengajuanRabTable.id, kegiatan.pengajuanRabId))
        .limit(1)
    : [];

  const insertResult = await db.execute(sql`
    INSERT INTO tagihan_pencairan (
      kegiatan_id, tipe_tagihan, nama_penerima, rekening_penerima,
      nominal, toko_nama, struk_file_url, sk_file_url, status_tagihan, created_by
    ) VALUES (
      ${row.kegiatanId}, ${row.tipeDokumen},
      ${penerima.namaPenerima || "Penerima"}, ${penerima.rekeningPenerima || "-"},
      ${pengajuan?.totalAnggaran ?? "0"}, ${row.namaToko ?? null},
      ${row.strukBelanjaUrl ?? null}, ${row.skUrl ?? null},
      ${"WAITING_PEMBAYARAN"}, ${ppkUserId}
    )
  `);
  const header = insertResult as unknown as { insertId?: number };
  const tagihanId = Number(header.insertId ?? 0);
  if (tagihanId) {
    await writePencairanMeta(tagihanId, { dokumentasiId });
  }
  return tagihanId;
}

export async function resolveTagihanId(
  db: ReturnType<typeof useDrizzle>,
  routeId: number,
  ppkUserId: number,
  fakultasId: number,
) {
  return Math.abs(routeId);
}

export async function assertPpkAksesTagihan(
  db: ReturnType<typeof useDrizzle>,
  tagihanId: number,
  fakultasId: string | number | null | undefined,
): Promise<boolean> {
  // If PPK has no faculty, allow unrestricted access
  if (!fakultasId) {
    return true;
  }

  const ppkFakultasIdStr = String(fakultasId);
  const ppkFakultasIdNum = Number(fakultasId);

  const [tagihan] = await db
    .select({
      fakultasId: tagihanPencairanTable.fakultasId,
      creatorFakultasId: usersTable.fakultasId,
      ormawaFakultasId: ormawaTable.fakultasId,
    })
    .from(tagihanPencairanTable)
    .innerJoin(usersTable, eq(tagihanPencairanTable.createdBy, usersTable.id))
    .leftJoin(ormawaTable, eq(usersTable.ormawaId, ormawaTable.id))
    .where(eq(tagihanPencairanTable.id, tagihanId));

  if (!tagihan) {
    return true; // Let caller throw 404
  }

  return (
    String(tagihan.fakultasId) === ppkFakultasIdStr ||
    tagihan.creatorFakultasId === ppkFakultasIdNum ||
    tagihan.ormawaFakultasId === ppkFakultasIdNum
  );
}

export async function resolveVirtualStatus(
  dbStatus: string | null,
  tagihanId: number,
): Promise<string | null> {
  if (dbStatus !== "TERVERIFIKASI") {
    return dbStatus;
  }

  const meta = await readPencairanMeta(tagihanId);
  if (meta.transferDone) {
    return "TRANSFER_DILAKUKAN";
  }

  if (meta.spbFileUrl && meta.kwitansiFileUrl) {
    return "TERVERIFIKASI";
  }

  return "DOKUMEN_LENGKAP";
}
