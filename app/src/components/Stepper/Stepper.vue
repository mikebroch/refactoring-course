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
        <guestsui :showFilters="true" />
      </keep-alive>
    </div>

    <div v-if="activeStep === 1" class="step-content">
      <keep-alive>
        <accommodation />
      </keep-alive>
    </div>

    <div v-if="activeStep === 2" class="step-content">
      <keep-alive>
        <div class="resettlement-wrapper">
          <plans :hideColumn="false" :pagination="false" />
        </div>
      </keep-alive>
    </div>
  </div>
</template>
