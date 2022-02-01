<template>
  <div class="templateWrapper">
    <div class="body">
      <h1>Upload Hole Image</h1>
      <p class="description">{{ constants.COPY.UPLOADING.DESCRIPTION }}</p>
      <a-result
        v-if="!verified || (hole && hole.status === 'FAILED')"
        status="error"
        title="Verification Failed"
        sub-title="Scroll down to try taking another photo and resubmitting."
      >
        <div class="desc">
          <p style="font-size: 16px">
            <strong
              >Below are some reasons verification may have failed:</strong
            >
          </p>
          <p>
            <a-icon :style="{ color: 'red' }" type="close-circle" /> Poor
            lighting or low quality image.
          </p>
        </div>
      </a-result>
      <br />
      <div v-if="loading" class="loading">
        <a-spin size="large" tip="Loading, please wait..."></a-spin>
      </div>
      <a-result
        v-else-if="hole && hole.status === 'UPLOADING'"
        status="success"
        title="Verifying Upload."
        sub-title="A hole photo already been uploaded for that request."
      >
        <template #extra>
          <a-input
            :default-value="code"
            placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXX"
            @change="changeCode"
          />
          <a-button><a :href="'/view?code=' + code">Check</a> </a-button>
        </template>
      </a-result>
      <a-result
        v-else-if="hole && hole.status === 'COMPLETE'"
        status="success"
        title="Already Uploaded"
        sub-title="That hole has already been uploaded!"
      >
        <template #extra>
          <a-input
            :default-value="code"
            placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXXX"
            @change="changeCode"
          />
          <a-button><a :href="'/view?code=' + code">View</a> </a-button>
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
      <div
        v-else-if="
          hole && (hole.status === 'CREATED' || hole.status === 'FAILED')
        "
        :style="{ 'margin-bottom': '30px' }"
      ></div>
      <a-result
        v-else-if="hole && hole.status === 'CREATING'"
        status="success"
        title="Creating Hole..."
        sub-title="Your hole is being added to the database."
      >
        <template #icon>
          <p class="message">{{ hole && hole.message }}</p>
          <a-spin
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
          <a-button><a :href="'/view?code=' + code">Check</a> </a-button>
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
          <a-button type="primary"
            ><a :href="'/upload?code=' + code">Check</a>
          </a-button>
        </template>
      </a-result>
      <a-form
        v-if="
          !notFound &&
          !loading &&
          !result &&
          hole &&
          (hole.status === 'CREATED' || hole.status === 'FAILED')
        "
        :form="form"
      >
        <a-form-item>
          <h2>Upload Hole Photo</h2>
          <a-upload
            :loading="loading"
            name="file"
            :multiple="true"
            :file-list="fileList"
            :action="'api/upload/' + code"
            accept=".jpg,.jpeg,.png"
            :headers="headers"
            :show-upload-list="false"
            :data="{ licenceNumber, licenceExpiry, licenceAddress }"
            @change="handleChange"
            @beforeUpload="beforeUpload"
          >
            <a-button type="primary" :disabled="loading" :loading="loading">
              <a-icon type="upload" /> Upload
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>
    </div>
    <div class="footer">
      <a-button v-if="hole && hole.status === 'COMPLETE'"
        ><NuxtLink :to="'/create'">Create New </NuxtLink>
      </a-button>
      <a-button v-if="hole && hole.status === 'COMPLETE'" type="primary"
        ><NuxtLink :to="'/view?code=' + code">View Proof</NuxtLink>
      </a-button>
      <a-button
        v-if="
          !loading && !notFound && hole && !result && hole.status !== 'COMPLETE'
        "
        class="cancelButton"
        :disabled="loading"
        :loading="loading"
        type="danger"
        @click="cancel"
      >
        Cancel
      </a-button>
    </div>
  </div>
</template>

<script lang="ts">
import 'moment/locale/en-au'
import { mapState } from 'vuex'
import Preview from '~/components/Preview.vue'
import constants from '~/store/constants'
export default {
  name: 'UploadPage',
  components: { Preview },
  layout: 'default',
  transition: 'page',
  data() {
    return {
      headers: {
        authorization: 'sharedSecret',
      },
      pollingProof: 0,
      constants,
      loading: true,
      loadingMessage: null,
      fileList: [],
      hole: null,
      verified: true,
      notFound: false,
      code: null,
      licenceNumber: null,
      licenceExpiry: null,
      licenceAddress: null,
      // @ts-ignore
      form: this.$form.createForm(this, { name: 'dynamic_rule' }),
      result: null,
    }
  },
  async fetch() {
    const vm = this
    this.loading = true
    this.error = this.post = null
    vm.loading = true

    let fetchedCode = this.$route.query.code
    if ((!fetchedCode || fetchedCode.length <= 0) && this.curentHole) {
      fetchedCode = this.curentHole.code
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
        if (hole.status === 'CREATING') {
          this.pollingProof = 5
          this.pollProof()
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
  },
  computed: mapState(['curentHole']),
  mounted() {
    this.$store.commit('SET_stateUploading')
  },
  fetchOnServer: false,
  fetchKey: 'upload',
  created() {
    this.$fetch()
  },
  methods: {
    async pollProof() {
      if (this.pollingProof <= 0) {
        this.pollingProof = 5
        let fetchedCode = this.$route.query.code
        if ((!fetchedCode || fetchedCode.length <= 0) && this.curentHole) {
          fetchedCode = this.curentHole.code
        }
        try {
          const hole = await this.$store.dispatch('ACTION_fetchPOI', {
            code: fetchedCode,
          })
          if (hole) {
            this.hole = hole
            this.code = fetchedCode
            if (hole.status === 'CREATING') {
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
    beforeUpload() {
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received valus of form: ', values)
          return true
        } else {
          return false
        }
      })
    },
    handleChange(info) {
      console.log(info)
      if (info.file.status === 'uploading') {
        this.verified = true
        if (this.loadingMessage) {
          this.loadingMessage()
        }

        this.loadingMessage = this.$message.loading(`Verifying Image...`, 0)
        this.loading = true
        setTimeout(() => {
          window.location.href = `view?code=${this.hole.code}`
        }, 0)
      }
      if (info.file.status === 'done') {
        this.loadingMessage()
        this.$message.info(`${info.file.name} verified!`)
        setTimeout(() => {
          window.location.href = `view?code=${this.hole.code}`
        }, 0)
      } else if (info.file.status === 'error') {
        this.loadingMessage()
        this.loading = false
        this.verified = false
        this.$message.error(`Verification failed, please try again.`)
        setTimeout(() => {
          //  window.location.href = `view?code=${this.hole.code}`
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
.ant-result {
  padding: 0px !important;
}
.ant-result-extra {
  .ant-input {
    margin-bottom: 20px;
  }
}
p.description {
}
.loading {
  display: flex;
  flex-direction: column;
  padding-bottom: 30px;
}
.ant-input {
  margin-bottom: 30px;
}

.previewSection {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
  .left,
  .right {
    display: flex;
    flex-direction: column;
    max-width: 45vw;
  }
  .left {
    padding-right: 10px;
  }
  .right {
    padding-left: 10px;
  }
  h2 {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
}

.ant-input,
.ant-form-item {
  margin-bottom: 0px;
}

.body {
  padding-left: 40px;
  padding-right: 40px;
  max-width: 1024px;
  padding-bottom: 60px;
}

h2 {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}
</style>
