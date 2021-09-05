<template>
  <main>
    <h1>Create</h1>
    <br />
    <a-form :form="form" :layout="formLayout">
      <a-form-item label="Target Blockchain">
        <a-radio-group
          v-model="blockchain"
          default-value="horizontal"
          @change="handleBlockchainChange"
        >
          <a-radio-button value="HEDERA"> Hedera </a-radio-button>
          <a-tooltip>
            <template slot="title"> Coming Soon(ish) </template>
            <a-radio-button disabled value="ETHEREUM">
              Ethereum
            </a-radio-button>
          </a-tooltip>
          <a-tooltip>
            <template slot="title"> Coming Soon(ish) </template>
            <a-radio-button disabled value="BITCOIN"> Bitcoin </a-radio-button>
          </a-tooltip>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="Full Name">
        <a-input
          v-decorator="[
            'name',
            { rules: [{ required: true, message: 'Please input your name' }] },
          ]"
          :disabled="loading"
          placeholder="First Lastman"
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
      <a-form-item label="Expiry">
        <a-date-picker
          :disabled="loading"
          :disabled-date="disabledDates"
          @change="handleExpiryChange"
        />
      </a-form-item>
      <a-form-item>
        <a-button
          :disabled="loading"
          :default-value="moment()"
          type="primary"
          :loading="loading"
          @click="submit"
        >
          {{ (loading && 'Loading') || 'Submit' }}
        </a-button>
      </a-form-item>
    </a-form>
  </main>
</template>

<script lang="js">
import moment from 'moment'
import 'moment/locale/en-au'
// import { mapState } from 'vuex'
// import constants from '~/store/constants'
export default {
  layout: 'default',
  transition: 'page',
  data() {
    return {
      formLayout: 'vertical',
      blockchain: 'HEDERA',
      expiry: moment(),
      form: this.$form.createForm(this, { name: 'dynamic_rule' }),
      moment,
      loading: false,
    }
  },
  computed: {},
  methods: {
    handleBlockchainChange(newBlockchain: { target: { value: string } }) {
      this.blockchain = newBlockchain.target.value
    },
    handleExpiryChange(newExpiry: any) {
      this.expiry = newExpiry
    },
    submit(e: Event) {
      e.preventDefault()
      this.form.validateFields(async (err: any, values: any) => {
        if (!err) {
          const loading = this.$message.loading(`Creating POI Request...`, 0)
          this.loading = true
          console.log(values)
          try {
            const poi = await this.$store.dispatch('ACTION_createNewPOI', {
              request: {
                ...values,
                expiry: this.expiry,
                blockchain: this.blockchain,
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
  },
}
</script>
