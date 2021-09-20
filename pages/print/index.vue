<template>
  <main>
    <br />
    <div v-if="loading" class="loading">
      <a-spin size="large" tip="Loading, please wait..."></a-spin>
    </div>
    <a-result
      v-else-if="poi && poi.status === 'VERIFIED'"
      status="success"
      title="Already Verified"
      sub-title="That POI has already been verified!"
    >
      <template #extra>
        <a-input
          :default-value="code"
          placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXX"
          @change="changeCode"
        />
        <a-button type="primary"
          ><NuxtLink :to="'/create'">New POI </NuxtLink>
        </a-button>
        <a-button type="primary"
          ><NuxtLink :to="'/verify?code=' + code">View Proof</NuxtLink>
        </a-button>
      </template>
    </a-result>
    <a-result
      v-else-if="notFound"
      status="404"
      title="404"
      sub-title="Sorry, no active request found with that code."
    >
      <template #extra>
        <a-input
          :default-value="code"
          placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXX"
          @change="changeCode"
        />
        <a-button type="primary"
          ><a :href="'/upload?code=' + code">Check</a>
        </a-button>
      </template>
    </a-result>
    <div v-else-if="poi" :style="{ 'margin-bottom': '30px' }">
      <Preview
        :print="true"
        :code="poi.code"
        :name="poi.name"
        :date="moment()"
      />
    </div>
    <a-result
      v-else
      title="Please Enter a Request Code"
      sub-title="Please enter the request code for your Identity Proof, alternatively, follow the hyperlink provided to you."
    >
      <template #extra>
        <a-input
          :default-value="code"
          placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXX"
          @change="changeCode"
        />
        <a-button type="primary"
          ><a :href="'/upload?code=' + code">Check</a>
        </a-button>
      </template>
    </a-result>
  </main>
</template>

<script lang="ts">
import moment from 'moment'
import 'moment/locale/en-au'
import Preview from '~/components/Preview.vue'
// import { mapState } from 'vuex'
// import constants from '~/store/constants'
export default {
  components: { Preview },
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
    handleChange(info) {
      if (info.file.status !== 'uploading') {
        // console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        this.$message.info(`${info.file.name} file uploaded, verifying..`)
        setTimeout(() => {
          window.location.href = `verify?code=${this.poi.code}`
        }, 0)
      } else if (info.file.status === 'error') {
        this.$message.error(`${info.file.name} file upload failed.`)
        setTimeout(() => {
          window.location.href = `verify?code=${this.poi.code}`
        }, 0)
      }
      this.fileList = [info.file]
    },
    changeCode(e: Event) {
      e.preventDefault()
      this.code = e.target.value
    },
    cancel(e: Event) {
      e.preventDefault()
      this.poi = null
      this.loading = false
      this.notFound = false
      this.fileList = []
    },
    disabledDates(value: any) {
      const today = new Date()
      today.setDate(today.getDate() - 1)
      return value.valueOf() <= today.valueOf()
    },
  },
}
</script>

<style lang="scss" scoped>
.loading {
  display: flex;
  flex-direction: column;
  padding-bottom: 30px;
}
.ant-input {
  margin-bottom: 30px;
}
</style>
