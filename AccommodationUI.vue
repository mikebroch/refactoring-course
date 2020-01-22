<template>
  <div class="page-wrapper">
    <el-container>
      <!-- Filters -->
      <el-aside class="filters">
        <el-form
          ref="form"
          :model="sizeForm"
          label-width="120px"
          label-position="top"
          size="mini"
          class="asside-form"
        >
          <!--Accommodation-->
          <el-form-item label="Accommodation name" class="asside-form__item">
            <el-input
              style="width: 210px;"
              placeholder="input name"
              ref="guestsName"
              v-model="filterParams.name"
              @input.native="filter"
            >
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
          </el-form-item>

          <!-- status -->
          <el-form-item label="Accommodation status" class="asside-form__item">
            <el-select
              style="width: 210px;"
              v-model="filterParams.status"
              placeholder="select status"
              clearable
              multiple
              @change="filter"
            >
              <el-option
                v-for="status in this.$store.state.statuses.statuses"
                v-bind:key="status.id"
                :label="status.name"
                :value="status.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <hr />
          <!-- door type -->
          <el-form-item label="Room door" class="asside-form__item">
            <el-select
              style="width: 210px;"
              v-model="filterParams.door_type"
              placeholder="select door type"
              clearable
              multiple
              @change="filter"
            >
              <el-option
                v-for="room_door in this.$store.getters.getListOfRoomDoorTypes"
                v-bind:key="room_door.value"
                :label="room_door.display_name"
                :value="room_door.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <hr />
          <!-- bed type -->
          <el-form-item label="Bed type" class="asside-form__item">
            <el-select
              style="width: 210px;"
              v-model="filterParams.bed_type"
              placeholder="select bed type"
              clearable
              multiple
              @change="filter"
            >
              <el-option
                v-for="bed_type in this.$store.getters.getListOfBedTypes"
                v-bind:key="bed_type.value"
                :label="bed_type.display_name"
                :value="bed_type.value"
              ></el-option>
            </el-select>
          </el-form-item>

          <!-- Bed slot -->
          <el-form-item label="Bed slot" style="width: 210px;" class="asside-form__item">
            <el-checkbox-group v-model="filterParams.slot">
              <el-checkbox true-label="S" :false-label="''" border @change="filter">Single</el-checkbox>
              <el-checkbox true-label="D" :false-label="''" border @change="filter">Double</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <!-- Other -->
          <el-form-item label=" Bed editable" class="asside-form__item">
            <el-checkbox
              v-model="filterParams.sheets_required"
              true-label="true"
              :false-label="''"
              border
              @change="filter"
            >Sheets</el-checkbox>
            <el-checkbox
              v-model="filterParams.is_optional"
              true-label="true"
              :false-label="''"
              border
              @change="filter"
            >Optional</el-checkbox>
          </el-form-item>
          <div class="filterButtons">
            <el-button type="danger" size="mini" plain @click="resetFilterForm">Reset</el-button>
          </div>
        </el-form>
      </el-aside>

      <!-- Tree container -->
      <el-container>
        <div class="tree__container">
          <div class="tree__header">
            <!-- Select all -->
            <el-checkbox
              class="checkbox"
              :disabled="isDisabledSelectAll"
              v-model="checkAll"
              @change="handleCheckAllChange"
            >Select all</el-checkbox>

            <div>
              <!-- add button -->
              <el-tooltip
                class="item"
                effect="dark"
                content="add new accommodation"
                placement="top"
              >
                <el-button
                  v-if="addButton"
                  class="table__addButton"
                  type="primary"
                  size="mini"
                  plain
                  @click="openCreateDialog"
                >Add</el-button>
              </el-tooltip>

              <!-- Delete button -->
              <el-popover v-if="deleteBtn" placement="right" width="360" v-model="active">
                <p v-if="this.$store.state.accommodations.delete_arb_message.used_count != 0">
                  <strong>{{ this.$store.state.accommodations.delete_arb_message.used_count}}</strong> out of
                  <strong>{{ this.$store.state.accommodations.delete_arb_message.total_count}}</strong> selected items are used in Plan(s)
                  <br />Are you sure you want to delete selected item(s)?
                </p>
                <p v-else>
                  Are you sure you want to delete the
                  <strong>{{ this.$store.state.accommodations.selectedAccommodations.length + this.$store.state.rooms.selectedRooms.length + this.$store.state.beds.selectedBeds.length }}</strong> selected item(s)?
                </p>
                <div style="text-align: right;">
                  <el-button size="mini" type="text" @click="active = false">Cancel</el-button>
                  <el-button type="danger" size="mini" @click="deleteSelectedAccommodations">Confirm</el-button>
                </div>
                <el-button
                  style="margin-left: 0px"
                  :disabled="isDisabled"
                  type="danger"
                  size="mini"
                  plain
                  slot="reference"
                  @click="checkOccurrencePlan"
                >Delete</el-button>
              </el-popover>
            </div>
          </div>

          <!-- Tree -->
          <el-tree
            class="custom-tree"
            ref="tree"
            node-key="key"
            v-loading="loading"
            empty-text="There are no accommodations for this event"
            :data="listOfAccommodations"
            :show-checkbox="show"
            check-strictly
            :default-expand-all="expandTree"
            :expand-on-click-node="false"
            :props="defaultProps"
            @node-click="editNodeClick"
            @check-change="handleSelectionChange"
          >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <!-- icon label -->
              <el-popover
                v-if="data.type == 'accommodation'"
                placement="top-start"
                trigger="hover"
                transition="el-zoom-in-center"
              >
                <p style="margin: 5px">
                  <i class="fas fa-map-marker-alt"></i>
                  {{data.building.address}}
                </p>

                <span class="acc-row" slot="reference">
                  <i :class="data.icon"></i>
                  {{ node.label }}
                </span>
              </el-popover>
              <el-popover v-else disabled>
                <span class="acc-row" slot="reference">
                  <i :class="data.icon"></i>
                  {{ node.label }}
                </span>
              </el-popover>
              <span class="acc-row1" v-if="node.level === 1">
                <!-- Room count -->
                <span>
                  <i class="fas fa-door-closed">&nbsp;&nbsp;{{ data.children.length }}</i>
                </span>

                <!-- Availability icon -->
                <span style="margin-left:10px">
                  <el-tooltip effect="dark" placement="top" content="availability">
                    <button
                      v-if="data.availability.length > 0"
                      class="el-icon-circle-check text-success"
                      @click.stop="openCreateAvailabilityDialog(data)"
                    ></button>
                    <button
                      v-else
                      class="el-icon-circle-close text-warning"
                      @click.stop="openCreateAvailabilityDialog(data)"
                    ></button>
                  </el-tooltip>
                </span>
              </span>

              <span class="acc-row1" v-if="node.level === 2">
                <i class="fas fa-bed">&nbsp;&nbsp;{{ data.children.length }}</i>
              </span>

              <!-- add/remove button -->
              <span>
                <el-tooltip transition="el-zoom-in-center" content="add new room" placement="right">
                  <el-button
                    style="margin:2px 0 0 0"
                    v-if="node.level === 1 && addRoomButoon"
                    type="primary"
                    size="mini"
                    icon="el-icon-plus"
                    plain
                    @click.stop="(node) => createNewRoom(data)"
                  ></el-button>
                </el-tooltip>

                <el-tooltip transition="el-zoom-in-center" content="add new bed" placement="right">
                  <el-button
                    style="margin:2px 0 0 0"
                    v-if="node.level === 2 && addBedButton"
                    type="primary"
                    size="mini"
                    icon="el-icon-plus"
                    plain
                    @click.stop="(node) => createNewBed(data)"
                  ></el-button>
                </el-tooltip>
              </span>
            </span>
          </el-tree>
        </div>
      </el-container>
    </el-container>

    <!-- Add button -->
    <!-- <el-tooltip class="item" effect="dark" content="add new accommodation" placement="left">
      <el-button
        v-if="addButton"
        class="addButton"
        type="primary"
        icon="el-icon-plus"
        circle
        @click="openCreateDialog"
      ></el-button>
    </el-tooltip>-->

    <!-- Availability Dialog -->
    <el-dialog
      style="padding: 5px 20px;"
      :title="dialogAvailability.title"
      :visible.sync="dialogAvailability.visible"
      top="10vh"
      width="400px"
      @closed="closeDialog"
    >
      <div class="availability-list">
        <AvailabilityDialog
          v-for="item in listOfAvailability"
          :key="item.id"
          :formCreateAvailability="item"
          @formChanged="changeAvailability"
          :read="true"
        >
          <template>
            <el-button
              style=" height: 32px;"
              type="danger"
              size="small"
              icon="el-icon-delete"
              plain
              @click="deleteAvailability(item)"
            ></el-button>
          </template>
        </AvailabilityDialog>
      </div>
      <span></span>
      <div class="availability-container">
        <div class="availability-list">
          <AvailabilityDialog
            v-for="item in listOfEmptyAvailability "
            :key="item.night"
            :formCreateAvailability="item"
            @formChanged="newAvailabilityCreate"
            :read="true"
          >
            <!-- <template>
              <el-button
                style="height: 32px;"
                type="primary"
                size="small"
                icon="el-icon-plus"
                plain
                @click="addNewAvailability"
              ></el-button>
            </template>-->
          </AvailabilityDialog>
          <div style="text-align: right; margin-top: 20px;">
            <el-button
              @click="dialogAvailability.visible = false"
              type="primary"
              size="small"
            >Cancel</el-button>
            <el-button
              :disabled="this.newAvailabilityMas==0"
              type="primary"
              size="small"
              @click="addNewAvailability"
            >Save</el-button>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- Change Dialog for Room -->
    <el-dialog
      :title="dialogRoom.title"
      :visible.sync="dialogRoom.visible"
      top="30vh"
      width="500px"
      lock-scroll
      @closed="closeDialog"
    >
      <el-form class="dialogForm" :model="formChangeRoom" ref="formChangeRoom" label-width="120px">
        <!-- Room door -->
        <el-form-item label="Room Door" size="small" required>
          <el-select v-model="formChangeRoom.room_door" placeholder="please select room_door">
            <el-option
              v-for="room_door in this.$store.getters.getListOfRoomDoorTypes"
              v-bind:key="room_door.value"
              :label="room_door.display_name"
              :value="room_door.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <!-- Button -->
        <el-form-item class="actions">
          <el-button @click="dialogRoom.visible = false" size="small">Cancel</el-button>
          <el-button
            type="primary"
            size="small"
            @click="submitRoomData(formChangeRoom)"
          >{{dialogRoom.submitButton}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- Change Dialog for Bed -->
    <el-dialog
      :title="dialogBed.title"
      :visible.sync="dialogBed.visible"
      top="30vh"
      width="500px"
      lock-scroll
      @closed="closeDialog"
    >
      <el-form class="dialogForm" :model="formChangeBed" ref="formChangeBed" label-width="120px">
        <!-- Bed type -->
        <el-form-item label="Bed type" size="small" required>
          <el-select v-model="formChangeBed.bed_type" placeholder="please select Bed type">
            <el-option
              v-for="bed in this.$store.getters.getListOfBedTypes"
              v-bind:key="bed.value"
              :label="bed.display_name"
              :value="bed.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <!-- Bed slot -->
        <el-form-item label="Bed slot" size="small" required>
          <el-select v-model="formChangeBed.slot" placeholder="please select Bed slot">
            <el-option
              v-for="bed in this.$store.getters.getListOfBedSlots"
              :key="bed.value"
              :label="bed.display_name"
              :value="bed.value"
            ></el-option>
          </el-select>
          <!-- <div
            v-if="this.$store.state.error  && this.$store.state.error.slot"
            class="customError"
          >{{this.$store.state.error.slot[0]}}</div>-->
        </el-form-item>

        <!-- Checkboxes -->
        <el-form-item>
          <el-checkbox v-model="formChangeBed.sheets_required" label="Sheets"></el-checkbox>
          <el-checkbox v-model="formChangeBed.is_optional" label="Is optional"></el-checkbox>
        </el-form-item>

        <!-- Button -->
        <el-form-item class="actions">
          <el-button @click="dialogBed.visible = false" size="small">Cancel</el-button>
          <el-button
            type="primary"
            size="small"
            @click="submitBedData('formChangeBed')"
          >{{dialogBed.submitButton}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- Add/Change Dialog -->
    <el-dialog
      :title="dialog.title"
      :visible.sync="dialog.visible"
      top="25vh"
      width="500px"
      lock-scroll
      @closed="closeDialog"
    >
      <el-form class="dialogForm" :model="form" ref="form" label-width="120px">
        <!-- Name -->
        <el-form-item label="Name" size="small" required>
          <el-input v-model="form.name" @change="resetServerError('name')"></el-input>
          <div
            v-if="this.$store.state.error  && this.$store.state.error.name"
            class="customError"
          >{{this.$store.state.error.name[0]}}</div>
        </el-form-item>

        <!-- Keys Number -->
        <el-form-item label="Keys" size="small" required>
          <el-input-number v-model="form.keys_number" controls-position="right" :min="0" :max="100"></el-input-number>
        </el-form-item>

        <!-- Building -->
        <div class="form__addButtonContainer">
          <el-form-item class="form__inputWithButton" label="Building" size="small" required>
            <el-select
              v-model="form.building"
              @change="resetServerError('building')"
              placeholder="please select building"
            >
              <el-option
                style="width: 240px"
                v-for="building in this.$store.state.buildings.buildings"
                v-bind:key="building.id"
                :label="building.name"
                :value="building.id"
              >
                <span style="float: left">{{building.name}}</span>
                <span style="float: right;">
                  <el-button
                    size="mini"
                    icon="el-icon-edit"
                    plain
                    @click="changebuilding(building)"
                  ></el-button>
                  <el-button
                    size="mini"
                    type="danger"
                    icon="el-icon-delete"
                    plain
                    @click.stop="() => deleteBuilding(building)"
                  ></el-button>
                </span>
              </el-option>
            </el-select>
            <div
              v-if="this.$store.state.error && this.$store.state.error.building"
              class="customError"
            >{{this.$store.state.error.building[0]}}</div>
          </el-form-item>

          <el-button
            class="form__addButton"
            type="primary"
            icon="el-icon-plus"
            size="mini"
            plain
            @click="openCreateDialogBuilding"
          ></el-button>
        </div>
        <!-- Status -->
        <el-form-item label="Status" size="small" required>
          <el-select
            v-model="form.status"
            @change="resetServerError('status')"
            placeholder="please select status"
          >
            <el-option
              v-for="status in this.$store.state.statuses.statuses"
              v-bind:key="status.id"
              :label="status.name"
              :value="status.id"
            ></el-option>
          </el-select>
          <div
            v-if="this.$store.state.error && this.$store.state.error.status"
            class="customError"
          >{{this.$store.state.error.status[0]}}</div>
        </el-form-item>

        <!-- Buttons -->
        <el-form-item class="actions">
          <el-button @click="dialog.visible = false" size="small">Cancel</el-button>
          <el-button
            type="primary"
            size="small"
            @click="submitAccommodationData('form')"
          >{{dialog.submitButton}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- Building dialog -->
    <el-dialog
      :title="dialogBuilding.title"
      :visible.sync="dialogBuilding.visible"
      top="10vh"
      width="600px"
      lock-scroll
      append-to-body
      @closed="closeDialog"
    >
      <el-form
        class="dialogForm"
        :model="formBuilding"
        ref="formBuilding"
        label-width="100px"
        size="small"
      >
        <!-- Name -->
        <el-form-item label="Name" size="small" required>
          <el-input
            v-model="formBuilding.name"
            placeholder="please input building name"
            ref="buildingName"
          ></el-input>
          <div
            v-if="this.$store.state.error  && this.$store.state.error.name"
            class="customError"
          >{{this.$store.state.error.name[0]}}</div>
        </el-form-item>

        <!-- Building Types -->
        <el-form-item label="Type" size="small" required>
          <el-select v-model="formBuilding.building_type" placeholder="please select building type">
            <el-option
              v-for="building in listOfBuildingTypes"
              v-bind:key="building.value"
              :label="building.display_name"
              :value="building.value"
            ></el-option>
          </el-select>
          <div
            v-if="this.$store.state.error  && this.$store.state.error.building_type"
            class="customError"
          >{{this.$store.state.error.building_type[0]}}</div>
        </el-form-item>

        <!-- Stars -->
        <el-form-item size="small" label="Stars">
          <el-rate v-model="formBuilding.stars"></el-rate>
          <!-- <div
            v-if="this.$store.state.error  && this.$store.state.error.name"
            class="customError"
          >{{this.$store.state.error.stars[0]}}</div>-->
        </el-form-item>

        <!-- Address -->
        <el-form-item
          style="margin-top: 10px;"
          size="small"
          v-if="dialogBuilding.title === 'Change building'"
          label="Address"
          required
        >
          <el-input readonly v-model="formBuilding.address"></el-input>
        </el-form-item>

        <!-- LocationPicker -->
        <div class="container">
          <l-map ref="map" :zoom="zoom" :center="center" @ready="initMapControls">
            <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
            <l-marker v-if="markerObj.lat || markerObj.lng" :lat-lng="markerObj"></l-marker>
          </l-map>
        </div>

        <!-- Buttons -->
        <el-form-item class="actions">
          <el-button @click="dialogBuilding.visible = false" size="small">Cancel</el-button>
          <el-button
            type="primary"
            size="small"
            @click="submitBuildingData('formBuilding')"
          >{{dialogBuilding.submitButton}}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import AvailabilityDialog from '../components/AvailabilityDialog';
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet';
import L from 'leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/assets/css/leaflet.css';
export default {
  name: 'AccomodationUI',
  components: {
    AvailabilityDialog,
    'l-map': LMap,
    'l-tile-layer': LTileLayer,
    'l-marker': LMarker
  },

  props: {
    deleteBtn: {
      type: Boolean,
      default: true
    },
    addButton: {
      type: Boolean,
      default: true
    },
    addRoomButoon: {
      type: Boolean,
      default: true
    },
    addBedButton: {
      type: Boolean,
      default: true
    },
    deleteRoomButton: {
      type: Boolean,
      default: true
    },
    deleteBedButton: {
      type: Boolean,
      default: true
    },
    deleteAccommodationButton: {
      type: Boolean,
      default: true
    },
    editableNodes: {
      type: Boolean,
      default: true
    },
    multiple: {
      type: Boolean,
      default: true
    },
    expandTree: {
      type: Boolean,
      default: true
    },
    show: {
      type: Boolean,
      default: true
    }
  },

  data() {
    return {
      sizeForm: {
        satatus: '',
        door: '',
        type: '',
        slotSingle: true,
        slotDouble: true,
        desc: ''
      },
      actionButtons: false,
      active: false,
      //isAddBtnEnable: true,
      checkAll: false,
      tmp: null,
      selectedAccommodations: [],
      selectedRooms: [],
      selectedBeds: [],
      currentAccommodation: {},
      currentBuilding: {},
      accommodations: [],

      newAccommodation: {
        name: '',
        keys_number: null,
        building: null,
        status: null,
        event: null
      },

      emptyAccommodation: {
        name: '',
        keys_number: null,
        building: null,
        status: null,
        event: null
      },

      newAvailabilityMas: [],

      newBuilding: {
        name: '',
        building_type: null,
        stars: null,
        address: '',
        latitude: null,
        longitude: null
      },

      newRoom: {
        label: 'Door',
        room_door: 'Y'
      },

      newBed: {
        label: `Bed | single |  false`,
        bed_type: 'BD',
        slot: 'S',
        sheets_required: false,
        is_optional: false,
      },

      emptyBuilding: {
        name: '',
        building_type: null,
        stars: null,
        address: '',
        latitude: null,
        longitude: null
      },

      formChangeRoom: {
        id: null,
        room_door: '',
        accommodation: null
      },

      formChangeBed: {
        id: null,
        bed_type: '',
        slot: '',
        sheets_required: false,
        is_optional: false,
        room: null
      },

      dialog: {
        visible: false,
        title: '',
        submitButton: ''
      },

      dialogRoom: {
        visible: false,
        title: 'Change room',
        submitButton: 'Change'
      },

      dialogBed: {
        visible: false,
        title: 'Change bed',
        submitButton: 'Change'
      },

      dialogAvailability: {
        visible: false,
        title: 'Availability'
      },

      dialogBuilding: {
        visible: false,
        title: '',
        submitButton: ''
      },

      defaultProps: {
        label: 'label',
        children: 'children'
      },

      filterParams: {
        event_id: this.$route.params.event_id,
        name: '',
        status: '',
        door_type: '',
        bed_type: '',
        slot: '',
        sheets_required: '',
        is_optional: ''
      },
      zoom: 3,
      center: { lat: 52.37559917665913, lng: 13.886718750000002 },
      //url: 'https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
      url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png?lang=en',

      //attribution: '&copy; <a href='http://osm.org/copyright'>OSM</a>'
      attribution:
        '<a href='https://foundation.wikimedia.org/wiki/Maps_Terms_of_Use'>Wikimedia maps</a> | Map data &copy; <a href='http://openstreetmap.org/copyright'>OpenStreetMap contributors</a>'
    };
  },

  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },

    dialogGlobalState: function(val) {
      this.dialog.visible = false;
    },

    dialogGlobalState2: function(val) {
      this.dialogRoom.visible = false;
    },

    dialogGlobalState3: function(val) {
      this.dialogBed.visible = false;
    },

    dialogGlobalBuildingState: function(val) {
      this.dialogBuilding.visible = false;
    }
  },

  beforeDestroy() {
    this.clearSelectedItems();
  },
  mounted() {
    L.Icon.Default.imagePath = 'https://unpkg.com/leaflet@1.3.4/dist/images/';
  },
  computed: {
    loading() {
      return this.$store.getters.loading;
    },
    listOfAccommodations() {
      /* if (this.$route.name == 'accommodationui') {
        return this.$store.getters.getListOfAccommodations
      } else {
        return this.$store.getters.getListOfAccommodationsResettlement
      } */
      return this.$store.getters.getListOfAccommodations;
    },

    listOfAvailability() {
      return this.$store.getters.getListOfAvailabilityAccommodation;
    },
    listOfEmptyAvailability() {
      return this.$store.getters.getListOfAvailabilityAccommodationEmpty;
    },
    listOfBuildingTypes() {
      return this.$store.getters.getListOfBuildingTypes;
    },
    markerObj() {
      return {
        lat: this.formBuilding.latitude,
        lng: this.formBuilding.longitude
      };
    },

    isDisabled() {
      if (
        this.$store.state.accommodations.selectedAccommodations.length > 0 ||
        this.$store.state.rooms.selectedRooms.length > 0 ||
        this.$store.state.beds.selectedBeds.length > 0
      ) {
        return false;
      } else {
        return true;
      }
    },

    isDisabledSelectAll() {
      if (
        this.$store.getters.getListOfAccommodations.length == 0 ||
        this.$store.getters.getListOfAccommodationsResettlement.length == 0
      ) {
        return true;
      } else {
        return false;
      }
    },

    form() {
      if (this.dialog.submitButton === 'Change') {
        return this.currentAccommodation;
      } else {
        this.newAccommodation.event = this.$route.params.event_id;
        return this.newAccommodation;
      }
    },

    formBuilding() {
      if (this.dialogBuilding.submitButton === 'Change') {
        return this.currentBuilding;
      } else {
        return this.newBuilding;
      }
    },

    dialogGlobalState() {
      return this.$store.getters.dialogState;
    },
    dialogGlobalState2() {
      return this.$store.getters.dialogRoomState;
    },
    dialogGlobalState3() {
      return this.$store.getters.dialogBedState;
    },
    dialogGlobalBuildingState() {
      return this.$store.getters.dialogBuildingState;
    }
  },
  created() {
    this.reloadAccommodations();
  },

  methods: {
    clearSelectedItems() {
      this.$store.commit('deleteSelectedAccommodation');
      this.$store.commit('deleteSelectedRooms');
      this.$store.commit('deleteSelectedBeds');
      this.selectedAccommodations = [];
      this.selectedRooms = [];
      this.selectedBeds = [];
    },
    reloadAccommodations() {
      this.$store.dispatch('updateAccommodationsList', {
        event_id: this.$route.params.event_id,
        filterParams: this.filterParams
      });
    },
    /* Create-update Accommodation */
    async submitAccommodationData(form) {
      if (this.dialog.submitButton === 'Create') {
        await this.$store.dispatch('createNewAccommodation', this.form);
        this.clearSelectedItems();
        this.reloadAccommodations();
      } else {
        await this.$store.dispatch('updateAccommodation', this.form);
        this.clearSelectedItems();
        this.reloadAccommodations();
      }
    },
    editNodeClick(data, node) {
      if (!this.editableNodes) {
        return;
      } else {
        if (node.level === 1) {
          this.currentAccommodation = {
            id: data.id,
            name: data.name,
            keys_number: data.keys,
            building: data.building.id,
            status: data.status.id,
            event: this.$store.state.currentEvent.id
          };
          this.openUpdateDialogAccommodation();
        } else if (node.level === 2) {
          this.formChangeRoom = {
            id: data.id,
            room_door: data.room_door,
            accommodation: node.parent.data.id
          };
          this.openUpdateDialogRoom();
        } else {
          this.formChangeBed = {
            id: data.id,
            bed_type: data.bed_type,
            slot: data.slot,
            sheets_required: data.sheets_required,
            is_optional: data.is_optional,
            room: node.parent.data.id
          };
          this.openUpdateDialogBed();
        }
      }
    },
    /* Create Room */
    async createNewRoom(data) {
      let payload = Object.assign({accommodation: data.id}, this.newRoom)
      await this.$store.dispatch('createNewRoom', payload);
      this.clearSelectedItems();
      this.reloadAccommodations();
    },
    /* Create Bed */
    async createNewBed(data) {
      let payload = Object.assign({room: data.id}, this.newBed) 
      await this.$store.dispatch('createNewBed', payload);
      this.clearSelectedItems();
      this.reloadAccommodations();
    },
    /* Update Room */
    async submitRoomData(formChangeRoom) {
      await this.$store.dispatch('updateRoom', formChangeRoom);
      this.clearSelectedItems();
      this.reloadAccommodations();
    },
    /* Update Bed */
    async submitBedData(formChangeBed) {
      await this.$store.dispatch('updateBed', this.formChangeBed);
      this.clearSelectedItems();
      this.reloadAccommodations();
    },
    /* Create-update Building */
    async submitBuildingData(formBuilding) {
      if (this.dialogBuilding.submitButton === 'Create') {
        if (this.formBuilding.stars == 0) {
          this.formBuilding.stars = null;
        }
        await this.$store.dispatch('createNewBuilding', this.formBuilding);
        this.$store.dispatch('updateBuildingsList');
      } else {
        await this.$store.dispatch('updateBuilding', this.formBuilding);
        this.$store.dispatch('updateBuildingsList');
      }
    },

    handleCheckAllChange(val) {
      if (this.checkAll) {
        this.accommodations = this.$store.getters.getListOfAccommodations;
        // this.$route.name == 'accommodationui'
        //   ? this.$store.getters.getListOfAccommodations
        //   : this.$store.getters.getListOfAccommodationsResettlement
        this.$refs.tree.setCheckedNodes(this.accommodations);
      } else {
        this.$refs.tree.setCheckedNodes([]);
      }
    },
    /* Select */
    handleSelectionChange(selectedData, checked) {
      if (selectedData.type == 'accommodation') {
        if (checked) {
          this.selectedAccommodations.push(selectedData);
        } else {
          this.selectedAccommodations.splice(
            this.selectedAccommodations.findIndex(v => v === selectedData),
            1
          );
        }
        if (
          (this.selectedAccommodations.length != 0 &&
            this.selectedAccommodations.length ===
              this.$store.getters.getListOfAccommodations.length) ||
          this.selectedAccommodations.length ===
            this.$store.getters.getListOfAccommodationsResettlement.length
        ) {
          this.checkAll = true;
        } else {
          this.checkAll = false;
        }
        this.$store.commit(
          'addSelectedAccommodations',
          this.selectedAccommodations
        );
      } else if (selectedData.type == 'room') {
        if (checked) {
          this.selectedRooms.push(selectedData);
        } else {
          this.selectedRooms.splice(
            this.selectedRooms.findIndex(v => v === selectedData),
            1
          );
        }
        this.$store.commit('addSelectedRooms', this.selectedRooms);
      } else {
        if (checked) {
          this.selectedBeds.push(selectedData);
        } else {
          this.selectedBeds.splice(
            this.selectedBeds.findIndex(v => v === selectedData),
            1
          );
        }
        this.$store.commit('addSelectedBeds', this.selectedBeds);
      }
    },
    /* Delete */
    async deleteSelectedAccommodations() {
      await Promise.all(
        this.$store.state.beds.selectedBeds.map(item =>
          this.$store.dispatch('deleteBed', item)
        )
      );
      this.reloadAccommodations()
        .then(() => this.$store.commit('deleteSelectedBeds'))
        .then(() => (this.selectedBeds = []))
        .then(() => {
          this.active = false;
        });
      await Promise.all(
        this.$store.state.rooms.selectedRooms.map(item =>
          this.$store.dispatch('deleteRoom', item)
        )
      );
      this.reloadAccommodations()
        .then(() => this.$store.commit('deleteSelectedRooms'))
        .then(() => (this.selectedRooms = []))
        .then(() => {
          this.active = false;
        });
      await Promise.all(
        this.$store.state.accommodations.selectedAccommodations.map(item =>
          this.$store.dispatch('deleteAccommodation', item)
        )
      );
      this.reloadAccommodations()
        .then(() => this.$store.commit('deleteSelectedAccommodation'))
        .then(() => (this.selectedAccommodations = []))
        .then(
          () =>
            (this.checkAll =
              this.selectedAccommodations.length == 0 ? false : true)
        )
        .then(() => {
          this.active = false;
        });
    },

    openDialog(attr) {
      this.dialog.visible = true;
      this.dialog.title = attr.title;
      this.dialog.submitButton = attr.submitButton;
    },

    openDialogBuilding(attr) {
      this.dialogBuilding.visible = true;
      this.dialogBuilding.title = attr.title;
      this.dialogBuilding.submitButton = attr.submitButton;
    },

    openCreateDialog() {
      const attr = {
        title: 'Create accommodation',
        submitButton: 'Create'
      };
      this.newAccommodation = Object.assign({}, this.emptyAccommodation);
      this.openDialog(attr);
    },

    openCreateDialogBuilding() {
      const attr = {
        title: 'Create building',
        submitButton: 'Create'
      };
      this.newBuilding = Object.assign({}, this.emptyBuilding);
      this.openDialogBuilding(attr);
    },

    changebuilding(data) {
      this.currentBuilding = {
        id: data.id,
        name: data.name,
        building_type: data.building_type,
        stars: data.stars,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude
      };
      this.openUpdateDialogBuilding();
    },

    openUpdateDialogBuilding() {
      const attr = {
        title: 'Change building',
        submitButton: 'Change'
      };
      this.openDialogBuilding(attr);
    },

    async deleteBuilding(data) {
      await this.$store.dispatch('deleteBuilding', data.id);
      this.$store.dispatch('updateBuildingsList');
      this.reloadAccommodations();
    },

    openCreateAvailabilityDialog(data) {
      this.$store.dispatch(
        'updateEmptyAvailabilityListForAccommodation',
        data.id
      );
      this.$store.dispatch('updateAvailabilityListForAccommodation', data.id);
      this.tmp = data.id;
      this.newAvailability = Object.assign({}, this.emptyAvailability);
      this.dialogAvailability.visible = true;
    },

    openUpdateDialogAccommodation() {
      const attr = {
        title: 'Change accommodation',
        submitButton: 'Change'
      };
      this.openDialog(attr);
    },

    openUpdateDialogRoom() {
      this.dialogRoom.visible = true;
      //this.dialog.title = attr.title;
      //this.dialog.submitButton = attr.submitButton;
    },

    openUpdateDialogBed() {
      this.dialogBed.visible = true;
    },

    openBuildingDialog() {
      this.dialogBuilding.visible = true;
      /* this.$nextTick(() => {
        this.$refs.roleName.focus();
      }); */
    },

    closeDialog() {
      this.$store.commit('clearError');
      this.newAvailabilityMas = [];
      this.$refs.form.resetFields();
    },

    resetServerError(field) {
      if (this.$store.state.error) {
        this.$store.state.error[field] = '';
      }
    },

    newAvailabilityCreate(payload) {
      let sth = {
        accommodation: this.tmp,
        night: payload.night,
        price: payload.value
        //is_booked: false
      };
      this.newAvailabilityMas.map(item => {
        if (item.night === sth.night) {
          item.price = sth.price;
          this.newAvailabilityMas.splice(
            this.newAvailabilityMas.findIndex(v => v.night === sth.night),
            1
          );
        }
      });
      this.newAvailabilityMas.push(sth);
      if (sth.price === '') {
        this.newAvailabilityMas.pop(sth);
      }
      /* this.newAvailability.accommodation = this.tmp
      this.newAvailability.night = payload.night
      if (payload.paramName === 'price') {
        this.newAvailability.price = payload.value
      } */

      /* else if (payload.paramName === 'is_booked') {
        this.newAvailability.is_booked = payload.value
      } */
    },

    async addNewAvailability() {
      await Promise.all(
        this.newAvailabilityMas.map(item =>
          this.$store.dispatch('createNewAvailability', item)
        )
      );
      //.then(() => (this.dialogAvailability.visible = false))
      this.$store.dispatch('updateAvailabilityListForAccommodation', this.tmp);
      this.$store
        .dispatch('updateEmptyAvailabilityListForAccommodation', this.tmp)
        .then(() => (this.newAvailabilityMas = []));
      this.reloadAccommodations();
    },

    changeAvailability(payload) {
      let data;
      if (payload.paramName === 'price') {
        data = {
          id: payload.id,
          price: payload.value
        };
      } else {
        data = {
          id: payload.id
          //is_booked: payload.value
        };
      }
      this.$store.dispatch('partialUpdateAvailability', data);
    },

    async deleteAvailability(item) {
      await this.$store.dispatch('deleteAvailability', item.id);
      this.$store.dispatch('updateAvailabilityListForAccommodation', this.tmp);
      this.$store.dispatch(
        'updateEmptyAvailabilityListForAccommodation',
        this.tmp
      );
      this.reloadAccommodations();
    },

    initMapControls() {
      const provider = new OpenStreetMapProvider();

      const searchControl = new GeoSearchControl({
        provider: provider,
        style: 'bar',
        autoClose: true,
        keepResult: true
      });
      this.$refs.map.mapObject.addControl(searchControl);

      this.$refs.map.mapObject.on('geosearch/showlocation', result => {
        //console.log(result.location.y, Number(result.location.x).toFixed(8)); // location + marker
        //this.formBuilding.address = `${result.location.raw.address.hotel},  ${result.location.raw.address.suburb},  ${result.location.raw.address.road},  ${result.location.raw.address.house_number} `
        this.formBuilding.latitude = Number(result.location.y).toFixed(8);
        this.formBuilding.longitude = Number(result.location.x).toFixed(8);
        this.formBuilding.address = result.location.label
          .split(',')
          .filter(function(addr) {
            var non_latin = /[\u0250-\ue007f]/g;
            return !non_latin.test(addr);
          })
          .join(',')
          .substring(0, this.max_address_length);
      });
    },

    filter() {
      this.reloadAccommodations();
      this.clearSelectedItems();
      this.checkAll = this.selectedAccommodations.length == 0 ? false : true;
    },
    resetFilterForm() {
      this.filterParams.name = '';
      this.filterParams.status = '';
      this.filterParams.door_type = '';
      this.filterParams.bed_type = '';
      this.filterParams.slot = '';
      this.filterParams.sheets_required = '';
      this.filterParams.is_optional = '';
      this.filter();
    },

    checkOccurrencePlan() {
      this.$store.dispatch('checkAccommodationsPlan');
    }
  }
};
</script>

<style lang='scss' scoped>
@import "~element-ui/packages/theme-chalk/src/tree.scss";
@import url("//unpkg.com/element-ui@2.4.4/lib/theme-chalk/index.css");

.page-wrapper {
  padding: 5px 15px 40px 15px;
}

.tree {
  &__header {
    align-items: center;
    display: flex;
    margin: 0 0 8px 6px;
  }
  &__container {
    width: 490px;
  }
}
.el-header {
  color: #fafafa;
}

/* .filters {
  background-color: #f5f7fa;
  height: 80vh;
  margin: 0 20px 0 0;
  max-width: 250px;
  padding: 10px;
} */

.asside-form {
  text-align: center;
  justify-content: space-between;
  &__item {
    margin-bottom: 40px;
    text-align: left;
  }
}

.custom-tree {
  width: 100%;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  width: 200px;
  justify-content: space-between;
  font-size: 15px;
  margin-right: 8px;
  cursor: default;
}

.custom-tree /deep/ .el-tree-node__content > .el-checkbox {
  margin-top: 8px;
  margin-right: 8px;
  margin-right: 10px;
  border-width: 1px;
}

.custom-tree /deep/ .el-checkbox__input > .el-checkbox__inner {
  border: 1px solid #606662;
}

.checkbox /deep/ .el-checkbox__input > .el-checkbox__inner {
  border: 1px solid #606662;
}

.el-header > .el-checkbox {
  margin-right: 10px;
}

// .addButton {
//   bottom: 7vh;
//   position: fixed;
//   right: 5vw;
//   width: 50px;
//   height: 50px;
//   z-index: 99;
// }

.line {
  text-align: center;
}

.new-availability {
  display: flex;
  margin-bottom: 30px;
}

.availability-list {
  margin-bottom: 10px;
}

.actions {
  text-align: right;
}

.acc-row {
  //margin: 10px;
  display: block;
  width: 250px;

  //height: 100px;
}

.acc-row1 {
  display: block;
  width: 250px;
}

.dialogForm {
  margin-right: 10px;
}

.checkbox {
  margin: 0 15px 0 18px;
}

div.container {
  height: 100%;
  width: 100%;
  padding: 15px;
}
.vue2leaflet-map {
  height: 400px !important;
  width: 530px !important;
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}
.leaflet-control-geosearch form {
  max-width: 350px !important;
}
.el-form-item:nth-child(3) {
  margin-bottom: 0px;
}
</style>
