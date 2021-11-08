<template>
  <div :class="'preview print_' + print">
    <h3>{{ name }}</h3>
    <h1 class="code">{{ code }}</h1>
    <h3>{{ moment(date).format('DD/MM/YYYY') }}</h3>
  </div>
</template>

<script lang="ts">
import moment from 'moment'
import 'moment/locale/en-au'
export default {
  name: 'Preview',
  props: ['code', 'name', 'date', 'print'],
  data() {
    return {
      moment,
    }
  },
}
</script>

<style lang="scss" scoped>
.preview {
  h1,
  h2,
  h3,
  h4,
  p,
  span,
  button {
    font-family: 'Inconsolata', sans-serif;
  }

  font-family: monospace;
  max-width: 45vw;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: white;
  border-radius: 0.75em;
  padding: 10px;
  h1 {
    margin-top: 15vh !important;
    margin-bottom: 10vh !important;
    white-space: nowrap;
    max-width: 100vw;
    font-size: 3.5vh;
  }
  h3 {
    white-space: nowrap;
    max-width: 100vw;
    font-size: 3.5vh;
  }
}

.print_true {
  justify-content: space-around;
  height: 100vh;
  h1 {
    font-size: 4vw;
  }
  h3 {
    font-size: 4vw;
  }
}
</style>
