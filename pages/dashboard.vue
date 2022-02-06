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
      <div class="courseInfo">
        <div class="row">
          <h3 class="label">Course Name:</h3>
          <p class="value">{{ loggedInUser.courseName || 'Not Yet Set.' }}</p>
        </div>
        <div class="row">
          <h3 class="label">Course Location:</h3>
          <p class="value">
            {{ loggedInUser.courseLocation || 'Not Yet Set.' }}
          </p>
        </div>
        <div class="row">
          <h3 class="label">Course Par:</h3>
          <p class="value">{{ loggedInUser.coursePar || 'Not Yet Set.' }}</p>
        </div>
        <div class="row">
          <h3 class="label">Course Hero Image:</h3>
        </div>
        <div class="row" :style="{ 'margin-top': '12px' }">
          <a-empty
            :image-style="{
              height: '80px',
            }"
          >
            <span slot="description"> No Image Uploaded </span>
          </a-empty>
        </div>
        <br />
        <div class="row">
          <h3 class="label">Hole List:</h3>
        </div>
        <div class="row">
          <a-table
            rowKey="code"
            v-if="holes"
            :columns="columns"
            :data-source="holes"
          >
          </a-table>
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

const columns = [
  {
    title: 'Code',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: 'Hole Number',
    dataIndex: 'holeNumber',
    key: 'holeNumber',
  },
  {
    title: 'Par',
    key: 'holePar',
    dataIndex: 'holePar',
  },
  {
    title: 'Status',
    key: 'status',
    dataIndex: 'status',
  },
  {
    title: 'Message',
    key: 'message',
    dataIndex: 'message',
  },
]

export default Vue.extend({
  layout: 'default',
  transition: 'page',

  async fetch() {
    const vm = this
    this.loading = true
    this.error = this.post = null
    vm.loading = true

    try {
      const holes = await this.$store.dispatch('ACTION_fetchAllHoles', {})
      if (holes) {
        console.log(holes)
        this.holes = holes.holes
      }
    } catch (e) {
      if (fetchedCode) {
        this.$message.error(`Cannot find holes for that user!`)
        this.notFound = true
      }
      this.$store.commit('SET_isLoading', false)
    } finally {
      this.loading = false
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
  },
  data() {
    return {
      constants,
      columns,
      holes: [],
    }
  },
})
</script>

<style lang="scss" scoped></style>
