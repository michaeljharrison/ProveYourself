<template>
  <div class="templateWrapper">
    <div class="body">
      <h1>New Hole</h1>
      <p>{{ constants.COPY.CREATING.DESCRIPTION }}</p>
      <br />
      <a-form :form="form" :layout="formLayout">
        <div class="sectionHeader">
          <a-icon
            type="check-square"
            theme="twoTone"
            :style="{ fontSize: '18px', 'padding-right': '10px' }"
          />
          <h2>Course Information</h2>
          <a-tooltip>
            <template slot="title">
              {{ constants.COPY.CREATING.PROOF_SETTINGS }}</template
            >
            <a-icon type="question-circle" />
          </a-tooltip>
        </div>
        <a-form-item label="Course Name">
          <a-input
            v-decorator="[
              'courseName',
              {
                rules: [
                  { required: true, message: 'Please input your course name.' },
                ],
              },
            ]"
            :disabled="loading"
            placeholder="Eynesbury Golf Course"
          />
        </a-form-item>
        <a-form-item label="State or Territory">
          <a-select
            v-decorator="[
              'state',
              {
                rules: [
                  {
                    required: true,
                    message: 'Please input your course state or territory',
                  },
                ],
              },
            ]"
          >
            <a-select-option value="VIC"> VIC </a-select-option>
            <a-select-option value="NSW"> NSW </a-select-option>
            <a-select-option value="QLD"> QLD </a-select-option>
            <a-select-option value="SA"> SA </a-select-option>
            <a-select-option value="TAS"> TAS </a-select-option>
            <a-select-option value="WA"> WA </a-select-option>
            <a-select-option value="ACT"> ACT </a-select-option>
            <a-select-option value="NT"> NT </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Suburb">
          <a-input
            v-decorator="[
              'suburb',
              {
                rules: [
                  { required: true, message: 'Please input your suburb' },
                ],
              },
            ]"
            :disabled="loading"
            placeholder="Eynesbury"
          />
        </a-form-item>
        <a-form-item label="Course Par">
          <a-input-number
            :min="1"
            :max="999"
            v-decorator="[
              'coursePar',
              {
                rules: [
                  { required: true, message: 'Please input the course par' },
                ],
              },
            ]"
            :disabled="loading"
            placeholder="72"
          />
        </a-form-item>
        <div :style="{ 'margin-top': '34px' }" class="sectionHeader">
          <a-icon
            type="idcard"
            theme="twoTone"
            :style="{ fontSize: '18px', 'padding-right': '10px' }"
          />
          <h2>Hole Information</h2>
          <a-tooltip>
            <template slot="title">
              {{ constants.COPY.CREATING.IDENTITY_SETTINGS }}</template
            >
            <a-icon type="question-circle" />
          </a-tooltip>
        </div>
        <a-form-item label="Hole Number">
          <a-input-number
            :min="1"
            :max="999"
            v-decorator="[
              'holeNumber',
              {
                rules: [
                  { required: true, message: 'Please input the Hole Number' },
                ],
              },
            ]"
            :disabled="loading"
            placeholder="1"
          />
        </a-form-item>
        <a-form-item label="Nickname (optional)">
          <a-input
            v-decorator="[
              'nickname',
              {
                rules: [],
              },
            ]"
            :disabled="loading"
            placeholder="The Peacock"
          />
        </a-form-item>
        <a-form-item label="Hole Par">
          <a-input-number
            :min="1"
            :max="999"
            v-decorator="[
              'holePar',
              {
                rules: [
                  { required: true, message: 'Please input the hole par' },
                ],
              },
            ]"
            :disabled="loading"
            placeholder="6"
          />
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
import 'moment/locale/en-au'
// import { mapState } from 'vuex'
import constants from '~/store/constants'
export default {
  name: 'CreatePage',
  layout: 'default',
  transition: 'page',
  data() {
    return {
      formLayout: 'vertical',
      dateFormat: 'DD/MM/YYYY',
      constants,
      // @ts-ignore
      form: this.$form.createForm(this, { name: 'dynamic_rule' }),
      loading: false,
    }
  },
  computed: {},
  mounted() {
    this.$store.commit('SET_stateCreating')
  },
  methods: {
    submit(e: Event) {
      e.preventDefault()
      this.form.validateFields(async (err: any, values: any) => {
        if (!err) {
          const loading = this.$message.loading(`Creating New Hole...`, 0)
          this.loading = true
          try {
            console.log(values)
            const hole = await this.$store.dispatch('ACTION_createNewHole', {
              request: {
                ...values,
              },
            })
            this.$message.success(`Hole Created!`)
            loading()
            this.loading = false
            setTimeout(() => {
              window.location.href = `upload?code=${hole.code}`
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

.sectionHeader {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: horizontal;
  -webkit-box-direction: normal;
  -ms-flex-direction: row;
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
