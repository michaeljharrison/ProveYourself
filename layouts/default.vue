<template>
  <a-layout id="components-layout-demo-top" class="layout">
    <a-layout-header>
      <a-menu
        class="menu"
        theme="dark"
        mode="horizontal"
        :style="{ lineHeight: '64px' }"
      >
        <a-menu-item key="1">
          <NuxtLink to="/"><p class="navHome">ProveYourself</p></NuxtLink>
        </a-menu-item>
        <a-menu-item key="2" @click="setCurrentState(constants.STATE.CREATING)">
          <NuxtLink to="/create">CREATE</NuxtLink>
        </a-menu-item>
        <a-menu-item
          key="3"
          @click="setCurrentState(constants.STATE.UPLOADING)"
        >
          <NuxtLink to="/upload">UPLOAD</NuxtLink>
        </a-menu-item>
        <a-menu-item
          key="4"
          @click="setCurrentState(constants.STATE.VERIFYING)"
        >
          <NuxtLink to="/verify">VERIFY</NuxtLink>
        </a-menu-item>
      </a-menu>
    </a-layout-header>
    <a-layout-content>
      <a-steps :current="stateToInt()" size="small">
        <a-step title="Create" />
        <a-step title="Upload Proof" />
        <a-step title="Verify" />
      </a-steps>
      <div class="content">
        <Nuxt />
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts">
import { mapState } from 'vuex'
import 'moment/locale/en-au'
import constants from '~/store/constants'
export default {
  layout: 'default',
  transition: 'page',
  computed: mapState(['currentState']),
  data() {
    return {
      constants,
    }
  },
  methods: {
    setCurrentState(newState: any) {
      console.log(newState)
      switch (newState) {
        case constants.STATE.CREATING:
          this.$store.commit('SET_stateCreating')
          break
        case constants.STATE.UPLOADING:
          this.$store.commit('SET_stateUploading')
          break
        case constants.STATE.VERIFYING:
          this.$store.commit('SET_stateVerifying')
          break
        default:
          return false
      }
    },
    stateToInt() {
      console.log(this.currentState)
      switch (this.currentState) {
        case constants.STATE.CREATING:
          return 0
        case constants.STATE.UPLOADING:
          return 1
        case constants.STATE.VERIFYING:
          return 2
        default:
          return 0
      }
    },
  },
}
</script>

<style lang="scss">
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
}

.layout {
  height: 100%;
}

#__nuxt {
  height: 100%;
}
#__layout {
  height: 100%;
}

.ant-layout-content {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin: 20px;
  overflow: scroll;
}

.navHome {
  margin-bottom: 0em;
  color: white;
  font-weight: bold;
}

.ant-steps {
  margin-top: 20px;
  max-width: 1280px;
  margin-bottom: 20px;
}
.content {
  overflow-y: scroll;
  width: 100%;
}
</style>
