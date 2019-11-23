import axios from 'axios';

export default {
    state: {
        availability: [],
        accommodationAvailability: [],
        accommodationAvailabilityEmpty: []
    },
    mutations: {
        updateAvailability(state, data) {
            state.availability.splice(0, state.availability.length);
            for (let index = 0; index < data.length; index++) {
                state.availability.push(data[index]);
            }
        },
        updateAccommodationAvailability(state, data) {
            state.accommodationAvailability.splice(0, state.accommodationAvailability.length);
            for (let index = 0; index < data.length; index++) {
                state.accommodationAvailability.push(data[index]);
            }
        },
        updateAccommodationAvailabilityEmpty(state, data) {
            state.accommodationAvailabilityEmpty.splice(0, state.accommodationAvailabilityEmpty.length);
            for (let index = 0; index < data.length; index++) {
                state.accommodationAvailabilityEmpty.push(data[index]);
            }
        }
    },
    actions: {
        /* List */
        async updateAvailabilityList({ dispatch, commit, rootState }) {
            try {
                commit('setLoading', true)
                const response = await axios.get(rootState.host + '/api/availability/')
                commit('updateAvailability', response.data.results);
                commit('setLoading', false)
            } catch (e) {
                commit('setError', e.response.data)
                commit('setLoading', false)
            }
        },

        async updateAvailabilityListForAccommodation({ dispatch, commit, rootState }, id) {
            try {
                commit('setLoading', true)
                const response = await axios.get(rootState.host + '/api/availability/?accommodation=' + id + '&ordering=night')
                commit('updateAccommodationAvailability', response.data.results);
            } catch (e) {
                commit('setError', e.response.data)
                commit('setLoading', false)
            }
        },

        async updateEmptyAvailabilityListForAccommodation({ dispatch, commit, rootState }, id) {
            try {
                commit('setLoading', true)
                const response = await axios.get(rootState.host + '/api/nights/', {
                    params: {
                        accommodation: id
                    }
                }
                )
                commit('updateAccommodationAvailabilityEmpty', response.data);
                commit('setLoading', false)
            } catch (e) {
                commit('setError', e.response.data)
                commit('setLoading', false)
            }
        },
        /* Update */
        async updateAvailability({ dispatch, commit, rootState }, availability) {
            try {
                commit('setLoading', true)
                const response = await axios.put(this.state.host + '/api/availability/' + availability.id + '/', availability)

                commit('setLoading', false)
                rootState.dialogAvailability.visible = !rootState.dialogAvailability.visible
                commit('setMessage', 'Availability was successfully updated')
            } catch (e) {
                commit('setError', e.response.data)
                commit('setLoading', false)
            }
        },
        /*  partial_update */
        async partialUpdateAvailability({ dispatch, commit, rootState }, availability) {
            try {
                commit('setLoading', true)
                const response = await axios.patch(this.state.host + '/api/availability/' + availability.id + '/', availability)
                commit('setLoading', false)
                commit('setMessage', 'Availability was successfully partial_update')
            } catch (e) {
                commit('setError', e.response.data)
                commit('setLoading', false)
            }
        },
        /* Delete */
        async deleteAvailability({ dispatch, commit, rootState }, id) {
            try {
                commit('setLoading', true)
                const response = await axios.delete(this.state.host + '/api/availability/' + id + '/')
                commit('setLoading', false)
                commit('setMessage', 'Availability was successfully deleted')
            } catch (e) {
                commit('setError', e.response.data)
                commit('setLoading', false)
            }
        },
        /* Create */
        async createNewAvailability({ dispatch, commit, rootState }, availability) {
            try {
                commit('setLoading', true)
                const response = await axios.post(this.state.host + '/api/availability/', availability)
                commit('setLoading', false)
                commit('setMessage', 'New availability was successfully created')
                return response.data
            } catch (e) {
                commit('setError', e.response.data)
                commit('setLoading', false)
            }
        }
    },
    getters: {
        getListOfAvailability(state) {
            return state.availability
        },
        getListOfAvailabilityAccommodation(state) {
            return state.accommodationAvailability
        },
        getListOfAvailabilityAccommodationEmpty(state) {
            return state.accommodationAvailabilityEmpty
        }
    }
}
