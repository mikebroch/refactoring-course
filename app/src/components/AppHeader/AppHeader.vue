<template>
  <h1 class="navbar">{{ title }}</h1>
</template>

<script>
export default {
  name: "AppHeader",
  props: {
    title: String
  }
};
</script>
