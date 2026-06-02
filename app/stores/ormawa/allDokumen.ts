import { defineStore } from "pinia";
import { ref } from "vue";

export const useDokumentasiStore = defineStore("dokumentasiFetcher", () => {
  const dokumentasiList = ref<any[]>([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const perPage = ref(5);
  const totalItems = ref(0);
  const totalPages = ref(0);

  // Cache: menyimpan data per kegiatanId_page_row
  const cache = new Map<string, any>();

  const fetchDokumentasi = async (
    kegiatanId: number,
    page: number = 1,
    limit: number = 5,
  ) => {
    if (!kegiatanId) return;

    const cacheKey = `${kegiatanId}_${page}_${limit}`;

    // Cek cache
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      dokumentasiList.value = cached.data;
      totalItems.value = cached.total;
      currentPage.value = cached.page;
      perPage.value = cached.row;
      totalPages.value = cached.totalPages;
      return;
    }

    loading.value = true;
    try {
      const response: any = await $fetch(
        "/api/ormawa/dokumentasi/getAllDokumentasi",
        {
          method: "POST",
          body: {
            kegiatanId,
            page: page,
            row: limit,
          },
        },
      );
      console.log(response.data);
      if (response.success) {
        dokumentasiList.value = response.data || [];
        totalItems.value = Number(response.total) || 0;
        currentPage.value = Number(response.page) || page;
        perPage.value = Number(response.row) || limit;
        totalPages.value =
          Number(response.totalPages) ||
          Math.ceil(totalItems.value / perPage.value) ||
          1;

        // Simpan ke cache
        cache.set(cacheKey, {
          data: response.data,
          total: totalItems.value,
          page: currentPage.value,
          row: perPage.value,
          totalPages: totalPages.value,
        });
      }
    } catch (error) {
      console.error("Gagal fetch dokumentasi:", error);
      dokumentasiList.value = [];
    } finally {
      loading.value = false;
    }
  };

  const refreshDokumentasi = async (
    kegiatanId: number,
    page: number = 1,
    limit: number = 5,
  ) => {
    // Hapus semua cache untuk kegiatan ini
    for (const key of cache.keys()) {
      if (key.startsWith(`${kegiatanId}_`)) {
        cache.delete(key);
      }
    }
    await fetchDokumentasi(kegiatanId, page, limit);
  };

  const changePage = (kegiatanId: number, page: number) => {
    if (page < 1 || (totalPages.value > 0 && page > totalPages.value)) return;
    return fetchDokumentasi(kegiatanId, page, perPage.value);
  };

  const changePerPage = (kegiatanId: number, newLimit: number) => {
    return fetchDokumentasi(kegiatanId, 1, newLimit);
  };

  return {
    dokumentasiList,
    loading,
    currentPage,
    perPage,
    totalItems,
    totalPages,

    fetchDokumentasi,
    refreshDokumentasi,
    changePage,
    changePerPage,
  };
});
