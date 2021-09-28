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
      <div class="stepWrapper">
        <a-steps :current="stateToInt()" size="small">
          <a-step title="Create"> <a-icon slot="icon" type="setting" /></a-step>
          <a-step title="Upload Proof">
            <a-icon slot="icon" type="user"
          /></a-step>
          <a-step title="Verify">
            <a-icon slot="icon" type="check-square"
          /></a-step>
        </a-steps>
      </div>
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
  name: 'DefaultLayout',
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
/*
* Prefixed by https://autoprefixer.github.io
* PostCSS: v8.3.6,
* Autoprefixer: v10.3.1
* Browsers: last 4 version
*/

html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

*,
*::before,
*::after {
  -webkit-box-sizing: border-box;
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
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-pack: start;
  -ms-flex-pack: start;
  justify-content: flex-start;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  overflow: scroll;
}

.navHome {
  margin-bottom: 0em;
  color: white;
  font-weight: bold;
}

.stepWrapper {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  min-width: 100%;
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 40px;
  padding-right: 40px;
  background-color: white;
}

.ant-steps {
  max-width: 1024px;
  height: 28px;
}

.content {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  width: 100%;
  padding-left: 40px;
  padding-right: 40px;

  .header {
    margin-left: auto;
    margin-right: auto;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    -ms-flex-direction: column;
    flex-direction: column;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    max-width: 1024px;
  }
  .body {
    .ant-result-icon {
      max-width: 1024px;
      margin-left: auto;
      margin-right: auto;
    }
    .ant-result-title {
      max-width: 1024px;
      margin-left: auto;
      margin-right: auto;
    }
    .ant-result-subtitle {
      max-width: 1024px;
      margin-left: auto;
      margin-right: auto;
    }
    .ant-result-extra {
      .top {
      }
      .bottom {
      }
    }
  }
}
</style>
