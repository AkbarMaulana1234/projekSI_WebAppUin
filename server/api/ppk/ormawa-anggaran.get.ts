import { useDrizzle } from "../../db/index";
import { ormawaTable } from "../../db/schema/ormawaSchema";
import { programStudiTable } from "../../db/schema/programStudiSchema";
import { fakultasTable } from "../../db/schema/fakultasSchema";
import { pengajuanRabTable } from "../../db/schema/pengajuanRabSchema";
import { eq, sum, sql } from "drizzle-orm";

export default defineEventHandler(async () => {
  const db = useDrizzle();

  // Ambil data ormawa dengan join ke program studi dan fakultas
  const ormawaData = await db
    .select({
      id: ormawaTable.id,
      nama: ormawaTable.nama,
      kode: ormawaTable.kode,
      totalAnggaran: ormawaTable.totalAnggaran,
      prodiId: ormawaTable.prodiId,
      prodiNama: programStudiTable.nama,
      prodiKode: programStudiTable.kode,
      fakultasId: programStudiTable.fakultasId,
      fakultasNama: fakultasTable.nama,
      fakultasKode: fakultasTable.kode,
    })
    .from(ormawaTable)
    .innerJoin(programStudiTable, eq(ormawaTable.prodiId, programStudiTable.id))
    .innerJoin(fakultasTable, eq(programStudiTable.fakultasId, fakultasTable.id));

  // Hitung anggaran yang sudah terpakai per ormawa
  const anggaranTerpakai = await db
    .select({
      ormawaId: pengajuanRabTable.users_id,
      totalTerpakai: sum(sql`CAST(${pengajuanRabTable.total_anggaran} AS DECIMAL(15,2))`),
    })
    .from(pengajuanRabTable)
    .groupBy(pengajuanRabTable.users_id);

  // Gabungkan data
  const result = ormawaData.map((ormawa) => {
    const terpakai = anggaranTerpakai.find(
      (item) => item.ormawaId === ormawa.id
    );
    const anggaranTerpakaiAmount = terpakai?.totalTerpakai || 0;
    const sisaAnggaran = ormawa.totalAnggaran - Number(anggaranTerpakaiAmount);

    return {
      id: ormawa.id,
      nama: ormawa.nama,
      kode: ormawa.kode,
      fakultas: {
        id: ormawa.fakultasId,
        nama: ormawa.fakultasNama,
        kode: ormawa.fakultasKode,
      },
      programStudi: {
        id: ormawa.prodiId,
        nama: ormawa.prodiNama,
        kode: ormawa.prodiKode,
      },
      anggaran: {
        total: ormawa.totalAnggaran,
        terpakai: Number(anggaranTerpakaiAmount),
        sisa: sisaAnggaran,
      },
    };
  });

  // Kelompokkan berdasarkan fakultas
  const groupedByFakultas = result.reduce((acc, ormawa) => {
    const fakultasKey = ormawa.fakultas.nama;
    if (!acc[fakultasKey]) {
      acc[fakultasKey] = {
        fakultas: ormawa.fakultas,
        ormawa: [],
        totalAnggaranFakultas: 0,
        totalTerpakaiFakultas: 0,
        totalSisaFakultas: 0,
      };
    }
    acc[fakultasKey].ormawa.push(ormawa);
    acc[fakultasKey].totalAnggaranFakultas += ormawa.anggaran.total;
    acc[fakultasKey].totalTerpakaiFakultas += ormawa.anggaran.terpakai;
    acc[fakultasKey].totalSisaFakultas += ormawa.anggaran.sisa;
    return acc;
  }, {} as Record<string, any>);

  return {
    data: Object.values(groupedByFakultas),
    summary: {
      totalFakultas: Object.keys(groupedByFakultas).length,
      totalOrmawa: result.length,
      totalAnggaranKeseluruhan: result.reduce((sum, item) => sum + item.anggaran.total, 0),
      totalTerpakaiKeseluruhan: result.reduce((sum, item) => sum + item.anggaran.terpakai, 0),
      totalSisaKeseluruhan: result.reduce((sum, item) => sum + item.anggaran.sisa, 0),
    },
  };
});