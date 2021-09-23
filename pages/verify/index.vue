<template>
  <div>
    <div class="body verification" :style="{ 'overflow-x': hidden }">
      <div class="header">
        <h1>Verify</h1>
        <p>{{ constants.COPY.VERIFYING.DESCRIPTION }}</p>
        <br />
      </div>
      <div v-if="loading" class="loading">
        <a-spin size="large" tip="Loading, please wait..."></a-spin>
      </div>
      <div v-else class="body">
        <a-result
          v-if="poi && poi.status === 'FAILED'"
          status="500"
          title="Not Verified"
          sub-title="This POI has been uploaded but failed verification, try uploading a new image for this POI."
        >
          <template #extra>
            <a-input
              :default-value="code"
              placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXX"
              @change="changeCode"
            />
            <a-button><a :href="'/verify?code=' + code">Check</a> </a-button>
            <a-form :form="form" layout="inline">
              <a-form-item>
                <a-button type="primary"
                  ><NuxtLink :to="'/upload?code=' + code"
                    >Upload Again
                  </NuxtLink>
                </a-button>
              </a-form-item>
              <a-form-item>
                <a-button type="primary"
                  ><NuxtLink :to="'/verify?code=' + code">Change Code</NuxtLink>
                </a-button>
              </a-form-item>
            </a-form>
          </template>
        </a-result>
        <a-result
          v-else-if="poi && poi.status === 'VERIFIED'"
          status="success"
          title="Verified"
          sub-title="This POI has been uploaded and verified, see details below."
        >
          <template #extra class="extra">
            <div class="top">
              <a-input
                :default-value="code"
                placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXX"
                @change="changeCode"
              />
              <a-button><a :href="'/verify?code=' + code">Check</a> </a-button>
              <a-form :form="form" layout="inline"> </a-form>
              <br />
              <br />
            </div>
            <div
              class="bottom"
              :style="{ 'padding-left': '20px', 'padding-right': '20px' }"
            >
              <div class="left">
                <h2>Uploaded Image</h2>
                <img
                  v-if="poi && poi.file && poi.file.binaryData"
                  :src="
                    'data:image/png;base64,' +
                    poi.file.binaryData.toString('base64')
                  "
                />
                <a-skeleton v-else></a-skeleton>
              </div>
              <div class="right">
                <h2>Proof</h2>
                <a-tabs default-active-key="2" tab-position="top">
                  <a-tab-pane key="1" tab="Info">
                    <div class="stats">
                      <div class="stat">
                        <h4>Status</h4>
                        <a-progress
                          status="active"
                          type="circle"
                          :percent="100"
                          :format="() => 'Verified'"
                        />
                      </div>
                      <div class="stat">
                        <a-statistic
                          title="Created On"
                          :value="moment(poi.createdOn).format('DD MMM YYYY')"
                          style="margin-right: 50px"
                        />
                        <a-statistic
                          title="Verified On"
                          :value="moment(poi.verifiedOn).format('DD MMM YYYY')"
                        />
                      </div>
                      <div class="stat">
                        <a-statistic
                          title="Block Time"
                          :value="
                            poi.requestProof.proof.metadata.blockTime.toString()
                          "
                          style="margin-right: 50px"
                        />
                      </div>
                      <div class="stat">
                        <h4>Confidence</h4>
                        <a-progress
                          status="active"
                          type="circle"
                          :stroke-color="{
                            '0%': '#108ee9',
                            '100%': '#87d068',
                          }"
                          :percent="
                            Number.parseFloat(
                              poi.verification.verifiedConfidence * 100
                            ).toFixed(2)
                          "
                        />
                      </div>
                      <div class="stat">
                        <a-statistic
                          title="Anchored On"
                          :value="poi.blockchain"
                          style="margin-right: 50px"
                        />
                      </div>
                      <div class="stat">
                        <a-statistic
                          title="Found On Line"
                          :value="poi.verification.lineFound + 1"
                          style="margin-right: 50px"
                        />
                        <a-statistic
                          title="Word"
                          :value="poi.verification.wordFound + 1"
                        />
                      </div>
                      <div class="stat">
                        <a-statistic
                          title="Name"
                          :value="poi.name"
                          style="margin-right: 50px"
                        />
                        <a-statistic title="Email" :value="poi.email" />
                      </div>
                    </div>
                  </a-tab-pane>

                  <a-tab-pane key="2" tab="Certificate">
                    <div class="iframeContainer">
                      <iframe
                        title="proofIFrame"
                        :src="`/certificate?code=${code}`"
                        type="application/pdf"
                        width="100%"
                        height="100%"
                      />
                    </div>
                  </a-tab-pane>
                  <a-tab-pane key="3" tab="JSON">
                    <VueJsonPretty
                      :deep="2"
                      :data="poi"
                      show-length
                    ></VueJsonPretty
                  ></a-tab-pane>
                </a-tabs>
              </div>
            </div>
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
              ><a :href="'/verify?code=' + code">Refresh</a>
            </a-button>
          </template>
        </a-result>
        <a-result
          v-else-if="poi"
          status="warning"
          title="Awaiting Upload"
          sub-title="Sorry, no POI has been uploaded for that request yet!"
        >
          <template #extra>
            <a-input
              :default-value="code"
              placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXX"
              @change="changeCode"
            />
            <a-button type="primary"
              ><NuxtLink :to="'/upload?code=' + code">Go to Upload</NuxtLink>
            </a-button>
          </template>
        </a-result>
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
            <a-button><a :href="'/verify?code=' + code">Check</a> </a-button>
          </template>
        </a-result>
      </div>
    </div>
    <div class="footer">
      <a-button v-if="poi && poi.status === 'VERIFIED'"
        ><NuxtLink target="_blank" :to="`/api/download/${poi.code}`"
          >Download
        </NuxtLink>
      </a-button>
      <a-button type="primary"
        ><NuxtLink :to="'/create'">New POI </NuxtLink>
      </a-button>
    </div>
  </div>
</template>

<script lang="ts">
import moment from 'moment'
import 'moment/locale/en-au'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'
import { mapState } from 'vuex'
import constants from '@/store/constants'
export default {
  components: { VueJsonPretty },
  layout: 'default',
  transition: 'page',
  data() {
    return {
      headers: {
        authorization: 'sharedSecret',
      },
      loading: true,
      constants,
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
    let fetchedCode = this.$route.query.code
    if ((!fetchedCode || fetchedCode.length <= 0) && this.currentPOI) {
      fetchedCode = this.currentPOI.code
    }
    // replace `getPost` with your data fetching util / API wrapper
    try {
      const poi = await this.$store.dispatch('ACTION_fetchPOI', {
        code: fetchedCode,
      })
      if (poi) {
        this.poi = poi
        this.code = fetchedCode
      }
      this.$message.info(`POI Found...`)
      this.certContent = `<html><body><object data="https://proveyourself.azurewebsites.net/api/certificate/${poi.code}" type="application/pdf"><embed src="https://proveyourself.azurewebsites.net/api/certificate/${poi.code}" type="application/pdf"/></object></body></html>
`
    } catch (e) {
      if (fetchedCode) {
        this.$message.error(`Cannot find a request with that code!`)
        this.notFound = true
      }

      this.$store.commit('SET_isLoading', false)
    } finally {
      this.loading = false
    }
  },
  fetchOnServer: false,
  fetchKey: 'upload',
  computed: mapState(['currentPOI']),
  created() {
    this.$fetch()
  },
  mounted() {
    this.$store.commit('SET_stateVerifying')
  },
  methods: {
    changeCode(e: Event) {
      e.preventDefault()
      // @ts-ignore
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
.ant-result-extra {
  max-width: 1280px;
  padding-left: 20px;
  padding-right: 20px;
  .top {
    margin-left: auto !important;
    margin-right: auto !important;
    min-width: 612px;
  }
}
.bottom {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
}
.left,
.right {
  display: flex;
  flex-direction: column;
  max-width: 45vw;
  flex-grow: 1;
  max-width: 50%;
  width: 50%;
}
.left {
  padding-right: 10px;
  h2 {
    margin-bottom: 70px;
  }
}
.right {
  padding-left: 10px;
}
h2 {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
.ant-layout-content {
  main {
    overflow-x: hidden;
  }
}
.ant-result {
  max-width: 100vw;
  padding: 0px !important;
}
.loading {
  display: flex;
  flex-direction: column;
  padding-bottom: 30px;
}
.ant-input {
  margin-bottom: 30px;
}
.ant-tabs {
  margin-bottom: 30px;
  transition: cubic-bezier(0.075, 0.82, 0.165, 1);
  transition-delay: 0s;
  transition-duration: 1s;
  transition-property: all;
}

.stats {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-around;
  background-color: white;
  border-radius: 0.75em;
  padding-top: 10px;
  padding-bottom: 20px;
}

.vjs-tree {
  background-color: white;
  border-radius: 0.75em;
  padding-left: 10px;
  padding-top: 10px;
  padding-bottom: 20px;
}
.stat {
  margin-left: 30px;
  margin-right: 30px;
  margin-top: 20px;
}
.ant-statistic {
  display: flex;
  flex-direction: column;
  margin-right: 0px !important;
}
.iframeContainer {
  height: 100vh;
}
p {
  text-align: center;
}
.top {
  margin-left: auto;
  margin-right: auto;
  max-width: 1024px;
}
.body {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

img {
  border-radius: 0.75em;
}
</style>
