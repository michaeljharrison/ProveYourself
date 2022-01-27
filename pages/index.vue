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
  layout: 'home',
  transition: 'page',
  data() {
    return {
      constants,
    }
  },
})
</script>

<style lang="scss" scoped>
.fullPage {
  display: flex;
  flex-direction: column;
  color: black;
  min-width: 100vw;
  min-height: 100vh;
  padding-top: 40px;
  padding-bottom: 40px;
  margin-bottom: 40px;
  // background: rgb(86, 123, 249);
  background: white;
  h1,
  h2 {
    color: black;
  }
  h2 {
    margin-bottom: 30px;
  }
  button {
    margin-top: 30px;
  }
  .ant-result-icon {
    display: flex;
    flex-direction: row;
    justify-content: center;
    p {
      font-size: 54px;
    }
  }
}
</style>
