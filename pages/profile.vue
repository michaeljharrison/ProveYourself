<template>
  <div class="templateWrapper">
    <div class="body">
      <h1>Edit Course Information</h1>
      <br />
      <a-form :form="form" :layout="formLayout">
        <a-form-item label="Course Name">
          <a-input
            v-decorator="[
              'courseName',
              {
                initialValue: loggedInUser.courseName || '',
                rules: [
                  { required: true, message: 'Please input your course name.' },
                ],
              },
            ]"
            :disabled="loading"
            placeholder="Course Name"
          />
        </a-form-item>
        <a-form-item label="Course Location">
          <a-input
            v-decorator="[
              'courseLocation',
              {
                initialValue: loggedInUser.courseLocation || '',
                rules: [
                  {
                    required: true,
                    message: 'Please input your course location.',
                  },
                ],
              },
            ]"
            :disabled="loading"
            placeholder="Course Location"
            :initialValue="loggedInUser.courseLocation"
          />
        </a-form-item>
        <a-form-item label="Course Par">
          <a-input-number
            :min="1"
            :max="999"
            v-decorator="[
              'coursePar',
              {
                initialValue: loggedInUser.coursePar || '',
                rules: [
                  { required: true, message: 'Please input the course par' },
                ],
              },
            ]"
            :disabled="loading"
            placeholder="72"
            :initialValue="loggedInUser.coursePar"
          />
        </a-form-item>
                    <image-upload
                    v-on:input_event="newImage"
                    ></image-upload>
        </a-form-item>
      </a-form>
    </div>
    <div class="footer">
      <a-button
        :disabled="loading"
        type="danger"
        :loading="loading"
        @click="goHome"
      >
        <nuxt-link to="dashboard">Back</nuxt-link>
      </a-button>
      <a-button
        :disabled="loading"
        type="primary"
        :loading="loading"
        @click="submit"
      >
        {{ (loading && 'Loading') || 'Save' }}
      </a-button>
    </div>
  </div>
</template>

<script lang="ts">
import 'moment/locale/en-au'
import { mapGetters } from 'vuex'
import ImageUpload from '~/components/ImageUpload.vue'
import constants from '~/store/constants'
export default {
  components: { ImageUpload },
  name: 'ProfilePage',
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
  computed: {
    ...mapGetters(['loggedInUser']),
  },
  mounted() {
    // this.$store.commit('SET_stateUpdatingUser')
  },
  methods: {
    goHome() {
      this.$router.push('/dashboard')
    },
    newImage(value) {
      console.log(value);
    },
    submit(e: Event) {
      e.preventDefault()
      this.form.validateFields(async (err: any, values: any) => {
        if (!err) {
          const loading = this.$message.loading(
            `Updating Course Information...`,
            0
          )
          this.loading = true
          try {
            console.log(values)
            const hole = await this.$store.dispatch(
              'ACTION_updateCourseInformation',
              {
                request: {
                  ...values,
                },
              }
            )
            await this.$auth.fetchUser()
            this.$message.success(`Information Updated!`)
            loading()
            this.loading = false
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
