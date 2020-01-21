import Vue from "vue";
import Vuex from "vuex";

import guestsui from "./guestsui";

//import accommodations from "./accommodations";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    guestsui
    //accommodations,
  },
  state: {
    selectedEvent: null,
    roomDoorTypes: [
      {
        display_name: "Door",
        value: "Y"
      },
      {
        display_name: "No Door",
        value: "N"
      },
      {
        display_name: "Door with Lock",
        value: "L"
      }
    ],
    bedSlots: [
      {
        value: "D",
        display_name: "Double"
      },
      {
        value: "S",
        display_name: "Single"
      }
    ],
    bedTypes: [
      {
        display_name: "Bed",
        value: "BD"
      },
      {
        display_name: "Sofa",
        value: "SF"
      },
      {
        display_name: "Cod",
        value: "CD"
      },
      {
        display_name: "Inflatable",
        value: "IN"
      }
    ],
    buildingTypes: [
      {
        value: "H",
        display_name: "Hotel"
      },
      {
        value: "A",
        display_name: "Apartments"
      },
      {
        value: "C",
        display_name: "Chalet"
      }
    ],
    genders: [
      {
        display_name: "Male",
        value: "M"
      },
      {
        display_name: "Female",
        value: "F"
      }
    ],
    buildingStars: [
      {
        display_name: "1",
        value: 1
      },
      {
        display_name: "2",
        value: 2
      },
      {
        display_name: "3",
        value: 3
      },
      {
        display_name: "4",
        value: 4
      },
      {
        display_name: "5",
        value: 5
      },
      {
        display_name: "5+",
        value: 6
      }
    ],

    //host: 'http://iphotels.ecotomsk.com',
    host: "",

    loading: true,
    error: null,
    message: null,
    dialog: {
      visible: false,
      title: "",
      submitButton: ""
    },
    dialogRoom: {
      visible: false,
      title: "",
      submitButton: ""
    },
    dialogBed: {
      visible: false,
      title: "",
      submitButton: ""
    },
    dialogBuilding: {
      visible: false,
      title: "",
      submitButton: ""
    },
    currentEvent: {}
  },
  mutations: {
    /*  setEvent(state, payload) {
      state.selectedEvent = payload;
    },
    setCurrentEvent(state, payload) {
      state.currentEvent = payload;
    },
    setLoading(state, payload) {
      state.loading = payload;
    },
    setError(state, payload) {
      state.error = payload;
    },
    clearError(state) {
      state.error = null;
    },
    setMessage(state, payload) {
      state.message = payload;
    },
    clearMessage(state) {
      state.message = null;
    }, */
    openDialog(state, payload) {
      (state.dialog.visible = true),
        (state.dialog.title = payload.title),
        (state.dialog.submitButton = payload.submitButton);
    },
    closeDialog(state) {
      // state.guests.currentGuest = {};
      state.dialog.visible = true;
    }
  },
  actions: {
    setEvent({ commit }, payload) {
      commit("setEvent", payload);
    },
    setCurrentEvent({ commit }, payload) {
      commit("setCurrentEvent", payload);
    },
    setLoading({ commit }, payload) {
      commit("setLoading", payload);
    },
    setError({ commit }, payload) {
      commit("setError", payload);
    },
    clearError({ commit }) {
      commit("clearError");
    },
    setMessage({ commit }, payload) {
      commit("setMessage", payload);
    },
    clearMessage({ commit }) {
      commit("clearMessage");
    }
  },
  getters: {
    getListOfGenders(state) {
      return state.genders;
    },
    getListOfRoomDoorTypes(state) {
      return state.roomDoorTypes;
    },
    getListOfBedSlots(state) {
      return state.bedSlots;
    },
    getListOfBedTypes(state) {
      return state.bedTypes;
    },
    getListOfBuildingTypes(state) {
      return state.buildingTypes;
    },
    getListOfBuildingStars(state) {
      return state.buildingStars;
    },
    loading(state) {
      return state.loading;
    },
    error(state) {
      return state.error;
    },
    message(state) {
      return state.message;
    },
    getSelectedEvent(state) {
      return state.selectedEvent;
    },
    dialogState(state) {
      return state.dialog.visible;
    },
    dialogRoomState(state) {
      return state.dialogRoom.visible;
    },
    dialogBedState(state) {
      return state.dialogBed.visible;
    },
    dialogBuildingState(state) {
      return state.dialogBuilding.visible;
    }
  }
});
