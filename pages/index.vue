<template>
  <div>
    <div class="fullPage">
      <h1>nfTee</h1>
      <h2>Tag line goes here.</h2>
      <i
        >Note: This website is still in beta, some functionality may be
        incomplete.</i
      >
      <div class="actions">
        <a-button type="primary" size="large">
          <NuxtLink to="/create"> Add Hole </NuxtLink>
        </a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// import { mapState } from 'vuex'
import constants from '~/store/constants'
// import { BattleReport, LoreFragment as Lore } from '~/store/types'

export default Vue.extend({
  auth: false,
  layout: 'default',
  transition: 'page',
  data() {
    return {
      constants,
    }
  },
})
</script>

<style lang="scss" scoped></style>
