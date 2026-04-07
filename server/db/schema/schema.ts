// db/relations/index.ts
import { relations } from "drizzle-orm";
import { fakultasTable } from "../schema/fakultasSchema";
import { programStudiTable } from "../schema/programStudiSchema";
import { ormawaTable } from "../schema/ormawaSchema";
import { usersTable } from "../schema/usersSchema";
import { pengajuanRabTable } from "../schema/pengajuanRabSchema";
import { approvalLogTable } from "../schema/approvalLogSchema";
import { kegiatanTable } from "../schema/KegiatanSchema";
import { dokumentasiKegiatanTable } from "../schema/dokumentasiSchema";
import { tagihanPencairanTable } from "../schema/TagihanPencairanSchema";
import { pembayaranTable } from "../schema/PembayaranSchema";
import { lpgTable } from "../schema/lpgSchema";
import { revisiLpgLogTable } from "../schema/revisiLpgLogSchema";
import { auditLogTable } from "../schema/auditLogSchema";

// ============================================
// FAKULTAS
// ============================================
export const fakultasRelations = relations(fakultasTable, (r) => ({
  programStudi: r.many(programStudiTable),
}));

// ============================================
// PROGRAM STUDI
// ============================================
export const programStudiRelations = relations(programStudiTable, (r) => ({
  fakultas: r.one(fakultasTable, {
    fields: [programStudiTable.fakultasId],
    references: [fakultasTable.id],
  }),
  ormawa: r.many(ormawaTable),
  users: r.many(usersTable),
}));

// ============================================
// ORMAWA
// ============================================
export const ormawaRelations = relations(ormawaTable, (r) => ({
  programStudi: r.one(programStudiTable, {
    fields: [ormawaTable.prodiId],
    references: [programStudiTable.id],
  }),
  users: r.many(usersTable),
}));

// ============================================
// USERS
// ============================================
export const usersRelations = relations(usersTable, (r) => ({
  prodi: r.one(programStudiTable, {
    fields: [usersTable.prodiId],
    references: [programStudiTable.id],
  }),
  ormawa: r.one(ormawaTable, {
    fields: [usersTable.ormawaId],
    references: [ormawaTable.id],
  }),
  fakultas: r.one(fakultasTable, {
    fields: [usersTable.fakultasId],
    references: [fakultasTable.id],
  }),
  // Relasi ke pengajuanRab (sebagai pengaju)
  pengajuanRab: r.many(pengajuanRabTable, { relationName: "pengaju" }),
  // Relasi ke approvalLog (sebagai actor)
  approvalLogs: r.many(approvalLogTable, { relationName: "actor" }),
  // Relasi ke dokumentasiKegiatan (sebagai uploader)
  dokumentasiUploads: r.many(dokumentasiKegiatanTable, {
    relationName: "uploader",
  }),
  // Relasi ke tagihanPencairan (sebagai creator)
  tagihanDibuat: r.many(tagihanPencairanTable, { relationName: "creator" }),
  // Relasi ke pembayaran (sebagai ppk)
  pembayaranDilakukan: r.many(pembayaranTable, { relationName: "ppk" }),
  // Relasi ke revisiLpgLog (sebagai requester)
  revisiLpgDiminta: r.many(revisiLpgLogTable, { relationName: "requester" }),
  // Relasi ke auditLog
  auditLogs: r.many(auditLogTable),
}));

// ============================================
// PENGAJUAN RAB
// ============================================
export const pengajuanRabRelations = relations(pengajuanRabTable, (r) => ({
  pengaju: r.one(usersTable, {
    fields: [pengajuanRabTable.users_id],
    references: [usersTable.id],
    relationName: "pengaju",
  }),
  approvalLogs: r.many(approvalLogTable),
  kegiatan: r.many(kegiatanTable),
}));

// ============================================
// APPROVAL LOG
// ============================================
export const approvalLogRelations = relations(approvalLogTable, (r) => ({
  pengajuanRab: r.one(pengajuanRabTable, {
    fields: [approvalLogTable.pengajuanRabId],
    references: [pengajuanRabTable.id],
  }),
  actor: r.one(usersTable, {
    fields: [approvalLogTable.actorId],
    references: [usersTable.id],
    relationName: "actor",
  }),
}));

// ============================================
// KEGIATAN
// ============================================
export const kegiatanRelations = relations(kegiatanTable, (r) => ({
  pengajuanRab: r.one(pengajuanRabTable, {
    fields: [kegiatanTable.pengajuanRabId],
    references: [pengajuanRabTable.id],
  }),
  dokumentasi: r.many(dokumentasiKegiatanTable),
  tagihan: r.many(tagihanPencairanTable),
  lpg: r.many(lpgTable),
}));

// ============================================
// DOKUMENTASI KEGIATAN
// ============================================
export const dokumentasiKegiatanRelations = relations(
  dokumentasiKegiatanTable,
  (r) => ({
    kegiatan: r.one(kegiatanTable, {
      fields: [dokumentasiKegiatanTable.kegiatanId],
      references: [kegiatanTable.id],
    }),
    uploader: r.one(usersTable, {
      fields: [dokumentasiKegiatanTable.uploadedBy],
      references: [usersTable.id],
      relationName: "uploader",
    }),
  }),
);

// ============================================
// TAGIHAN PENCAIRAN
// ============================================
export const tagihanPencairanRelations = relations(
  tagihanPencairanTable,
  (r) => ({
    kegiatan: r.one(kegiatanTable, {
      fields: [tagihanPencairanTable.kegiatanId],
      references: [kegiatanTable.id],
    }),
    creator: r.one(usersTable, {
      fields: [tagihanPencairanTable.createdBy],
      references: [usersTable.id],
      relationName: "creator",
    }),
    pembayaran: r.many(pembayaranTable),
  }),
);

// ============================================
// PEMBAYARAN
// ============================================
export const pembayaranRelations = relations(pembayaranTable, (r) => ({
  tagihan: r.one(tagihanPencairanTable, {
    fields: [pembayaranTable.tagihanId],
    references: [tagihanPencairanTable.id],
  }),
  ppk: r.one(usersTable, {
    fields: [pembayaranTable.ppkId],
    references: [usersTable.id],
    relationName: "ppk",
  }),
}));

// ============================================
// LPG
// ============================================
export const lpgRelations = relations(lpgTable, (r) => ({
  kegiatan: r.one(kegiatanTable, {
    fields: [lpgTable.kegiatanId],
    references: [kegiatanTable.id],
  }),
  revisiLogs: r.many(revisiLpgLogTable),
}));

// ============================================
// REVISI LPG LOG
// ============================================
export const revisiLpgLogRelations = relations(revisiLpgLogTable, (r) => ({
  lpg: r.one(lpgTable, {
    fields: [revisiLpgLogTable.lpgId],
    references: [lpgTable.id],
  }),
  requester: r.one(usersTable, {
    fields: [revisiLpgLogTable.requesterId],
    references: [usersTable.id],
    relationName: "requester",
  }),
}));

// ============================================
// AUDIT LOG
// ============================================
export const auditLogRelations = relations(auditLogTable, (r) => ({
  user: r.one(usersTable, {
    fields: [auditLogTable.userId],
    references: [usersTable.id],
  }),
}));
