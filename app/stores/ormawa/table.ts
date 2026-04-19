export const useTableStore = defineStore("tableStore", {
  state: () => ({
    page: 1,
    rowSkip: 5,
    table: [],
    total: 0,
    offset: 0,
  }),

  actions: {
    async getTable() {
      const res = await $fetch("/api/ormawa/dashboard/table", {
        method: "POST",
        body: {
          page: this.page,
          row: this.rowSkip,
        },
        credentials: "include",
      });
      console.log(res);
      this.table = res.data;
      this.total = res.total;
      this.offset = res.offset;
    },

    async nextPage() {
      this.page++;
      await this.getTable();
    },

    async prevPage() {
      if (this.page > 1) {
        this.page--;
        await this.getTable();
      }
    },
  },
});
