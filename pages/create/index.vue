<template>
  <div>
    <div class="body">
      <h1>New Identity Verification</h1>
      <p>{{ constants.COPY.CREATING.DESCRIPTION }}</p>
      <br />
      <a-form :form="form" :layout="formLayout">
        <div class="sectionHeader">
          <a-icon
            type="check-square"
            theme="twoTone"
            :style="{ fontSize: '18px', 'padding-right': '10px' }"
          />
          <h2>Proof Settings</h2>
          <a-tooltip>
            <template slot="title">
              {{ constants.COPY.CREATING.PROOF_SETTINGS }}</template
            >
            <a-icon type="question-circle" />
          </a-tooltip>
        </div>
        <a-form-item label="Target Blockchain">
          <a-radio-group
            v-model="blockchain"
            :default-value="constants.BLOCKCHAINS.HEDERA"
            @change="handleBlockchainChange"
          >
            <a-radio-button :value="constants.BLOCKCHAINS.HEDERA">
              {{ constants.BLOCKCHAINS.HEDERA }}
            </a-radio-button>
            <a-tooltip>
              <template slot="title"> Coming Soon(ish) </template>
              <a-radio-button disabled :value="constants.BLOCKCHAINS.ETHEREUM">
                {{ constants.BLOCKCHAINS.ETHEREUM }}
              </a-radio-button>
            </a-tooltip>
            <a-tooltip>
              <template slot="title"> Coming Soon(ish) </template>
              <a-radio-button disabled :value="constants.BLOCKCHAINS.BITCOIN">
                {{ constants.BLOCKCHAINS.BITCOIN }}
              </a-radio-button>
            </a-tooltip>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="Expiry">
          <a-date-picker
            :default-value="expiry"
            :disabled="loading"
            :disabled-date="disabledDates"
            @change="handleExpiryChange"
          />
        </a-form-item>
        <div :style="{ 'margin-top': '34px' }" class="sectionHeader">
          <a-icon
            type="idcard"
            theme="twoTone"
            :style="{ fontSize: '18px', 'padding-right': '10px' }"
          />
          <h2>Identity Information</h2>
          <a-tooltip>
            <template slot="title">
              {{ constants.COPY.CREATING.IDENTITY_SETTINGS }}</template
            >
            <a-icon type="question-circle" />
          </a-tooltip>
        </div>
        <a-form-item label="First Name">
          <a-input
            v-decorator="[
              'firstName',
              {
                rules: [
                  { required: true, message: 'Please input your first name' },
                ],
              },
            ]"
            :disabled="loading"
            placeholder="First"
          />
        </a-form-item>
        <a-form-item label="Last Name">
          <a-input
            v-decorator="[
              'lastName',
              {
                rules: [
                  { required: true, message: 'Please input your last name' },
                ],
              },
            ]"
            :disabled="loading"
            placeholder="Lastman"
          />
        </a-form-item>
        <a-form-item label="Date of Birth">
          <a-date-picker
            v-decorator="[
              'lastName',
              {
                rules: [
                  {
                    required: true,
                    message: 'Please input your date of birth',
                  },
                ],
              },
            ]"
            :placeholder="dateOfBirth"
            :disabled-date="disabledDOB"
            :disabled="loading"
            @change="handleDOBChange"
          />
        </a-form-item>
        <a-form-item label="Email Address">
          <a-input
            v-decorator="[
              'email',
              {
                rules: [
                  {
                    type: 'email',
                    required: true,
                    message: 'Please input your email address',
                  },
                ],
              },
            ]"
            :disabled="loading"
            placeholder="f.lastman@email.com"
          />
        </a-form-item>
        <a-form-item label="Identity Document">
          <a-radio-group
            v-model="idDoc"
            :default-value="constants.DOCUMENTS.DRIVERS_LICENSE"
            @change="handleDocumentChange"
          >
            <a-radio-button :value="constants.DOCUMENTS.DRIVERS_LICENSE">
              {{ constants.DOCUMENTS.DRIVERS_LICENSE }}
            </a-radio-button>
            <a-tooltip>
              <template slot="title"> Coming Soon(ish) </template>
              <a-radio-button disabled :value="constants.DOCUMENTS.PASSPORT">
                {{ constants.DOCUMENTS.PASSPORT }}
              </a-radio-button>
            </a-tooltip>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </div>
    <div class="footer">
      <a-button
        :disabled="loading"
        type="primary"
        :loading="loading"
        @click="submit"
      >
        {{ (loading && 'Loading') || 'Next' }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts">
import moment from 'moment'
import 'moment/locale/en-au'
// import { mapState } from 'vuex'
import constants from '~/store/constants'
export default {
  layout: 'default',
  transition: 'page',
  data() {
    return {
      formLayout: 'vertical',
      blockchain: constants.BLOCKCHAINS.HEDERA,
      expiry: moment().add(1, 'week'),
      dateOfBirth: moment().subtract(16, 'years'),
      document: constants.DOCUMENTS.DRIVERS_LICENSE,
      constants,
      // @ts-ignore
      form: this.$form.createForm(this, { name: 'dynamic_rule' }),
      moment,
      loading: false,
    }
  },
  computed: {},
  mounted() {
    this.$store.commit('SET_stateCreating')
  },
  methods: {
    handleBlockchainChange(newBlockchain: { target: { value: string } }) {
      this.blockchain = newBlockchain.target.value
    },
    handleDocumentChange(newDoc: { target: { value: string } }) {
      this.blockchain = newDoc.target.value
    },
    handleExpiryChange(newExpiry: any) {
      this.expiry = newExpiry
    },
    handleDOBChange(newDOB: any) {
      this.dob = newDOB
    },
    submit(e: Event) {
      e.preventDefault()
      this.form.validateFields(async (err: any, values: any) => {
        if (!err) {
          const loading = this.$message.loading(`Creating POI Request...`, 0)
          this.loading = true
          try {
            const poi = await this.$store.dispatch('ACTION_createNewPOI', {
              request: {
                ...values,
                expiry: this.expiry,
                blockchain: this.blockchain,
                dob: this.dateOfBirth,
                document: this.document,
              },
            })
            this.$message.success(`POI Created!`)
            loading()
            this.loading = false
            setTimeout(() => {
              window.location.href = `upload?code=${poi.code}`
            }, 0)
          } catch (e) {
            console.error(e)
            loading()
            this.loading = false
            this.$message.error(`Hmmm, something went wrong, sorry!`)
            this.$store.commit('SET_isLoading', false)
          } finally {
            // Cleanup
          }
        }
      })
    },
    disabledDates(value: any) {
      const today = new Date()
      today.setDate(today.getDate() - 1)
      return value.valueOf() <= today.valueOf()
    },
    disabledDOB(value: any) {
      const today = new Date()
      today.setDate(today.getDate() - 1)
      return value.valueOf() >= today.valueOf()
    },
  },
}
</script>

<style lang="scss">
.sectionHeader {
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  h2 {
    margin-right: 6px;
    margin-bottom: 0px;
  }
  i {
    padding-top: 10px;
  }
}

.ant-btn .ant-btn-primary {
  margin-top: 10px;
}

.body {
  padding-left: 40px;
  padding-right: 40px;
  max-width: 1024px;
  padding-bottom: 60px;
}
</style>
