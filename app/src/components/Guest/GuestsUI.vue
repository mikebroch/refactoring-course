<template>
  <div class="page-wrapper">
    <el-container>
      <!-- Table container -->
      <el-container>
        <div class="table__container">
          <div class="table__header table__header_pagination-only">
            <div>
              <!-- add button -->
              <el-button
                class="table__addButton"
                v-if="addButton"
                type="primary"
                size="mini"
                plain
                >Add</el-button
              >

              <!-- Delete button -->
              <!-- <el-popover v-if="deleteBtn" placement="top" width="260" v-model="active">
                <p>
                  Are you sure you want to delete the
                  <br />
                  {{ this.$store.state.guestsui.selectedGuests.length }} selected items?
                </p>
                <div style="text-align: right;">
                  <el-button size="mini" type="text" @click="active = false">Cancel</el-button>
                  <el-button type="danger" size="mini" @click="deleteSelectedGuests">Confirm</el-button>
                </div>
                <el-button
                  :disabled="isDisabled"
                  type="danger"
                  size="mini"
                  plain
                  slot="reference"
                >Delete</el-button>
              </el-popover> -->
            </div>

            <!-- Pagination -->
            <!-- <div class="table__pagination" v-if="pagination">
              <el-pagination
                class="pagination"
                :total="this.$store.state.guestsui.count"
                :page-sizes="page_sizes"
                :current-page="pageSettings.page"
                layout="sizes,prev, pager, next"
                background
                small
                @size-change="limitChanged"
                @current-change="changeCurrentPage"
              ></el-pagination>
            </div> -->
          </div>

          <!-- Table -->
          <el-table
            class="table__guest"
            ref="multipleTable"
            empty-text="There are no guests for this event"
            border
            :data="results"
          >
            <!-- Check boxes -->
            <el-table-column
              type="selection"
              width="55"
              header-align="center"
              align="center"
            ></el-table-column>

            <!-- Name -->
            <el-table-column
              label="Name"
              width="320"
              show-overflow-tooltip
              header-align="center"
              prop="guest__name"
              sortable="custom"
            >
              <template slot-scope="scope">
                <div class="cellContainer">
                  <!-- gender icon and name -->
                  <div>
                    <i
                      class="fas fa-male"
                      style="font-size: 16px; margin-right:8px;"
                      v-if="scope.row.guest.gender === 'M'"
                    ></i>
                    <i
                      class="fas fa-female"
                      style="font-size: 16px; margin-right:8px;"
                      v-if="scope.row.guest.gender === 'F'"
                    ></i>
                    {{ scope.row.guest.name }}
                  </div>

                  <!-- action buttons -->
                  <div v-if="currentRowId == scope.row.id">
                    <el-link :href="`mailto:${scope.row.guest.email}`">
                      <el-button
                        icon="el-icon-message"
                        size="mini"
                        plain
                        @click.stop="guestEmail(scope.row)"
                      ></el-button>
                    </el-link>

                    <!-- <el-button
                    icon="el-icon-phone-outline"
                    size="mini"
                    plain
                    @click.stop="guestCall(scope.row)"
                    ></el-button>-->
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- Gender -->
            <!-- <el-table-column
          label="Gender"
          width="80"
          header-align="center"
          align="center"
          prop="guest__email"
          sortable="custom"
        >
          <template slot-scope="scope">{{ scope.row.guest.gender }}</template>
            </el-table-column>-->

            <!-- Check-In -->
            <el-table-column
              label="Check-In"
              header-align="center"
              align="center"
              prop="check_in_date"
              sortable="custom"
            >
              <template slot-scope="scope">{{
                scope.row.check_in_date
              }}</template>
            </el-table-column>

            <!-- Check-Out -->
            <el-table-column
              label="Check-Out"
              header-align="center"
              align="center"
              prop="check_out_date"
              sortable="custom"
            >
              <template slot-scope="scope">{{
                scope.row.check_out_date
              }}</template>
            </el-table-column>

            <!-- Role -->
            <el-table-column
              label="Role"
              header-align="center"
              align="center"
              prop="role"
              sortable="custom"
            >
              <template slot-scope="scope">{{
                scope.row.role | role
              }}</template>
            </el-table-column>

            <!-- Status -->
            <el-table-column
              label="Status"
              header-align="center"
              align="center"
              prop="status"
              sortable="custom"
            >
              <template slot-scope="scope">{{
                scope.row.status | status
              }}</template>
            </el-table-column>

            <!-- Phone -->
            <!-- <el-table-column
          label="Phone"
          v-if="hideColumn"
          header-align="center"
          align="center"
          show-overflow-tooltip
        >
          <template class="box-card" slot-scope="scope">{{ scope.row.guest.phone }}</template>
            </el-table-column>-->

            <!-- Email -->
            <!-- <el-table-column
          label="Email"
          v-if="hideColumn"
          header-align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">{{ scope.row.guest.email }}</template>
            </el-table-column>-->

            <!-- Distance -->
            <el-table-column
              label="Distance"
              header-align="center"
              align="center"
              prop="distance_to_event"
              sortable="custom"
            >
              <template slot-scope="scope">{{
                scope.row.distance_to_event | distance
              }}</template>
            </el-table-column>

            <!-- Max payment -->
            <el-table-column
              label="Max Payment"
              header-align="center"
              align="center"
              prop="max_payment"
              sortable="custom"
            >
              <template slot-scope="scope">{{
                scope.row.max_payment | currencies
              }}</template>
            </el-table-column>

            <!-- Share -->
            <el-table-column
              width="160"
              label="Share"
              header-align="center"
              align="center"
            >
              <template slot-scope="scope">
                <el-tooltip
                  v-if="
                    !scope.row.ready_to_share_room &&
                      !scope.row.ready_to_share_accommodation
                  "
                  effect="dark"
                  placement="top"
                  content="Not ready to share"
                >
                  <span>NO</span>
                </el-tooltip>
                <el-tooltip
                  effect="dark"
                  placement="top"
                  content="Ready to share accommodation and room"
                  v-else-if="
                    scope.row.ready_to_share_room &&
                      scope.row.ready_to_share_accommodation
                  "
                >
                  <span>A/R</span>
                </el-tooltip>
                <el-tooltip
                  effect="dark"
                  placement="top"
                  content="Ready to share accommodation"
                  v-else-if="scope.row.ready_to_share_accommodation"
                >
                  <span>A</span>
                </el-tooltip>
                <el-tooltip
                  effect="dark"
                  placement="top"
                  content="Ready to share room"
                  v-else
                >
                  <span>R</span>
                </el-tooltip>
              </template>
              <!-- Share accommodation -->
              <!-- <el-table-column
                label="Accommodation"
                width="160"
                header-align="center"
                align="center"
                prop="ready_to_share_accommodation"
                sortable="custom"
              >
                <template slot-scope="scope">
                  <i
                    v-if="scope.row.ready_to_share_accommodation"
                    class="el-icon-circle-check text-success"
                  ></i>
                  <i v-else class="el-icon-circle-close text-warning"></i>
                </template>
              </el-table-column>-->

              <!-- Share room -->
              <!-- <el-table-column
                label="Room"
                width="160"
                header-align="center"
                align="center"
                prop="ready_to_share_room"
                sortable="custom"
              >
                <template slot-scope="scope">
                  <i v-if="scope.row.ready_to_share_room" class="el-icon-circle-check text-success"></i>
                  <i v-else class="el-icon-circle-close text-warning"></i>
                </template>
              </el-table-column>-->
            </el-table-column>

            <!-- Plus one -->
            <el-table-column
              label="Plus One"
              width="110"
              header-align="center"
              align="center"
              prop="plus_one"
              sortable="custom"
            >
              <template slot-scope="scope">
                <i
                  v-if="scope.row.plus_one"
                  class="el-icon-circle-check text-success"
                ></i>
                <i v-else class="el-icon-circle-close text-warning"></i>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "GuestUI",
  components: {},

  data() {
    return {
      active: false,
      activeName: "first",
      allGuestsList: [],
      transferCompanions: ["All guests", "Companions"],
      transferCannotLiveWith: ["All guests", "Can not live with"],

      // can not live with
      defaultCannot: [],
      newDefaultCannot: [],
      currentCannot: [],
      newCannot: [],
      deleteCannot: [],

      // companions
      companions: {
        default: [],
        reference: [],
        alreadyExist: [],
        new: [],
        current: [],
        forCreation: [],
        forDeleting: []
      },

      num: 1,

      selectedGuests: [],
      allGuests: false,

      guestModal: false,
      preferenceModal: false,

      editedGuest: null,
      editedPreference: null,

      originalData: null,

      distance_to_event: [
        { value: 2, label: "less than 2km" },
        { value: 10, label: "2-10km" },
        { value: 99999, label: "more than 10km" }
      ],

      emptyGuest: {
        check_in_date: null,
        check_in_time: null,
        check_out_date: null,
        check_out_time: null,
        companions: [],
        distance_to_event: null,
        event: null,
        guest: {
          email: "",
          gender: "",
          id: null,
          name: "",
          phone: ""
        },
        id: null,
        max_payment: null,
        plus_one: false,
        ready_to_share_accommodation: true,
        ready_to_share_room: true,
        role: null,
        same_gender_sharing: true,
        status: null
      },
      newGuest: {
        cannot_live_with: [],
        check_in_date: null,
        check_in_time: null,
        check_out_date: null,
        check_out_time: null,
        companions: [],
        companions: null,
        distance_to_event: null,
        event: null,
        guest: {
          email: "",
          gender: "",
          id: null,
          name: "",
          phone: ""
        },
        id: null,
        max_payment: null,
        plus_one: false,
        ready_to_share_accommodation: false,
        ready_to_share_room: false,
        role: null,
        same_gender_sharing: false,
        status: null
      },
      currentGuest: {},

      dialog: {
        visible: false,
        title: "",
        submitButton: ""
      },

      roleDialog: {
        visible: false
      },
      roleForm: {
        name: ""
      },

      daterange: "",
      filterDaterange: "",

      rules: {
        name: [
          {
            required: true,
            message: "name is required",
            trigger: "blur"
          }
        ],

        check_in_date: [
          {
            required: true,
            message: "field is required",
            trigger: "blur"
          }
        ],

        check_out_date: [
          {
            required: true,
            message: "field is required",
            trigger: "blur"
          }
        ],

        role: [
          {
            required: true,
            message: "field is required",
            trigger: "blur"
          }
        ],

        status: [
          {
            required: true,
            message: "field is required",
            trigger: "blur"
          }
        ],
        max_payment: [
          {
            required: true,
            message: "field is required",
            trigger: "blur"
          }
        ]
      },

      filters: {
        role: ""
      },

      pageSettings: {
        page: 1,
        page_size: 10,
        ordering: "-guest__id",
        name: "",
        gender: "",
        check_in_date: "",
        check_out_date: "",
        role__in: [],
        status__in: []
        //get_all: false
      },
      page_sizes: [10, 25, 50, 100, 1000],

      currentRowId: "",

      error: "",
      results: [
        {
          id: 109,
          guest: {
            id: 110,
            email: "mrthree@mail.ru",
            phone: "",
            gender: "M",
            name: "Mr.Three"
          },
          distance_to_event: 99999.0,
          ready_to_share_room: true,
          ready_to_share_accommodation: true,
          same_gender_sharing: true,
          check_in_date: "2019-09-11",
          check_out_date: "2019-09-20",
          check_in_time: null,
          check_out_time: null,
          max_payment: null,
          plus_one: false,
          role: 1,
          status: 1,
          event: 5,
          companions: null,
          cannot_live_with: []
        },
        {
          id: 110,
          guest: {
            id: 111,
            email: "mrfour@mail.ru",
            phone: "",
            gender: "M",
            name: "Mr.Four"
          },
          distance_to_event: 2.0,
          ready_to_share_room: true,
          ready_to_share_accommodation: true,
          same_gender_sharing: true,
          check_in_date: "2019-09-11",
          check_out_date: "2019-09-20",
          check_in_time: null,
          check_out_time: null,
          max_payment: 3300.0,
          plus_one: false,
          role: 1,
          status: 3,
          event: 5,
          companions: null,
          cannot_live_with: []
        },
        {
          id: 111,
          guest: {
            id: 112,
            email: "mrsfive@gmail.com",
            phone: "",
            gender: "F",
            name: "Mrs.Five"
          },
          distance_to_event: 10.0,
          ready_to_share_room: true,
          ready_to_share_accommodation: true,
          same_gender_sharing: true,
          check_in_date: "2019-09-11",
          check_out_date: "2019-09-20",
          check_in_time: null,
          check_out_time: null,
          max_payment: 7800.0,
          plus_one: false,
          role: 1,
          status: 2,
          event: 5,
          companions: null,
          cannot_live_with: []
        },
        {
          id: 112,
          guest: {
            id: 113,
            email: "mrssix@mail.ru",
            phone: "",
            gender: "F",
            name: "Mrs.Six"
          },
          distance_to_event: 10.0,
          ready_to_share_room: true,
          ready_to_share_accommodation: true,
          same_gender_sharing: true,
          check_in_date: "2019-09-11",
          check_out_date: "2019-09-18",
          check_in_time: null,
          check_out_time: null,
          max_payment: 5600.0,
          plus_one: false,
          role: 1,
          status: 2,
          event: 5,
          companions: null,
          cannot_live_with: []
        },
        {
          id: 113,
          guest: {
            id: 114,
            email: "mrsevem@gmail.com",
            phone: "",
            gender: "M",
            name: "Mr.Seven"
          },
          distance_to_event: 10.0,
          ready_to_share_room: true,
          ready_to_share_accommodation: true,
          same_gender_sharing: true,
          check_in_date: "2019-09-11",
          check_out_date: "2019-09-18",
          check_in_time: null,
          check_out_time: null,
          max_payment: 1233.0,
          plus_one: false,
          role: 1,
          status: 2,
          event: 5,
          companions: null,
          cannot_live_with: []
        },
        {
          id: 114,
          guest: {
            id: 115,
            email: "mreight@mail.ru",
            phone: "",
            gender: "M",
            name: "Mr.Eight"
          },
          distance_to_event: 2.0,
          ready_to_share_room: false,
          ready_to_share_accommodation: true,
          same_gender_sharing: true,
          check_in_date: "2019-09-11",
          check_out_date: "2019-09-18",
          check_in_time: null,
          check_out_time: null,
          max_payment: 1000.0,
          plus_one: false,
          role: 1,
          status: 2,
          event: 5,
          companions: null,
          cannot_live_with: []
        },
        {
          id: 116,
          guest: {
            id: 117,
            email: "sdfsdfds@mail.ru",
            phone: "",
            gender: "M",
            name: "Mr.Nine"
          },
          distance_to_event: 2.0,
          ready_to_share_room: true,
          ready_to_share_accommodation: true,
          same_gender_sharing: true,
          check_in_date: "2019-09-11",
          check_out_date: "2019-09-18",
          check_in_time: null,
          check_out_time: null,
          max_payment: 4555.0,
          plus_one: false,
          role: 1,
          status: 1,
          event: 5,
          companions: null,
          cannot_live_with: []
        },
        {
          id: 117,
          guest: {
            id: 118,
            email: "mrstaem@mail.ru",
            phone: "",
            gender: "F",
            name: "Mrs.Ten"
          },
          distance_to_event: 2.0,
          ready_to_share_room: true,
          ready_to_share_accommodation: true,
          same_gender_sharing: true,
          check_in_date: "2019-09-11",
          check_out_date: "2019-09-18",
          check_in_time: null,
          check_out_time: null,
          max_payment: 4565.0,
          plus_one: false,
          role: 1,
          status: 2,
          event: 5,
          companions: null,
          cannot_live_with: []
        },
        {
          id: 121,
          guest: {
            id: 122,
            email: "mr.one@mail.ru",
            phone: "",
            gender: "M",
            name: "Mr.One"
          },
          distance_to_event: 99999.0,
          ready_to_share_room: true,
          ready_to_share_accommodation: true,
          same_gender_sharing: true,
          check_in_date: "2019-09-11",
          check_out_date: "2019-09-18",
          check_in_time: null,
          check_out_time: null,
          max_payment: 5000.0,
          plus_one: false,
          role: 1,
          status: 2,
          event: 5,
          companions: null,
          cannot_live_with: []
        }
      ]
    };
  },
  created() {
    this.$store.dispatch("updateGuestsListui", {
      event_id: 5,
      pageSettings: this.pageSettings
    });
  },
  computed: {
    // Read
    listOfGuests() {
      return this.$store.getters.getListOfGuestsui;
    },

    // Read Current Guest

    isDisabled() {
      if (this.$store.state.guestsui.selectedGuests.length > 0) {
        return false;
      } else {
        return true;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.page-wrapper {
  padding: 5px 15px 40px 15px;
}
// .tabBadge {
//   margin-top: 10px;
//   margin-right: 40px;
// }
// .TabButton {
//   opacity: 0;
// }

.guestsTabs {
  height: 710px;
}

.tab-container {
  // text-align: center;
  margin-left: 32px;
}

// .table-header {
//   align-items: center;
//   display: flex;
//   justify-content: space-between;
// }

// .addButton {
//   bottom: 7vh;
//   position: fixed;
//   right: 5vw;
//   width: 50px;
//   height: 50px;
//   z-index: 99;
// }

.table__guest /deep/ .el-checkbox__input > .el-checkbox__inner {
  border: 1px solid #606662;
}

.line {
  text-align: center;
}

.actions {
  text-align: right;
}

.customError {
  color: rgb(245, 108, 108);
  font-size: 12px;
  line-height: 1;
  padding-top: 0px;
  margin-top: -2px;
  position: absolute;
  top: 100%;
  left: 0px;
}

.dialogForm {
  margin-right: 20px;
}

.cellContainer {
  display: flex;
  justify-content: space-between;
}

.custom-margin {
  margin-left: 0px !important;
}
</style>
