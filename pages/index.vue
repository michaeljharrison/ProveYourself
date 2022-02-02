<template>
  <div>
    <div class="fullPage">
      <h1>Welcome, {{ loggedInUser.username }}</h1>
      <i
        >Note: This website is still in beta, some functionality may be
        incomplete.</i
      >
      <div class="actions">
        <a-button type="primary" size="large">
          <NuxtLink to="/create"> Add New Hole </NuxtLink>
        </a-button>
        <a-button type="primary" size="large">
          <NuxtLink to="/profile"> Edit Course Infomration </NuxtLink>
        </a-button>
      </div>
      <hr />
      <div class="courseInfo">
        <div class="row">
          <h3 class="label">Course Name:</h3>
          <p class="label">Eynesbury Golf Course</p>
        </div>
        <div class="row">
          <h3 class="label">Course Par:</h3>
          <p class="label">71</p>
        </div>
        <div class="row">
          <h3 class="label">Course Location:</h3>
          <p class="label">Eynesbury, Victoria, 3338</p>
        </div>
        <div class="row">
          <h3 class="label">Course Hero Image:</h3>
        </div>
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

<style lang="scss" scoped></style>
