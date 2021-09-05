<template>
  <main>
    <h1>Home page</h1>
    <a-button type="primary">
      <NuxtLink to="/create"> Create </NuxtLink>
    </a-button>
    <a-button type="primary">
      <NuxtLink to="/upload"> Upload </NuxtLink>
    </a-button>
    <a-button type="primary">
      <NuxtLink to="/verify"> Verify </NuxtLink>
    </a-button>
  </main>
</template>

<script lang="ts">
import Vue from 'vue'
// import { mapState } from 'vuex'
// import constants from '~/store/constants'
// import { BattleReport, LoreFragment as Lore } from '~/store/types'

export default Vue.extend({
  layout: 'default',
  transition: 'page',
})
</script>
