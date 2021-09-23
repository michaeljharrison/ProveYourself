<template>
  <body>
    <object :data="`/api/certificate/${code}`" type="application/pdf">
      <embed :src="`/api/certificate/${code}`" type="application/pdf" />
    </object>
  </body>
</template>

<script lang="ts">
import moment from 'moment'
import 'moment/locale/en-au'
// import { mapState } from 'vuex'
// import constants from '~/store/constants'
export default {
  layout: 'none',
  transition: 'page',
  data() {
    return {
      headers: {
        authorization: 'sharedSecret',
      },
      loading: true,
      fileList: [],
      poi: null,
      notFound: false,
      code: null,
      // @ts-ignore
      form: this.$form.createForm(this, { name: 'dynamic_rule' }),
      moment,
      result: null,
    }
  },
  async fetch() {
    const vm = this
    this.loading = true
    this.error = this.post = null
    vm.loading = true
    const fetchedCode = this.$route.query.code
    // replace `getPost` with your data fetching util / API wrapper
    try {
      const poi = await this.$store.dispatch('ACTION_fetchPOI', {
        code: fetchedCode,
      })
      if (poi) {
        this.poi = poi
        this.code = fetchedCode
      }
    } catch (e) {
      this.notFound = true
      this.$message.error(`Hmmm, something went wrong, sorry!`)
      this.$store.commit('SET_isLoading', false)
    } finally {
      this.loading = false
    }
  },
  fetchOnServer: false,
  fetchKey: 'upload',
  computed: {},
  created() {
    this.$fetch()
  },
  methods: {
    changeCode(e: Event) {
      e.preventDefault()
      this.code = e.target.value
    },
  },
}
</script>

<style lang="scss" scoped>
object {
  width: 100%;
  height: 100%;
}
</style>
