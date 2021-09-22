<template>
  <div>
    <div class="header">
      <h1>Prove Yourself</h1>
      <h2>Blockchain Immutability meets Proof of Identity.</h2>
      <a-result status="success">
        <template #icon>
          <a-steps :current="3" size="large">
            <a-step
              title="Create"
              description="Create a Proof of Identity Request"
            >
              <a-icon slot="icon" type="setting"
            /></a-step>
            <a-step
              title="Upload Proof"
              description="Upload Supporting Documents"
            >
              <a-icon slot="icon" type="user"
            /></a-step>
            <a-step
              title="Verify"
              description="Everything is stored immutably on the Blockchain."
            >
              <a-icon slot="icon" type="check-square"
            /></a-step>
          </a-steps>
        </template>
      </a-result>
      <p>
        Prove Yourself uses the <b>ProvenDB</b> Blockchain connectors to create
        an immutable, tamper proof and trustworthy Proof of Identity
        <i>(POI)</i> solution.
      </p>
      <i
        >Note: Prove Yourself is a currently a proof of concept only, and should
        not be used beyond demonstrating the functionality of the
        <b>ProvenDB SDK.</b></i
      >
      <div class="actions">
        <a-button type="primary" size="large">
          <NuxtLink to="/create"> Get Started </NuxtLink>
        </a-button>
      </div>
    </div>
    <div class="body">
      <div :style="{ 'align-items': 'flex-start' }" class="content">
        <div class="section">
          <h2>Why?</h2>
          <p>{{ constants.COPY.HOME.WHY_ONE }}</p>
          <p>{{ constants.COPY.HOME.WHY_TWO }}</p>
        </div>
        <div class="section">
          <h2>How?</h2>
          <p>{{ constants.COPY.HOME.HOW_ONE }}</p>
          <p>{{ constants.COPY.HOME.HOW_TWO }}</p>
        </div>
        <div class="section">
          <h2>What info is proven?</h2>
          <ul>
            <li>
              The POI request and associated metadata (<i
                >creation data, target person etc...</i
              >).
            </li>
            <li>A unique code used to help verify identity.</li>
            <li>
              All supporting documents and images in a secure hashed format
            </li>
            <li>
              The final status of the request (<i
                >Failed, Succeeded, Expired etc...</i
              >)
            </li>
          </ul>
        </div>
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
.header {
  display: flex;
  flex-direction: column;
  color: black;
  min-width: 100vw;
  min-height: 65vh;
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
