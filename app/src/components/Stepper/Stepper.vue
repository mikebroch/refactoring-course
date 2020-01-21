<template>
  <div>
    <!-- Steps -->

    <el-steps :active="activeStep" finish-status="success" simple>
      <el-step
        style="cursor: pointer;"
        v-for="(item, index) in stepsArr"
        :key="index"
        :title="item.title"
        @click.native="jump(index)"
      ></el-step>
      <!-- <el-step @click.native="jump(index)" title="Select guest"></el-step>
      <el-step @click.native="jump(index)" title="Select accommodation"></el-step>
      <el-step @click.native="jump(index)" title="Select plan"></el-step>-->
    </el-steps>

    <!-- <el-button style="margin-top: 12px;" @click="next">Next step</el-button> -->

    <div>
      <h1>Guest</h1>
    </div>

    <div v-if="activeStep === 0" class="step-content">
      <keep-alive>
        <guestsui />
      </keep-alive>
    </div>

    <!--   <div v-if="activeStep === 1" class="step-content">
      <keep-alive>
        <accommodation />
      </keep-alive>
    </div> -->

    <!-- <div v-if="activeStep === 2" class="step-content">
      <keep-alive>
        <div class="resettlement-wrapper">
          <plans :hideColumn="false" :pagination="false" />
        </div>
      </keep-alive>
    </div> -->
  </div>
</template>

<script>
import guestsui from "../Guest/GuestsUI";
//import accommodation from "../Accommodation/AccommodationUI";

export default {
  components: {
    guestsui
    //accommodation
  },

  data() {
    return {
      activeStep: 0,
      stepStatus: "",
      stepsArr: [{ title: "Guests" }, { title: "Accommodations" }]
    };
  },
  methods: {
    jump(index) {
      console.log(index);
      this.activeStep = index;

      let jump = document.querySelectorAll(".step-jump");

      let total = jump[index].offsetTop;

      let distance =
        document.documentElement.scrollTop ||
        window.pageYOffset ||
        document.body.scrollTop;

      let step = total / 50;
      if (total > distance) {
        smoothDown();
      } else {
        let newTotal = distance - total;
        step = newTotal / 50;
        smoothUp();
      }
      function smoothDown() {
        if (distance < total) {
          distance += step;
          document.body.scrollTop = distance;
          document.documentElement.scrollTop = distance;
          window.pageYOffset = distance;
          setTimeout(smoothDown, 10);
        } else {
          document.body.scrollTop = total;
          document.documentElement.scrollTop = total;
          window.pageYOffset = total;
        }
      }
      function smoothUp() {
        if (distance > total) {
          distance -= step;
          document.body.scrollTop = distance;
          document.documentElement.scrollTop = distance;
          window.pageYOffset = distance;
          setTimeout(smoothUp, 10);
        } else {
          document.body.scrollTop = total;
          document.documentElement.scrollTop = total;
          window.pageYOffset = total;
        }
      }
    }
  }
};
</script>
