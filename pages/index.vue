<template>
  <div>
    <div class="fullPage">
      <h1>Welcome to <br />Birdie Train NFTees</h1>
      <i
        >Note: This website is still in beta, some functionality may be
        incomplete.</i
      >
      <div class="actions">
        <a-button type="primary" size="large">
          <NuxtLink to="/login"> Log In </NuxtLink>
        </a-button>
        <a-button type="primary" size="large">
          <NuxtLink to="/register"> Register </NuxtLink>
        </a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapGetters } from 'vuex'
import constants from '~/store/constants'
// import { BattleReport, LoreFragment as Lore } from '~/store/types'

export default Vue.extend({
  auth: false,
  layout: 'default',
  transition: 'page',
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
  },
  data() {
    return {
      constants,
    }
  },
})
</script>

<style lang="scss" scoped>
.actions {
  border-bottom: 0px solid white;
}
</style>
