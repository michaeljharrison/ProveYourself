import _ from 'lodash'
import { createLogger } from 'vuex'
import CONSTANTS from './constants'
import { POI } from './types'

export const plugins = [createLogger()]

type vuexState = {
  isLoading: boolean
  currentPOI: POI | {}
  currentState: any
}

export const state: any = (): vuexState => ({
  isLoading: false,
  currentPOI: {},
  currentState: CONSTANTS.STATE.CREATING,
})

export const mutations = {
  SET_isLoading(state: vuexState, isLoading: boolean) {
    state.isLoading = isLoading
  },
  SET_request(state: vuexState, request: any) {
    state.currentPOI = request
  },
  SET_stateCreating(state: vuexState, poi: POI) {
    state.currentState = CONSTANTS.STATE.CREATING
    if (poi) {
      state.currentPOI = poi
    }
  },
  SET_stateUploading(state: vuexState, poi: POI) {
    state.currentState = CONSTANTS.STATE.UPLOADING
    if (poi) {
      state.currentPOI = poi
    }
  },
  SET_stateVerifying(state: vuexState, poi: POI) {
    state.currentState = CONSTANTS.STATE.VERIFYING
    if (poi) {
      state.currentPOI = poi
    }
  },
}

export const getters = {
  isAuthenticated(state) {
    return state.auth.loggedIn
  },
  loggedInUser(state) {
    return state.auth.user
  },
}

export const actions = {
  async ACTION_createNewHole(
    { commit, state }: any,
    options: { request: any }
  ) {
    const { request } = options
    // console.log(request);
    const createResponse = await this.$axios.$post('/api/create', request)
    commit('SET_stateUploading', createResponse)
    return createResponse
  },
  async ACTION_fetchHole({ commit, state }: any, options: { code: string }) {
    const { code } = options
    const fetchResponse = await this.$axios.$post('/api/get', { code })
    commit('SET_request', fetchResponse)
    state.currentPOI = fetchResponse
    // commit('SET_stateUploading', fetchResponse)
    return fetchResponse
  },
}
