<template>
  <div :class="'preview print_' + print">
    <h3>{{ name }}</h3>
    <h1 class="code">{{ code }}</h1>
    <h3>{{ date }}</h3>
  </div>
</template>

<script lang="ts">
export default {
  props: ['code', 'name', 'date', 'print'],
  data() {
    return {}
  },
}
</script>

<style lang="scss" scoped>
.preview {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: white;
  border-radius: 0.75em;
  padding: 10px;
  h1 {
    margin-top: 10vh !important;
    margin-bottom: 10vh !important;
    white-space: nowrap;
    max-width: 100vw;
    font-size: 4vw;
  }
  h3 {
    white-space: nowrap;
    max-width: 100vw;
    font-size: 3vw;
  }
}

.print_true {
  justify-content: space-around;
  height: 100vh;
}
</style>
