<template>
  <div class="page-wrapper">
    <el-container>
      <!-- Filters -->
      <el-aside class="filters" v-if="showFilters">
        <el-form
          ref="filterForm"
          label-width="120px"
          label-position="top"
          size="mini"
          class="asside-form"
        >
          <!-- guest filter -->
          <el-form-item label="Name" class="filter__label">
            <el-col :span="22">
              <el-input
                placeholder="input name"
                ref="guestsName"
                v-model="pageSettings.name"
                @input.native="filter"
              >
                <i slot="prefix" class="el-input__icon el-icon-search"></i>
              </el-input>
            </el-col>
          </el-form-item>

          <!-- gender filter-->
          <el-form-item label="Gender">
            <el-col :span="22">
              <el-checkbox-group v-model="pageSettings.gender">
                <el-checkbox true-label="M" :false-label="''" border @change="filter">Male</el-checkbox>
                <el-checkbox true-label="F" :false-label="''" border @change="filter">Female</el-checkbox>
              </el-checkbox-group>
            </el-col>
          </el-form-item>

          <!-- dates filter -->
          <el-form-item label="Dates">
            <el-date-picker
              v-model="filterDaterange"
              value-format="yyyy-MM-dd"
              type="daterange"
              range-separator="-"
              start-placeholder="check-In"
              end-placeholder="check-Out"
              style="width: 90%;"
              :editable="false"
              :default-value="this.$store.state.currentEvent.date_start"
              :picker-options="datePickerOptions"
              clearable
              @change="prepareDates"
            ></el-date-picker>
          </el-form-item>

          <!-- role filter -->
          <el-form-item label="Role" class="asside-form__item">
            <el-select
              placeholder="select role"
              v-model="pageSettings.role__in"
              style="width: 90%;"
              multiple
              clearable
              @change="filter"
            >
              <el-option
                v-for="role in this.$store.state.roles.roles"
                v-bind:key="role.id"
                :label="role.name"
                :value="role.id"
              ></el-option>
            </el-select>
          </el-form-item>

          <!-- status filter -->
          <el-form-item label="Status" class="asside-form__item">
            <el-select
              placeholder="select status"
              v-model="pageSettings.status__in"
              style="width: 90%;"
              multiple
              clearable
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

          <!-- reset button -->
          <div class="filterButtons">
            <el-button type="danger" size="mini" plain @click="resetFilterForm">Reset</el-button>
          </div>
        </el-form>
      </el-aside>

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
                @click="openCreateDialog"
              >Add</el-button>

              <!-- Delete button -->
              <el-popover v-if="deleteBtn" placement="top" width="260" v-model="active">
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
              </el-popover>

              <!-- <el-select size="mini" v-model="value" placeholder="Select">
                <el-option v-for="item in page_sizes" :key="item" :label="item" :value="item"></el-option>
              </el-select>-->
            </div>

            <!-- Pagination -->
            <div class="table__pagination" v-if="pagination">
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
            </div>
          </div>

          <!-- Table -->
          <el-table
            class="table__guest"
            ref="multipleTable"
            v-loading="loading"
            empty-text="There are no guests for this event"
            border
            :data="listOfGuests"
            :select-on-indeterminate="false"
            @selection-change="handleSelectionChange"
            @sort-change="sortGuest"
            @cell-click="cellClickHandler"
            @cell-mouse-enter="cellEnterHandler"
            @cell-mouse-leave="cellLeaveHandler"
          >
            <!-- Check boxes -->
            <el-table-column type="selection" width="55" header-align="center" align="center"></el-table-column>

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
                        @click.stop=" guestEmail(scope.row)"
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
              <template slot-scope="scope">{{ scope.row.check_in_date }}</template>
            </el-table-column>

            <!-- Check-Out -->
            <el-table-column
              label="Check-Out"
              header-align="center"
              align="center"
              prop="check_out_date"
              sortable="custom"
            >
              <template slot-scope="scope">{{ scope.row.check_out_date }}</template>
            </el-table-column>

            <!-- Role -->
            <el-table-column
              label="Role"
              header-align="center"
              align="center"
              prop="role"
              sortable="custom"
            >
              <template slot-scope="scope">{{ scope.row.role | role}}</template>
            </el-table-column>

            <!-- Status -->
            <el-table-column
              label="Status"
              header-align="center"
              align="center"
              prop="status"
              sortable="custom"
            >
              <template slot-scope="scope">{{ scope.row.status | status}}</template>
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
              <template slot-scope="scope">{{ scope.row.distance_to_event |distance }}</template>
            </el-table-column>

            <!-- Max payment -->
            <el-table-column
              label="Max Payment"
              header-align="center"
              align="center"
              prop="max_payment"
              sortable="custom"
            >
              <template slot-scope="scope">{{ scope.row.max_payment |currencies }}</template>
            </el-table-column>

            <!-- Share -->
            <el-table-column width="160" label="Share" header-align="center" align="center">
              <template slot-scope="scope">
                <el-tooltip
                  v-if="!scope.row.ready_to_share_room && !scope.row.ready_to_share_accommodation"
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
                  v-else-if="scope.row.ready_to_share_room && scope.row.ready_to_share_accommodation "
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
                <el-tooltip effect="dark" placement="top" content="Ready to share room" v-else>
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
                <i v-if=" scope.row.plus_one" class="el-icon-circle-check text-success"></i>
                <i v-else class="el-icon-circle-close text-warning"></i>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-container>
    </el-container>

    <!-- Add button -->
    <!-- <el-tooltip class="item" effect="dark" content="add new guest" placement="left">
      <el-button
        v-if="addButton"
        class="addButton"
        type="primary"
        icon="el-icon-plus"
        circle
        @click="openCreateDialog"
      ></el-button>
    </el-tooltip>-->

    <!-- Add/Change Dialog -->
    <el-dialog
      :title="dialog.title"
      :visible.sync="dialog.visible"
      top="8vh"
      width="600px"
      hight="600px"
      lock-scroll
      @closed="closeDialog"
    >
      <!-- Role dialog -->
      <!-- <el-dialog
        title="Add new role"
        :visible.sync="roleDialog.visible"
        top="30vh"
        width="25%"
        lock-scroll
        append-to-body
        @closed="closeRoleDialog"
      >
        <el-form
          class="dialogForm"
          :model="roleForm"
          ref="roleForm"
          label-width="120px"
          size="small"
      >-->
      <!-- Role form -->
      <!-- <el-form-item class="form__inputWithButton" label="Role" required>
            <el-input
              v-model="roleForm.name"
              placeholder="please input role"
              ref="roleName"
              @change="resetServerError('role')"
            ></el-input>
            <div
              v-if="this.$store.state.error && this.$store.state.error.role"
              class="customError"
            >{{this.$store.state.error.role[0]}}</div>
      </el-form-item>-->

      <!-- Buttons -->
      <!-- <el-form-item class="actions">
            <el-button @click="roleDialog.visible = false" size="small">Cancel</el-button>
            <el-button type="primary" size="small" @click="submitRoleData('roleForm')">Add</el-button>
          </el-form-item>
        </el-form>
      </el-dialog>-->

      <el-tabs ref="tabs" v-model="activeName" class="guestsTabs" :before-leave="changeTab">
        <!-- Guests tab -->
        <el-tab-pane label="Guest" name="first">
          <el-form class="dialogForm" :model="form" ref="form" label-width="120px" size="small">
            <!-- Name -->
            <el-form-item label="Name" required>
              <el-input
                ref="guestsName"
                v-model="form.guest.name"
                @change="resetServerError('guest')"
              ></el-input>
              <div
                v-if="this.$store.state.error && this.$store.state.error.guest && this.$store.state.error.guest.name"
                class="customError"
              >{{this.$store.state.error.guest.name[0]}}</div>
            </el-form-item>

            <!-- Gender -->
            <el-form-item label="Gender" required>
              <el-radio-group v-model="form.guest.gender">
                <el-radio label="M" border @change="resetServerError('guest')">Male</el-radio>
                <el-radio label="F" border @change="resetServerError('guest')">Female</el-radio>
              </el-radio-group>
              <div
                v-if="this.$store.state.error && this.$store.state.error.guest && this.$store.state.error.guest.gender"
                class="customError"
              >{{this.$store.state.error.guest.gender[0]}}</div>
            </el-form-item>

            <!-- Date  -->
            <!-- <el-form-item label="Date" required>
          <el-col :span="11">
            <el-form-item size="small">
              <el-date-picker
                v-model="form.check_in_date"
                type="date"
                placeholder="Check-In"
                style="width: 100%;"
                value-format="yyyy-MM-dd"
                :clearable="false"
                :editable="false"
                :picker-options="{
                  firstDayOfWeek: 1
                }"
                @change="resetServerError('check_in_date')"
              ></el-date-picker>
            </el-form-item>
            <div
              v-if="this.$store.state.error && this.$store.state.error.check_in_date"
              class="customError"
            >{{this.$store.state.error.check_in_date[0]}}</div>
          </el-col>

          <el-col class="line" :span="2">-</el-col>

          <el-col :span="11">
            <el-form-item size="small">
              <el-date-picker
                v-model="form.check_out_date"
                type="date"
                placeholder="Check-Out"
                style="width: 100%;"
                :picker-options="{
                  firstDayOfWeek: 1
                }"
                :clearable="false"
                :editable="false"
                value-format="yyyy-MM-dd"
                @change="resetServerError('check_out_date')"
              ></el-date-picker>
            </el-form-item>
            <div
              v-if="this.$store.state.error && this.$store.state.error.check_out_date"
              class="customError"
            >{{this.$store.state.error.check_out_date[0]}}</div>
          </el-col>
            </el-form-item>-->

            <!-- Date (v2.0) -->
            <el-form-item label="Date" size="small" required>
              <el-date-picker
                v-model="daterange"
                value-format="yyyy-MM-dd"
                type="daterange"
                range-separator="-"
                start-placeholder="Check-In"
                end-placeholder="Check-Out"
                :style="'width:100%;'"
                :clearable="false"
                :editable="false"
                :picker-options="datePickerOptions"
                @change="resetServerError('check_in_date')"
              ></el-date-picker>

              <div
                v-if="this.$store.state.error && this.$store.state.error.check_in_date"
                class="customError customError_date-start"
              >{{this.$store.state.error.check_in_date[0]}}</div>
            </el-form-item>

            <!-- Role -->
            <!-- <div class="form__addButtonContainer"> -->
            <el-form-item class="form__inputWithButton" label="Role" required>
              <el-col :span="11">
                <el-select
                  v-model="form.role"
                  placeholder="please select role"
                  @change="resetServerError('role')"
                >
                  <el-option
                    v-for="role in this.$store.state.roles.roles"
                    v-bind:key="role.id"
                    :label="role.name"
                    :value="role.id"
                  ></el-option>
                </el-select>
              </el-col>
              <div
                v-if="this.$store.state.error && this.$store.state.error.role"
                class="customError"
              >{{this.$store.state.error.role[0]}}</div>
            </el-form-item>

            <!-- add new role -->
            <!-- <el-button
            class="form__addButton"
            type="primary"
            icon="el-icon-plus"
            size="mini"
            plain
            @click="openRoleDialog"
            ></el-button>-->
            <!-- </div> -->

            <!-- Status -->
            <el-form-item label="Status" required>
              <el-col :span="11">
                <el-select
                  v-model="form.status"
                  placeholder="please select status"
                  @change="resetServerError('status')"
                >
                  <el-option
                    v-for="status in this.$store.state.statuses.statuses"
                    v-bind:key="status.id"
                    :label="status.name"
                    :value="status.id"
                  ></el-option>
                </el-select>
              </el-col>
              <div
                v-if="this.$store.state.error && this.$store.state.error.status"
                class="customError"
              >{{this.$store.state.error.status[0]}}</div>
            </el-form-item>

            <!-- Phone -->
            <el-form-item label="Phone">
              <el-col :span="11">
                <el-input v-model="form.guest.phone" @change="resetServerError('guest')"></el-input>
              </el-col>
              <div
                v-if="this.$store.state.error && this.$store.state.error.guest && this.$store.state.error.guest.phone"
                class="customError"
              >{{this.$store.state.error.guest.phone[0]}}</div>
            </el-form-item>

            <!-- Email -->
            <el-form-item label="Email" required>
              <el-input v-model="form.guest.email" @change="resetServerError('guest')"></el-input>
              <div
                v-if="this.$store.state.error && this.$store.state.error.guest && this.$store.state.error.guest.email"
                class="customError"
              >{{this.$store.state.error.guest.email[0]}}</div>
            </el-form-item>

            <!-- Distatnce -->
            <!-- <el-form-item label="Distance">
          <el-col :span="11">
            <el-input v-model="form.distance_to_event" @change="resetServerError('distance')"></el-input>
          </el-col>
          <div
            v-if="this.$store.state.error && this.$store.state.error.distance_to_event"
            class="customError"
          >{{this.$store.state.error.distance_to_event[0]}}</div>
            </el-form-item>-->

            <!-- Distatnce -->
            <el-form-item label="Distance">
              <el-col :span="11">
                <el-select
                  placeholder="select distance to event"
                  v-model="form.distance_to_event"
                  clearable
                  @change="resetServerError('distance')"
                >
                  <el-option
                    v-for="interval in distance_to_event"
                    :key="interval.value"
                    :label="interval.label"
                    :value="interval.value"
                  ></el-option>
                </el-select>
              </el-col>
              <div
                v-if="this.$store.state.error && this.$store.state.error.distance_to_event"
                class="customError"
              >{{this.$store.state.error.distance_to_event[0]}}</div>
            </el-form-item>

            <!-- Max payment -->
            <el-form-item label="Max payment">
              <el-col :span="11">
                <el-input v-model="form.max_payment" @change="resetServerError('max_payment')"></el-input>
              </el-col>
              <div
                v-if="this.$store.state.error && this.$store.state.error.max_payment"
                class="customError"
              >{{this.$store.state.error.max_payment[0]}}</div>
            </el-form-item>

            <!-- Checkboxes -->
            <el-form-item>
              <el-checkbox
                v-model="form.ready_to_share_accommodation"
                label="Ready to share accomodation"
              ></el-checkbox>
              <el-checkbox
                class="custom-margin"
                v-model="form.ready_to_share_room"
                label="Ready to share room"
              ></el-checkbox>
              <el-checkbox v-model="form.plus_one" label="Plus one"></el-checkbox>
            </el-form-item>

            <!-- Buttons -->
            <!-- <el-form-item class="actions">
              <el-button @click="dialog.visible = false" size="small">Cancel</el-button>
              <el-button
                type="primary"
                size="small"
                @click="submitGuestData('form')"
              >{{dialog.submitButton}}</el-button>
            </el-form-item>-->
          </el-form>
        </el-tab-pane>

        <!-- Companions tab -->
        <el-tab-pane label="Companions" name="second">
          <div style="text-align: center">
            <el-transfer
              :titles="transferCompanions"
              :filter-method="filterMethod"
              :data="listOfNames"
              v-model="companions.default"
              v-loading="loadingAllGuests"
              filter-placeholder="enter guest name"
              ref="companionsTranfer"
              style="text-align: left; display: inline-block"
              filterable
              @change="getCurrentCompanions"
            ></el-transfer>
          </div>

          <!-- <el-badge slot="label" :value="num" class="item">
            <el-button class="TabButton" size="small" type="text">Companions</el-button>
          </el-badge>-->
        </el-tab-pane>

        <!-- Cannot live with tab -->
        <el-tab-pane label="Can not live with" name="third">
          <div style="text-align: center">
            <el-transfer
              :titles="transferCannotLiveWith"
              :filter-method="filterMethod"
              filter-placeholder="enter guest name"
              :data="listOfNames"
              v-model="defaultCannot"
              v-loading="loadingAllGuests || loading"
              ref="cannotTranfer"
              style="text-align: left; display: inline-block"
              filterable
              @change="changeCannotState"
            ></el-transfer>
          </div>
        </el-tab-pane>
        <!-- Buttons -->
        <div class="actions" style="margin-top: 25px">
          <el-button @click="dialog.visible = false" size="small">Cancel</el-button>
          <el-button
            type="primary"
            size="small"
            @click="submitGuestData('form')"
          >{{dialog.submitButton}}</el-button>
        </div>
      </el-tabs>
    </el-dialog>
  </div>
</template>


<script>
import changeGuestDialog from '@/components/guests/ChangeGuestDialog'

export default {
  name: 'GuestUI',
  components: {},
  props: {
    deleteBtn: {
      type: Boolean,
      default: true
    },
    editableRows: {
      type: Boolean,
      default: true
    },
    addButton: {
      type: Boolean,
      default: true
    },
    pagination: {
      type: Boolean,
      default: true
    },
    showFilters: {
      type: Boolean,
      default: true
    },
    hideColumn: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      active: false,
      activeName: 'first',
      allGuestsList: [],
      transferCompanions: ['All guests', 'Companions'],
      transferCannotLiveWith: ['All guests', 'Can not live with'],

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
        { value: 2, label: 'less than 2km' },
        { value: 10, label: '2-10km' },
        { value: 99999, label: 'more than 10km' }
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
          email: '',
          gender: '',
          id: null,
          name: '',
          phone: ''
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
          email: '',
          gender: '',
          id: null,
          name: '',
          phone: ''
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
        title: '',
        submitButton: ''
      },

      roleDialog: {
        visible: false
      },
      roleForm: {
        name: ''
      },

      daterange: '',
      filterDaterange: '',

      rules: {
        name: [
          {
            required: true,
            message: 'name is required',
            trigger: 'blur'
          }
        ],

        check_in_date: [
          {
            required: true,
            message: 'field is required',
            trigger: 'blur'
          }
        ],

        check_out_date: [
          {
            required: true,
            message: 'field is required',
            trigger: 'blur'
          }
        ],

        role: [
          {
            required: true,
            message: 'field is required',
            trigger: 'blur'
          }
        ],

        status: [
          {
            required: true,
            message: 'field is required',
            trigger: 'blur'
          }
        ],
        max_payment: [
          {
            required: true,
            message: 'field is required',
            trigger: 'blur'
          }
        ]
      },

      filters: {
        role: ''
      },

      pageSettings: {
        page: 1,
        page_size: 10,
        ordering: '-guest__id',
        name: '',
        gender: '',
        check_in_date: '',
        check_out_date: '',
        role__in: [],
        status__in: []
        //get_all: false
      },
      page_sizes: [10, 25, 50, 100, 1000],

      currentRowId: '',

      error: ''
    }
  },
  created() {
    // show the list of all guests on the resettlement page
    /* if (this.$route.name == 'resettlementui') {
      this.pageSettings.page_size = ''
    } */
    this.$store.dispatch('updateGuestsListui', {
      event_id: this.$route.params.event_id,
      pageSettings: this.pageSettings
    })
  },
  beforeDestroy() {
    this.$store.commit('deleteSelectedGuests')
    this.$store.state.guestsui.guests = []
  },
  watch: {
    dialogGlobalState: function(val) {
      this.dialog.visible = false
    }
  },
  computed: {
    loading() {
      return this.$store.getters.loading
    },
    loadingAllGuests() {
      return this.$store.getters.loadingAllGuests
    },
    // Read
    listOfGuests() {
      return this.$store.getters.getListOfGuestsui
    },

    // Read Current Guest
    getCurrentGuest() {
      return this.$store.getters.currentGuest
    },
    listOfNames() {
      if (this.dialog.title && this.dialog.title == 'Create guest') {
        return this.$store.getters.getListOfAllGuests
      } else if (this.dialog.title && this.dialog.title == 'Change guest') {
        // delete current guest from list of all guests for Companions and Cannot live with tabs
        const result = this.$store.getters.getListOfAllGuests.filter(
          guest => guest.key !== this.currentGuest.guest.id
        )
        return result
      } else {
      }
    },

    form() {
      if (this.dialog.submitButton === 'Change') {
        return this.currentGuest
      } else {
        return this.newGuest
      }
    },

    isError() {
      return false
    },

    isDisabled() {
      if (this.$store.state.guestsui.selectedGuests.length > 0) {
        return false
      } else {
        return true
      }
    },

    dialogGlobalState() {
      return this.$store.getters.dialogState
    },

    datePickerOptions() {
      return {
        firstDayOfWeek: 1,
        disabledDate: date => {
          var yesterday = new Date(date.getTime())
          var corectEventStart = yesterday.setDate(date.getDate() + 1)
          return (
            corectEventStart <
              new Date(this.$store.state.currentEvent.date_start) ||
            date > new Date(this.$store.state.currentEvent.date_end)
          )
        }
      }
    }
    /* checkCurrentRoute() {
      if (this.$route.name == 'resettlementui') {
        return false
      } else {
        return true
      }
    } */
  },
  methods: {
    // Update
    cellClickHandler(row, column, cell, event) {
      // don't open dialog if click was on checkboxes column and on resettlment page
      if (!column.label || !this.editableRows) {
        return
      } else {
        this.daterange = [row.check_in_date, row.check_out_date]
        const pref = Object.assign({}, row)
        const guest = Object.assign({}, row.guest)
        pref.guest = guest
        this.currentGuest = pref

        this.openUpdateDialog()
      }
    },

    changeTab(activeName, oldActiveName) {
      // if (activeName !== 'first') {
      //   await this.$store.dispatch('getGuestById', {
      //     id: this.currentGuest.id
      //   })
      //   this.currentGuest = this.getCurrentGuest
      // }
    },

    changeCannotState(currentCannot) {
      this.currentCannot = currentCannot
    },

    // list of companions which already exist
    getDefaultCompanions() {
      if (this.currentGuest.companions) {
        const formattedGuestsData = this.currentGuest.companions.map(
          companion => companion.guest
        )

        // list of companions for transfer's component v-model
        this.companions.default = [...formattedGuestsData]

        // immutable list of companions
        this.companions.reference = [...formattedGuestsData]
      }
    },

    // list of current companions
    getCurrentCompanions(currentCompanions) {
      this.companions.current = currentCompanions
    },

    // getting list of companions for creating
    getCompanionsForCreation() {
      if (
        this.companions.default.length > 0 &&
        this.companions.reference.length > 0
      ) {
        const differenceWith = (arr, val, comp) =>
          arr.filter(a => val.findIndex(b => comp(a, b)) === -1)

        this.companions.forCreation = differenceWith(
          this.companions.default,
          this.companions.reference,
          (a, b) => a == b
        )
      } else if (
        this.companions.default.length > 0 &&
        this.companions.reference.length == 0
      ) {
        this.companions.forCreation = this.companions.default
      } else {
        return
      }
    },

    createCompanions() {
      if (this.companions.default) {
        this.companions.forCreation.forEach(id =>
          this.$store.dispatch('creatingCompanions', {
            guest1_id: this.currentGuest.guest.id,
            guest2_id: id,
            event: this.$route.params.event_id
          })
        )
      }
    },

    // getting list of companions for deleting
    getCompanionsForDeleting() {
      if (this.companions.reference.length > 0) {
        const differenceWith = (arr, val, comp) =>
          arr.filter(a => val.findIndex(b => comp(a, b)) === -1)

        this.companions.forDeleting = differenceWith(
          this.companions.reference,
          this.companions.default,
          (a, b) => a == b
        )
      }
    },

    deleteCompanions() {
      if (this.companions.forDeleting.length > 0) {
        this.companions.forDeleting.forEach(id =>
          this.$store.dispatch('deletingCompanions', {
            event: this.$route.params.event_id,
            guest: id
          })
        )
      }
    },

    buildNewCannot() {
      const differenceWith = (arr, val, comp) =>
        arr.filter(a => val.findIndex(b => comp(a, b)) === -1)

      this.newCannot = differenceWith(
        this.defaultCannot,
        this.newDefaultCannot,
        (a, b) => a == b
      )
    },

    buildNewCompanions() {
      if (this.companions.alredyExist) {
        const differenceWith = (arr, val, comp) =>
          arr.filter(a => val.findIndex(b => comp(a, b)) === -1)

        this.companions.new = differenceWith(
          this.companions.alredyExist,
          this.companions.current,
          (a, b) => a == b
        )
      } else if (this.companions.new) {
        this.companions.new = this.companions.current
      }
    },

    buildDeleteCannot() {
      const differenceWith = (arr, val, comp) =>
        arr.filter(a => val.findIndex(b => comp(a, b)) === -1)

      this.deleteCannot = differenceWith(
        this.newDefaultCannot,
        this.defaultCannot,
        (a, b) => a == b
      )
    },

    // create new cannot live with
    async createCannot() {
      await this.newCannot.forEach(id =>
        this.$store.dispatch('getCannotLiveWith', {
          guest1: this.currentGuest.guest.id,
          guest2: id,
          event: this.$route.params.event_id
        })
      )
      // update the page
      this.$store.dispatch('updateGuestsListui', {
        event_id: this.$route.params.event_id,
        pageSettings: this.pageSettings
      })
    },

    // delete existed cannot live with
    async deletingCannot() {
      const currentGuestCannotList = this.currentGuest.cannot_live_with
      const filteredListOfGuest = currentGuestCannotList.filter(function(
        guest
      ) {
        return this.indexOf(guest.id) !== -1
      },
      this.deleteCannot)

      // await filteredListOfGuest.forEach(guest =>
      //   this.$store.dispatch('deleteCannotLiveWith', guest.cannot_live_with_id)
      // )

      for (const guest of filteredListOfGuest) {
        await this.$store.dispatch(
          'deleteCannotLiveWith',
          guest.cannot_live_with_id
        )
      }

      // update the page
      this.$store.dispatch('updateGuestsListui', {
        event_id: this.$route.params.event_id,
        pageSettings: this.pageSettings
      })
    },

    // Companions Tab End

    // Create - Update guest
    async submitGuestData(form) {
      // split date
      this.form.check_in_date = this.daterange[0]
      this.form.check_out_date = this.daterange[1]

      // needed for correct server validation
      if (this.form.distance_to_event == '') {
        return (this.form.distance_to_event = null)
      }
      // needed for correct server validation
      if (this.form.max_payment == '') {
        return (this.form.max_payment = null)
      }
      // ----------- CREATE DIALOG -----------
      if (this.dialog.submitButton === 'Create') {
        const newGuest = await this.$store.dispatch('createNewGuestui', {
          guest: this.form,
          event_id: this.$route.params.event_id
        })

        this.currentGuest = newGuest
        // for can not live with tab
        this.newCannot = this.currentCannot
        this.buildNewCannot(),
          this.getCompanionsForCreation(),
          this.createCannot(),
          this.createCompanions(),
          // update the page
          this.$store.dispatch('updateGuestsListui', {
            event_id: this.$route.params.event_id,
            pageSettings: this.pageSettings
          })
      }
      // ----------- UPDATE DIALOG -----------
      else {
        if (!this.$store.state.error) {
          // for can not live with +  companions tab

          this.buildDeleteCannot(),
            this.buildNewCannot(),
            // this.buildNewCompanions(),
            this.getCompanionsForCreation(),
            this.getCompanionsForDeleting(),
            this.deletingCannot(),
            this.createCannot(),
            this.createCompanions(),
            this.deleteCompanions()

          // // // update the page
          // this.$store.dispatch('updateGuestsListui', {
          //   event_id: this.$route.params.event_id,
          //   pageSettings: this.pageSettings
          // })
        } else {
          this.$refs.tabs.currentName = 'first'
        }
      }
    },

    prepareDates() {
      // split date
      if (this.filterDaterange) {
        this.pageSettings.check_in_date = this.filterDaterange[0]
        this.pageSettings.check_out_date = this.filterDaterange[1]
      } else {
        this.pageSettings.check_in_date = ''
        this.pageSettings.check_out_date = ''
      }
      this.filter()
    },

    // Create new role
    // submitRoleData() {
    //   this.$store.dispatch('createNewRole', this.roleForm)
    // },

    // Delete
    async deleteClickHeandler(guest) {
      await this.$store.dispatch('deleteGuestui', {
        id: guest.guest.id,
        event_id: this.$route.params.event_id
      })
      this.pageSettings.page = 1
      this.$store.dispatch('updateGuestsListui', {
        event_id: this.$route.params.event_id,
        pageSettings: this.pageSettings
      })
    },

    handleSelectionChange(selectedGuests) {
      // this.selectedGuests = val;
      const selectedGuestId = selectedGuests.map(selectedGuest => {
        return selectedGuest.guest
      })
      this.$store.commit('addSelectedGuests', selectedGuests)
    },

    // delete user
    async deleteSelectedGuests() {
      await Promise.all(
        this.$store.state.guestsui.selectedGuests.map(pref =>
          this.$store.dispatch('deleteGuestui', {
            id: pref.id,
            event_id: this.$route.params.event_id
          })
        )
      )
      this.$store
        .dispatch('updateGuestsListui', {
          event_id: this.$route.params.event_id,
          pageSettings: this.pageSettings
        })
        .then(() => this.$store.commit('deleteSelectedGuests'))
        .then(() => {
          this.active = false
        })
    },

    async openUpdateDialog() {
      const attr = {
        title: 'Change guest',
        submitButton: 'Change'
      }
      this.openDialog(attr)

      this.getDefaultCompanions()

      // list of guests which already exist in can not live with list
      this.defaultCannot = this.currentGuest.cannot_live_with.map(
        cannot => cannot.id
      )
      // list of guests which already exist in can not live with list
      // if (this.companions.default) {
      //   this.companions.alreadyExist = [...this.companions.default]
      // }
    },

    openCreateDialog() {
      const attr = {
        title: 'Create guest',
        submitButton: 'Create'
      }
      // this.$store.commit("newGuestForm");
      const prefNewGuest = Object.assign({}, this.emptyGuest)
      const newGuest = Object.assign({}, this.emptyGuest.guest)
      prefNewGuest.guest = newGuest
      this.newGuest = prefNewGuest

      this.openDialog(attr)
    },

    openDialog(attr) {
      // list of all guests for this events
      this.$store.dispatch('getAllGuests', {
        event_id: this.$route.params.event_id,
        pageSettings: this.pageSettings
      })

      this.dialog.visible = true
      this.dialog.title = attr.title
      this.dialog.submitButton = attr.submitButton
      this.$nextTick(() => {
        this.$refs.guestsName.focus()
      })
    },

    // openRoleDialog() {
    //   this.roleDialog.visible = true
    //   this.$nextTick(() => {
    //     this.$refs.roleName.focus()
    //   })
    // },

    closeDialog() {
      this.$store.commit('clearAllGuestsList')
      this.$store.commit('clearError')
      this.$refs.form.resetFields()
      this.daterange = ''
      this.$refs.tabs.currentName = 'first'
      this.currentGuest = Object.assign({}, this.emptyGuest)
      // clear companions transfer's state
      ;(this.companions = {
        default: [],
        reference: [],
        alreadyExist: [],
        new: [],
        current: [],
        forCreation: [],
        forDeleting: []
      }),
        this.$refs.companionsTranfer.clearQuery('left')
      this.$refs.companionsTranfer.clearQuery('right')
      // clear cannot transfer's state
      this.defaultCannot = []
      this.$refs.cannotTranfer.clearQuery('left')
      this.$refs.cannotTranfer.clearQuery('right')
    },

    closeRoleDialog() {
      this.roleForm.name = ''
      // this.$store.commit("clearError");
      //this.$refs.roleForm.resetFields();
    },

    sortGuest(params) {
      const order = params.order == 'descending' ? '-' : ''
      this.pageSettings.ordering = `${order}${params.prop}`
      this.$store.dispatch('updateGuestsListui', {
        event_id: this.$route.params.event_id,
        pageSettings: this.pageSettings
      })
    },

    resetServerError(field) {
      if (this.$store.state.error) {
        this.$store.state.error[field] = ''
      }
    },

    // action cell buttons
    cellEnterHandler(row) {
      this.currentRowId = row.id
    },
    cellLeaveHandler() {
      this.currentRowId = ''
    },
    guestCall(row) {
      alert('call ' + row.guest.phone + ' via Skype')
    },

    // open default email client
    guestEmail(row) {},

    // pagination method
    changeCurrentPage(newPageNumber) {
      this.pageSettings.page = newPageNumber
      this.$store.dispatch('updateGuestsListui', {
        event_id: this.$route.params.event_id,
        pageSettings: this.pageSettings
      })
    },

    filter() {
      this.pageSettings.page = 1
      this.$store.dispatch('updateGuestsListui', {
        event_id: this.$route.params.event_id,
        pageSettings: this.pageSettings
      })
    },

    resetFilterForm() {
      this.pageSettings.name = ''
      this.pageSettings.gender = ''
      this.pageSettings.check_in_date = ''
      this.pageSettings.check_out_date = ''
      this.pageSettings.role__in = ''
      this.pageSettings.status__in = ''
      this.filterDaterange = ''
      this.filter()
    },
    filterMethod(query, item) {
      return item.label.toLowerCase().indexOf(query.toLowerCase()) > -1
    },
    limitChanged(val) {
      /* if (typeof val !== Number) {
        this.pageSettings.get_all = true
        this.pageSettings.page_size = ''
        this.$store.dispatch('updateGuestsListui', {
          event_id: this.$route.params.event_id,
          pageSettings: this.pageSettings
        })
      } */
      this.pageSettings.page_size = val
      this.$store.dispatch('updateGuestsListui', {
        event_id: this.$route.params.event_id,
        pageSettings: this.pageSettings
      })
    }
  }
}
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
