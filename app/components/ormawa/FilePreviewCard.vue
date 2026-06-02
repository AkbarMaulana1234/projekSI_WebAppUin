<template>
  <div
    class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group"
  >
    <div
      class="aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center"
    >
      <!-- Loading State -->
      <div
        v-if="loading"
        class="absolute inset-0 flex items-center justify-center bg-slate-50"
      >
        <Icon
          name="heroicons:arrow-path"
          class="w-8 h-8 animate-spin text-slate-300"
        />
      </div>

      <!-- Preview Image -->
      <img
        v-if="!loading && isImage && url"
        :src="url"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        @error="handleError"
      />

      <!-- PDF Icon -->
      <div
        v-else-if="!loading && isPdf"
        class="flex flex-col items-center gap-2"
      >
        <Icon name="heroicons:document-text" class="w-12 h-12 text-red-500" />
        <span class="text-xs font-bold text-slate-400 uppercase"
          >PDF Document</span
        >
      </div>

      <!-- Error State -->
      <div
        v-else-if="!loading && error"
        class="flex flex-col items-center gap-2"
      >
        <Icon
          name="heroicons:exclamation-circle"
          class="w-10 h-10 text-slate-300"
        />
        <span class="text-xs text-slate-400">Gagal memuat file</span>
      </div>

      <!-- Action Overlay -->
      <div
        class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3"
      >
        <button
          @click="openFullPreview"
          class="p-2 bg-white rounded-lg text-slate-900 hover:bg-[#3b5988] hover:text-white transition-colors shadow-lg"
          title="Lihat Full"
        >
          <Icon name="heroicons:eye" class="w-5 h-5" />
        </button>
        <button
          @click="downloadFile"
          class="p-2 bg-white rounded-lg text-slate-900 hover:bg-[#3b5988] hover:text-white transition-colors shadow-lg"
          title="Download"
        >
          <Icon name="heroicons:arrow-down-tray" class="w-5 h-5" />
        </button>
      </div>
    </div>
    <div class="p-3 border-t border-slate-100">
      <p
        class="text-xs font-bold text-slate-500 uppercase tracking-wider truncate"
      >
        {{ label }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from "vue";

  const props = defineProps({
    label: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true },
  });

  const loading = ref(false); // No longer fetching, but could be used for image load
  const error = ref(false);

  const isImage = computed(() => props.type.startsWith("image/"));
  const isPdf = computed(() => props.type === "application/pdf");

  const openFullPreview = () => {
    if (props.url) {
      window.open(props.url, "_blank");
    }
  };

  const downloadFile = () => {
    if (!props.url) return;
    const link = document.createElement("a");
    link.href = props.url;
    link.download = `${props.label}.${props.type.split("/")[1]}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleError = () => {
    error.value = true;
  };
</script>
