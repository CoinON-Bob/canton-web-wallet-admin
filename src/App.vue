<template>
  <router-view v-slot="{ Component }">
    <transition name="fade-page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style scoped>
.fade-page-enter-active,
.fade-page-leave-active {
  transition: opacity 0.2s ease-out;
}
.fade-page-enter-from,
.fade-page-leave-to {
  opacity: 0;
}
</style>
