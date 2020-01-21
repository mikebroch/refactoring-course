<template>
  <div id="app">
    <!-- Header -->
    <div class="columns">
      <div class="column is-full">
        <app-header :title="title"></app-header>
        sdfsdfd
        <stepper></stepper>
      </div>
    </div>
  </div>
</template>

<script>
import stepper from "./components/Stepper/Stepper";
import AppHeader from "./components/AppHeader/AppHeader";
export default {
  name: "app",
  components: {
    stepper,
    AppHeader
  }
};
</script>

<style lang="scss" scoped></style>
