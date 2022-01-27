<template>
  <div class="templateWrapper">
    <div class="body verification" :style="{ 'overflow-x': hidden }">
      <div class="header">
        <h1>View</h1>
        <p>{{ constants.COPY.VERIFYING.DESCRIPTION }}</p>
        <br />
      </div>
      <div v-if="loading" class="loading">
        <a-spin size="large" tip="Loading, please wait..."></a-spin>
      </div>
      <div v-else class="body">
        <a-result
          v-if="hole && hole.status === 'FAILED'"
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
          v-else-if="hole && hole.status === 'COMPLETE'"
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
              <div class="image">
                <h2>Uploaded Image</h2>
                <img
                  v-if="hole && hole.file && hole.file.binaryData"
                  :src="
                    'data:image/png;base64,' +
                    hole.file.binaryData.toString('base64')
                  "
                />
                <a-skeleton v-else></a-skeleton>
              </div>
            </div>
            <div class="about">
              <h2>About</h2>

              <a-tabs default-active-key="1" tab-position="top">
                <a-tab-pane key="1" tab="Info">
                  <div class="stats">
                    <div class="stat">
                      <p class="ant-statistic-title">Status</p>
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
                        :value="moment(hole.createdOn).format('DD MMM YYYY')"
                        style="margin-right: 50px"
                      />
                    </div>
                    <div class="stat">
                      <a-statistic
                        title="Course"
                        :value="hole.courseName"
                        style="margin-right: 50px"
                      />
                      <a-statistic :value="hole.state" />
                      <a-statistic :value="hole.suburb" />
                    </div>
                    <div class="stat">
                      <a-statistic
                        title="Hole Number"
                        :value="hole.holeNumber"
                        style="margin-right: 50px"
                      />
                      <a-statistic
                        v-if="hole && hole.holeDescription"
                        :value="hole.holeDescription"
                      />
                    </div>
                    <div class="stat">
                      <a-statistic
                        title="Course Par"
                        :value="hole.coursePar"
                        style="margin-right: 50px"
                      />
                      <a-statistic
                        title="Hole Par"
                        :value="hole.holePar"
                        style="margin-right: 50px"
                      />
                    </div>
                    <div class="stat">
                      <p class="ant-statistic-title">View NFT</p>
                      <a
                        target="__blank"
                        :href="hole && hole.token && hole.token.tokenLink"
                        >{{ hole && hole.token && hole.token.tokenLink }}</a
                      >
                    </div>
                  </div>
                </a-tab-pane>

                <a-tab-pane key="3" tab="JSON">
                  <VueJsonPretty
                    :deep="2"
                    :data="hole"
                    show-length
                  ></VueJsonPretty
                ></a-tab-pane>
                <a-tab-pane key="4" tab="NFT">
                  <VueJsonPretty :data="hole.token" show-length></VueJsonPretty
                ></a-tab-pane>
              </a-tabs>
            </div>
          </template>
        </a-result>
        <a-result
          v-else-if="hole && hole.status === 'UPLOADING' && pollingProof"
          status="success"
          title="Creating Blockchain Proof..."
          sub-title="Your proof of identity is being anchored on the blockchain, this may take a few minutes..."
        >
          <template #icon>
            <p class="message">{{ hole && hole.message }}</p>
            <a-spin
              v-if="hole && hole.status === 'UPLOADING' && pollingProof"
              size="large"
              :tip="`Checking again in ${pollingProof} seconds...`"
            ></a-spin>
          </template>
          <template #extra>
            <a-input
              :default-value="code"
              placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXX"
              @change="changeCode"
            />
            <a-button><a :href="'/verify?code=' + code">Check</a> </a-button>
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
          v-else-if="hole"
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
      <a-button v-if="hole && hole.status === 'COMPLETE'"
        ><NuxtLink target="_blank" :to="`/api/download/${hole.code}`"
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
  name: 'VerifyPage',
  components: { VueJsonPretty },
  layout: 'default',
  transition: 'page',
  data() {
    return {
      headers: {
        authorization: 'sharedSecret',
      },
      loading: true,
      pollingProof: 0,
      constants,
      fileList: [],
      hole: null,
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
      const hole = await this.$store.dispatch('ACTION_fetchHole', {
        code: fetchedCode,
      })
      if (hole) {
        console.log(hole)
        this.hole = hole
        this.code = fetchedCode
        if (hole.status === 'UPLOADING') {
          this.pollingProof = 5
          this.pollProof()
        }
      }
      this.certContent = `<html><body><object data="https://NFTee.azurewebsites.net/api/certificate/${hole.code}" type="application/pdf"><embed src="https://NFTee.azurewebsites.net/api/certificate/${hole.code}" type="application/pdf"/></object></body></html>
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
    async pollProof() {
      if (this.pollingProof <= 0) {
        this.pollingProof = 5
        let fetchedCode = this.$route.query.code
        if ((!fetchedCode || fetchedCode.length <= 0) && this.currentPOI) {
          fetchedCode = this.currentPOI.code
        }
        try {
          const hole = await this.$store.dispatch('ACTION_fetchPOI', {
            code: fetchedCode,
          })
          if (hole) {
            this.hole = hole
            this.code = fetchedCode
            if (hole.status === 'UPLOADING') {
              setTimeout(() => {
                this.pollProof()
              }, 1000)
            } else {
              this.$message.info(`Anchoring complete!`)
              this.pollingProof = 0
            }
          }
        } catch (e) {
          if (fetchedCode) {
            this.$message.error(`Cannot find a request with that code!`)
            this.notFound = true
          }
          this.$store.commit('SET_isLoading', false)
        } finally {
          this.loading = false
        }
      } else {
        this.pollingProof -= 1
        setTimeout(() => {
          this.pollProof()
        }, 1000)
      }
    },
    changeCode(e: Event) {
      e.preventDefault()
      // @ts-ignore
      this.code = e.target.value
    },
    cancel(e: Event) {
      e.preventDefault()
      this.hole = null
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
/*
* Prefixed by https://autoprefixer.github.io
* PostCSS: v8.3.6,
* Autoprefixer: v10.3.1
* Browsers: last 4 version
*/

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
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
  -webkit-box-pack: justify;
  -ms-flex-pack: justify;
  justify-content: space-between;
  margin-bottom: 20px;
}
.left,
.right {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  max-width: 45vw;
  -webkit-box-flex: 1;
  -ms-flex-positive: 1;
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
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  padding-bottom: 30px;
}
.ant-input {
  margin-bottom: 30px;
}
.ant-tabs {
  margin-bottom: 30px;
  -webkit-transition: cubic-bezier(0.075, 0.82, 0.165, 1);
  -o-transition: cubic-bezier(0.075, 0.82, 0.165, 1);
  transition: cubic-bezier(0.075, 0.82, 0.165, 1);
  -webkit-transition-delay: 0s;
  -o-transition-delay: 0s;
  transition-delay: 0s;
  -webkit-transition-duration: 1s;
  -o-transition-duration: 1s;
  transition-duration: 1s;
  -webkit-transition-property: all;
  -o-transition-property: all;
  transition-property: all;
}

.stats {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
  flex-direction: row;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  -ms-flex-pack: distribute;
  justify-content: space-around;
  // background-color: white;
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
  min-width: 22vw;
  padding: 10px;
  background-color: white;
  border-radius: 0.75em;
  margin-left: 30px;
  margin-right: 30px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.ant-statistic {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  margin-right: 0px !important;
}
.iframeContainer {
  height: 75vh;
  max-height: 75vh;
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
}
.about {
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-bottom: 40px;
}
img {
  border-radius: 0.75em;
  max-height: 75vh;
  -o-object-fit: scale-down;
  object-fit: scale-down;
}

object {
  width: 100%;
  height: 100%;
}

.image {
  width: 100%;
}
</style>
