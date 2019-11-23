import axios from 'axios'

export default {
  state: {
    accommodations: [],
    selectedAccommodations: [],
    delete_arb_message: {}
  },
  mutations: {
    updateAccommodations(state, data) {
      state.accommodations.splice(0, state.accommodations.length)
      for (let index = 0; index < data.length; index++) {
        state.accommodations.push(data[index])
      }
    },
    addSelectedAccommodations(state, payload) {
      state.selectedAccommodations = payload
    },
    deleteSelectedAccommodation(state) {
      state.selectedAccommodations = []
    },
    delete_arb_message(state, payload) {
      state.delete_arb_message = payload
    }
  },
  actions: {
    /* read */
    async updateAccommodationsList({ dispatch, commit, rootState }, payload) {
      try {
        commit('setLoading', true)
        const response = await axios.get(
          rootState.host + '/api/accommodations/',
          {
            params: {
              //page: payload.page || 1,
              event: payload.event_id,
              name__icontains: payload.filterParams.name,
              status__in: payload.filterParams.status.toString(),
              room_door: payload.filterParams.door_type.toString(),
              bed_type: payload.filterParams.bed_type.toString(),
              slot: payload.filterParams.slot,
              sheets_required: payload.filterParams.sheets_required,
              is_optional: payload.filterParams.is_optional
            }
          }
        )
        commit('updateAccommodations', response.data.results)
        commit('setLoading', false)
      } catch (e) {
        commit('setError', e.response.data)
        commit('setLoading', false)
      }
    },
    /*  update */
    async updateAccommodation({ dispatch, commit, rootState }, accommodation) {
      try {
        commit('setLoading', true)
        const response = await axios.put(
          this.state.host + '/api/accommodations/' + accommodation.id + '/',
          accommodation
        )
        commit('setLoading', false)
        commit('setMessage', 'Accommodation was successfully updated')
        rootState.dialog.visible = !rootState.dialog.visible
        return response.data
      } catch (e) {
        commit('setError', e.response.data)
        commit('setLoading', false)
      }
    },
    /* delete */
    async checkAccommodationsPlan({ commit, rootState }) {
      let requestData = {
        accommodation_ids: rootState.accommodations.selectedAccommodations.map(
          accommodation => {
            return accommodation.id
          }
        ),
        room_ids: rootState.rooms.selectedRooms.map(room => {
          return room.id
        }),
        bed_ids: rootState.beds.selectedBeds.map(bed => {
          return bed.id
        })
      }
      try {
        const response = await axios.post(
          this.state.host + '/api/delete_arb_message/',
          requestData
        )
        commit('delete_arb_message', response.data)
      } catch (e) {
        commit('setError', e.response.data)
      }
    },

    async deleteAccommodation({ dispatch, commit, rootState }, accommodation) {
      try {
        commit('setLoading', true)
        const response = await axios.delete(
          this.state.host + '/api/accommodations/' + accommodation.id + '/'
        )
        commit('setLoading', false)
        commit('setMessage', 'Accommodation was successfully deleted')
      } catch (e) {
        commit('setError', e.response.data)
        commit('setLoading', false)
      }
    },
    /* create */
    async createNewAccommodation(
      { dispatch, commit, rootState },
      accommodation
    ) {
      try {
        commit('setLoading', true)
        const response = await axios.post(
          this.state.host + '/api/accommodations/',
          accommodation
        )
        commit('setLoading', false)
        commit('setMessage', 'New accommodation was successfully created')
        rootState.dialog.visible = !rootState.dialog.visible
        return response.data
      } catch (e) {
        commit('setError', e.response.data)
        commit('setLoading', false)
      }
    }
  },
  getters: {
    getListOfAccommodations(state) {
      const accommodations = state.accommodations.map(accommodation => {
        const rooms = accommodation.rooms.map(room => {
          const beds = room.beds.map(bed => {
            var bedTypeView
            var iconBed
            if (bed.bed_type == 'BD') {
              bedTypeView = 'Bed'
            } else if (bed.bed_type == 'SF') {
              bedTypeView = 'Sofa'
            } else if (bed.bed_type == 'CD') {
              bedTypeView = 'Cod'
              iconBed = 'icon-cot'
            } else if (bed.bed_type == 'IN') {
              bedTypeView = 'Inflatable'
              iconBed = 'icon-mattress'
            } else {
              bedTypeView = 'Is missing'
            }

            if (bed.bed_type == 'BD' && bed.slot == 'S') {
              iconBed = 'icon-single-bed'
            } else if (bed.bed_type == 'BD' && bed.slot == 'D') {
              iconBed = 'icon-double-bed'
            } else if (bed.bed_type == 'SF' && bed.slot == 'S') {
              iconBed = 'icon-single-sofa'
            } else if (bed.bed_type == 'SF' && bed.slot == 'D') {
              iconBed = 'icon-double-sofa'
            }
            var bedSlotView
            if (bed.slot == 'D') {
              bedSlotView = 'Double'
            } else if (bed.slot == 'S') {
              bedSlotView = 'Single'
            } else {
              bedSlotView = ''
            }
            var bedIsOptional
            if (bed.is_optional == true) {
              bedIsOptional = 'is Optional'
            } else {
              bedIsOptional = ''
            }
            return {
              id: bed.id,
              key: Math.random(),
              label: `${bedSlotView}   ${bedTypeView}   ${bedIsOptional}`,
              bed_type: bed.bed_type,
              slot: bed.slot,
              sheets_required: bed.sheets_required,
              is_optional: bed.is_optional,
              type: 'bed',
              icon: iconBed
            }
          })
          var roomView
          var iconRoom
          if (room.room_door == 'Y') {
            roomView = 'with door'
            iconRoom = 'icon-door'
          } else if (room.room_door == 'N') {
            roomView = 'without door'
            iconRoom = 'icon-door-none'
          } else if (room.room_door == 'L') {
            roomView = 'door with lock'
            iconRoom = 'icon-door-lock'
          }
          return {
            id: room.id,
            key: Math.random(),
            label: `Room ${roomView}`,
            children: beds,
            room_door: room.room_door,
            icon: iconRoom,
            type: 'room'
          }
        })

        const accommodationsTree = {
          id: accommodation.id,
          key: Math.random(),
          label: `${accommodation.name}`,
          icon: 'fas fa-home',
          name: accommodation.name,
          type: 'accommodation',
          keys: accommodation.keys_number,
          building: accommodation.building,
          status: accommodation.status,
          availability: accommodation.availability,
          children: rooms
        }
        return accommodationsTree
      })
      return accommodations
    },
    getListOfAccommodationsResettlement(state) {
      const accommodations = state.accommodations.map(accommodation => {
        const rooms = accommodation.rooms.map(room => {
          const beds = room.beds.map(bed => {
            var bedTypeView
            var iconBed
            if (bed.bed_type == 'BD') {
              bedTypeView = 'Bed'
            } else if (bed.bed_type == 'SF') {
              bedTypeView = 'Sofa'
            } else if (bed.bed_type == 'CD') {
              bedTypeView = 'Cod'
              iconBed = 'icon-cot'
            } else if (bed.bed_type == 'IN') {
              bedTypeView = 'Inflatable'
              iconBed = 'icon-mattress'
            } else {
              bedTypeView = 'Is missing'
            }

            if (bed.bed_type == 'BD' && bed.slot == 'S') {
              iconBed = 'icon-single-bed'
            } else if (bed.bed_type == 'BD' && bed.slot == 'D') {
              iconBed = 'icon-double-bed'
            } else if (bed.bed_type == 'SF' && bed.slot == 'S') {
              iconBed = 'icon-single-sofa'
            } else if (bed.bed_type == 'SF' && bed.slot == 'D') {
              iconBed = 'icon-double-sofa'
            }
            var bedSlotView
            if (bed.slot == 'D') {
              bedSlotView = 'Double'
            } else if (bed.slot == 'S') {
              bedSlotView = 'Single'
            } else {
              bedSlotView = ''
            }
            var bedIsOptional
            if (bed.is_optional == true) {
              bedIsOptional = 'is Optional'
            } else {
              bedIsOptional = ''
            }
            return {
              id: bed.id,
              key: Math.random(),
              label: `${bedSlotView}   ${bedTypeView}   ${bedIsOptional}`,
              bed_type: bed.bed_type,
              slot: bed.slot,
              sheets_required: bed.sheets_required,
              is_optional: bed.is_optional,
              type: 'bed',
              disabled: true,
              icon: iconBed
            }
          })
          var roomView
          var iconRoom
          if (room.room_door == 'Y') {
            roomView = 'with door'
            iconRoom = 'icon-door'
          } else if (room.room_door == 'N') {
            roomView = 'without door'
            iconRoom = 'icon-door-none'
          } else if (room.room_door == 'L') {
            roomView = 'door with lock'
            iconRoom = 'icon-door-lock'
          }
          return {
            id: room.id,
            key: Math.random(),
            label: `Room ${roomView}`,
            children: beds,
            room_door: room.room_door,
            icon: iconRoom,
            disabled: true,
            type: 'room'
          }
        })
        const accommodationsTree = {
          id: accommodation.id,
          key: Math.random(),
          label: `${accommodation.name}`,
          icon: 'fas fa-home',
          name: accommodation.name,
          type: 'accommodation',
          keys: accommodation.keys_number,
          building: accommodation.building,
          status: accommodation.status,
          availability: accommodation.availability,
          children: rooms
        }

        return accommodationsTree
      })
      return accommodations
    },
    getListOfAccommodationsBuilding(state) {
      return state.accommodations
    }
  }
}
