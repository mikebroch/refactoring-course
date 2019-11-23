import axios from 'axios'

export default {
  state: {
    guests: [],
    currentGuest: {},
    allGuests: [],
    nonResettleGuests: [],
    selectedGuests: [],
    companions: [],
    cannot: [],
    filtersNonResettleGuest: {
      name: '',
      gender: '',
      role__in: [],
      status__in: []
    },

    // pagination
    count: null,
    next: null,
    previous: null,

    closeDialog: true,
    loadingAllGuests: false
  },

  mutations: {
    updateGuests(state, data) {
      state.guests = data
    },
    updateCurrentGuest(state, data) {
      state.currentGuest = data
    },
    updateAllGuests(state, payload) {
      state.allGuests = payload
    },
    updateNonResettleGuests(state, payload) {
      state.nonResettleGuests = payload
    },
    updateFiltersNonResettleGuest(state, payload) {
      state.filtersNonResettleGuest = payload
    },
    updateCurrentGuest(state, payload) {
      const pref = Object.assign({}, payload)
      const guest = Object.assign({}, payload.guest)
      pref.guest = guest
      state.currentGuest = pref
    },
    addSelectedGuests(state, payload) {
      state.selectedGuests = payload
    },
    deleteSelectedGuests(state) {
      state.selectedGuests = []
    },
    setCount(state, data) {
      state.count = data
    },
    setNext(state, data) {
      state.next = data
    },
    setPrevious(state, data) {
      state.previous = data
    },
    loadingAllGuests(state, payload) {
      return (state.loadingAllGuests = payload)
    },
    clearAllGuestsList(state) {
      return (state.allGuests = [])
    },
    // readCompanions(state, payload) {
    //   return (state.companions = payload)
    // },
    readCannot(state, payload) {
      return (state.cannot = payload)
    }
  },

  actions: {
    // Create
    async createNewGuestui({ commit, rootState }, payload) {
      try {
        commit('setLoading', true)
        payload.guest.event = payload.event_id
        const response = await axios.post(
          this.state.host + '/api/guests_with_preferences/',
          payload.guest
        )
        // close create dialog
        rootState.dialog.visible = !rootState.dialog.visible
        commit('setLoading', false)
        // rootState.dialog.visible = false;
        commit('setMessage', 'New guest was successfully created')
        return response.data
      } catch (e) {
        if (e && e.response) {
          commit('setError', e.response.data)
          commit('setLoading', false)
        }
      }
    },
    // Read nonResettled Guests
    async updateNonResettleGuestsList(
      { commit, rootState, state },
      pageSettings
    ) {
      try {
        commit('setLoading', true)
        const response = await axios.get(
          rootState.host + '/api/guests_with_preferences/',
          {
            params: {
              event: pageSettings.event_id,
              not_settled_on_date: pageSettings.not_settled_on_date.toString(),

              guest__name__icontains: state.filtersNonResettleGuest.name,
              guest__gender__in: state.filtersNonResettleGuest.gender,
              role__in: state.filtersNonResettleGuest.role__in.toString(),
              status__in: state.filtersNonResettleGuest.status__in.toString()
            }
          }
        )
        commit('updateNonResettleGuests', response.data.results)
        commit('setLoading', false)
      } catch (e) {
        if (e && e.response) {
          commit('setLoading', false)
          commit('setError', e.response.data)
        }
      }
    },

    // Read All Guests
    async updateGuestsListui({ state, commit, rootState }, pageSettings) {
      try {
        commit('setLoading', true)
        const response = await axios.get(
          rootState.host + '/api/guests_with_preferences/',
          {
            params: {
              page: pageSettings.pageSettings.page,
              page_size: pageSettings.pageSettings.page_size,
              event: pageSettings.event_id,
              ordering: pageSettings.pageSettings.ordering,
              guest__name__icontains: pageSettings.pageSettings.name,
              guest__gender__in: pageSettings.pageSettings.gender,
              check_in_date__gte: pageSettings.pageSettings.check_in_date,
              check_out_date__lte: pageSettings.pageSettings.check_out_date,
              role__in: pageSettings.pageSettings.role__in.toString(),
              status__in: pageSettings.pageSettings.status__in.toString()
            }
          }
        )
        commit('updateGuests', response.data.results)
        commit('setCount', response.data.count)
        commit('setLoading', false)
        // pagination next button
        if (response.data.next) {
          const nextPage = response.data.next.split('page=')[1][0]
          commit('setNext', nextPage)
        } else {
          commit('setNext', null)
        }
        // pagination prev button
        if (response.data.previous) {
          if (state.next == 3) {
            commit('setPrevious', '1')
            return
          }
          const prevPage = response.data.next.split('page=')[1][0]
          commit('setPrevious', prevPage)
        } else {
          commit('setPrevious', null)
        }

        // close dialog
        rootState.dialog.visible = !rootState.dialog.visible

        return response.data
      } catch (e) {
        if (e && e.response) {
          commit('setLoading', false)
          commit('setError', e.response.data)
        }
      }
    },

    // Read One Guest
    // async readGuest({ commit }, payload) {
    //   try {
    //     commit('setLoading', true)
    //     const response = await axios.get(
    //       this.state.host + `/api/guests_with_preferences/${payload}`
    //     )
    //     commit('setLoading', false)
    //     commit('updateCurrentGuest', response.data.results)
    //     //commit('setMessage', 'Guest was successfully updated')

    //     return response.data
    //   } catch (e) {
    //     if (e && e.response) {
    //       commit('setError', e.response.data)
    //     }
    //     commit('setLoading', false)
    //   }
    // },

    // Udate
    async updateGuestui({ commit }, payload) {
      try {
        commit('setLoading', true)
        const response = await axios.put(
          this.state.host +
            '/api/guests_with_preferences/' +
            payload.guest.id +
            '/',
          payload.guest
        )
        // close dialog
        rootState.dialog.visible = !rootState.dialog.visible

        // dispatch('updateGuestsListui');
        commit('setLoading', false)
        commit('updateGuests')
        commit('setMessage', 'Guest was successfully updated')

        return response.data
      } catch (e) {
        if (e && e.response) {
          commit('setError', e.response.data)
        }
        commit('setLoading', false)
      }
    },

    // Delete
    async deleteGuestui({ commit }, payload) {
      try {
        commit('setLoading', true)
        const response = await axios.delete(
          this.state.host + '/api/guests_with_preferences/' + payload.id + '/'
        )
        commit('setLoading', false)
        commit('setMessage', 'Guest was successfully deleted')
        return response
      } catch (e) {
        commit('setError', e.response.data)
        commit('setLoading', false)
      }
    },

    // Sorting
    sortGuestui({ commit, rootState }, payload) {
      commit('setLoading', true)
      axios
        .get(rootState.host + '/api/guests_with_preferences/', {
          params: {
            page: 1,
            event: payload.event_id,
            ordering: payload.sortingOptions
          }
        })
        .then(response => {
          commit('updateGuests', response.data.results)
        })
        .catch(error => {})
    },

    // Read one guest
    async getGuestById({ commit }, payload) {
      try {
        commit('setLoading', true)
        const response = await axios.get(
          this.state.host + '/api/guests_with_preferences/' + payload.id + '/'
        )
        commit('updateCurrentGuest', response.data.results)
        commit('setLoading', false)
      } catch (e) {
        commit('setLoading', false)
      }
    },

    // Read all guest for transopting component
    async getAllGuests({ commit, rootState }, pageSettings) {
      try {
        commit('loadingAllGuests', true)
        const response = await axios.get(
          rootState.host + '/api/guests_with_preferences/',
          {
            params: {
              event: pageSettings.event_id,
              ordering: pageSettings.pageSettings.ordering,
              get_all: true
            }
          }
        )

        commit('updateAllGuests', response.data.results)
        commit('loadingAllGuests', false)
      } catch (e) {
        console.log('e', e)
        commit('loadingAllGuests', false)
      }
    },

    // Read can not live with
    async getCannotLiveWith({ commit, rootState }, payload) {
      try {
        // commit('loadingAllGuests', true)
        await axios.post(rootState.host + '/api/cannot_live_with/', payload)
        // commit('readCannot', response.data.results)
        // commit('loadingAllGuests', false)
      } catch (e) {
        console.log('e', e)
        // commit('loadingAllGuests', false)
      }
    },
    async deleteCannotLiveWith({ rootState }, payload) {
      try {
        // commit('loadingAllGuests', true)
        await axios.delete(rootState.host + `/api/cannot_live_with/${payload}`)
        // commit('readCannot', response.data.results)
        // commit('loadingAllGuests', false)
      } catch (e) {
        console.log('e', e)
        // commit('loadingAllGuests', false)
      }
    },
    async creatingCompanions({ commit, rootState }, payload) {
      try {
        commit('loadingAllGuests', true)
        await axios.post(rootState.host + '/api/manage_companions/', payload)

        // commit('readCompanions', response.data.results)
        commit('loadingAllGuests', false)
      } catch (e) {
        console.log('e', e)
        // commit('loadingAllGuests', false)
      }
    },
    async deletingCompanions({ commit, rootState }, payload) {
      try {
        commit('loadingAllGuests', true)
        await axios.get(rootState.host + '/api/manage_companions/', {
          params: {
            event: payload.event,
            guest: payload.guest
          }
        })
        // commit('readCompanions', response.data.results)
        commit('loadingAllGuests', false)
      } catch (e) {
        console.log('e', e)
        // commit('loadingAllGuests', false)
      }
    }
  },

  getters: {
    getListOfGuestsui(state) {
      return state.guests
    },
    getListOfNonResettleGuestui(state) {
      return state.nonResettleGuests
    },
    getCurrentGuest(state) {
      return state.guests
    },
    getListOfAllGuests(state) {
      const guests = state.allGuests.map(guest => {
        return {
          key: guest.guest.id,
          label: guest.guest.name
        }
      })
      return guests
    },
    loadingAllGuests(state) {
      return state.loadingAllGuests
    },
    getGuestNextPageui(state) {
      return state.next
    },
    getGuestPreviousPageui(state) {
      return state.previous
    },
    getCannot(state) {
      // return [{ id: 96, name: 'Philip Robinson' }]
      return state.cannot
    }
  }
}
