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
          <NuxtLink to="/"><p class="navHome">NFTee</p></NuxtLink>
        </a-menu-item>
        <a-menu-item key="2" @click="setCurrentState(constants.STATE.CREATING)">
          <NuxtLink to="/create">CREATE HOLE</NuxtLink>
        </a-menu-item>
        <a-menu-item
          key="3"
          @click="setCurrentState(constants.STATE.UPLOADING)"
        >
          <NuxtLink to="/upload">UPLOAD PHOTO</NuxtLink>
        </a-menu-item>
        <a-menu-item
          key="4"
          @click="setCurrentState(constants.STATE.VERIFYING)"
        >
          <NuxtLink to="/view">VIEW HOLE</NuxtLink>
        </a-menu-item>
        <a-menu-item key="username" v-if="isAuthenticated">
          Welcome, {{ loggedInUser.username }}
        </a-menu-item>
        <a-sub-menu v-if="isAuthenticated">
          <span slot="title" class="submenu-title-wrapper"
            ><a-icon type="setting" />My Account</span
          >

          <a-menu-item key="setting:1"
            ><nuxt-link class="navbar-item" to="/profile"
              >Profile</nuxt-link
            ></a-menu-item
          >
          <a-menu-item key="setting:2"
            ><nuxt-link class="navbar-item" to="/register"
              >Logout</nuxt-link
            ></a-menu-item
          >
        </a-sub-menu>
        <a-menu-item v-if="!isAuthenticated" key="setting:3">
          <nuxt-link class="navbar-item" to="/register"
            >Register</nuxt-link
          ></a-menu-item
        >
        <a-menu-item v-if="!isAuthenticated" key="setting:4"
          ><nuxt-link class="navbar-item" to="/login"
            >Log In</nuxt-link
          ></a-menu-item
        >
      </a-menu>
    </a-layout-header>
    <a-layout-content>
      <div class="content">
        <Nuxt />
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts">
import { mapState, mapGetters } from 'vuex'
import 'moment/locale/en-au'
import constants from '~/store/constants'
export default {
  name: 'HomeLayout',
  layout: 'default',
  transition: 'page',
  computed: {
    ...mapState(['currentState']),
    ...mapGetters(['isAuthenticated', 'loggedInUser']),
  },
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

<style lang="scss" scoped>
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
  height: 28px !important;
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
  padding-left: 0px;
  padding-right: 0px;

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
    .ant-result {
      padding: 0px !important;
      width: 80%;
      max-width: 1024px;
      .ant-steps-item-container {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;

        .ant-steps {
          height: 24px;
        }
      }
    }
  }
  .body {
    margin-left: auto;
    margin-right: auto;
    .ant-result {
      padding-top: 0px;
      padding-bottom: 0px;
      padding: 0px !important;
    }
    .ant-result-icon {
      max-width: 1024px;
      margin-left: auto;
      margin-right: auto;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      padding-top: 0 !important;
      p {
        margin-left: 10px;
        margin-right: 10px;
      }
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
