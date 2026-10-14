<template>
  <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div class="min-w-0 space-y-1.5">
      <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{{ eyebrow }}</p>
      <h1 class="text-[1.7rem] font-semibold leading-none tracking-tight text-ink sm:text-3xl">{{ title }}</h1>
      <p class="max-w-2xl text-sm leading-relaxed text-muted">{{ description }}</p>
    </div>
    <div v-if="$slots.aside" class="shrink-0">
      <slot name="aside" />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow: string;
  title: string;
  description: string;
}>();
</script>
