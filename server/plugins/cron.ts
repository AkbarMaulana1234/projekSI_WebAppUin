import cron from "node-cron";
import { updateStatusKegiatanOtomatis } from "../utils/kegiatanCron";

export default defineNitroPlugin((nitroApp) => {
  console.log("[Nitro Plugin] Initialize Kegiatan Status Cron Job");

  // Menjalankan cron job setiap pergantian jam (menit ke-0)
  // Format: (detik) menit jam hari_bulan bulan hari_minggu
  // 0 * * * * -> Berjalan setiap jam pada menit ke-0
  cron.schedule("0 0 * * *", async () => {
    console.log("Cron job jalan sekali sehari (jam 00:00)");
    await updateStatusKegiatanOtomatis();
  });

  // Opsional: Jalankan sekali saat server pertama kali up untuk sinkronisasi awal
  updateStatusKegiatanOtomatis();
});
