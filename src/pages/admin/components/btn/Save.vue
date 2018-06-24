<template>
  <el-button type="primary" v-if="value">{{value}}</el-button>
  <el-button type="primary" v-else>{{$t('m.save')}}</el-button>
  
</template>
<script>
  export default{
    name: 'Save',
    props: {
      value: {
        type: String
      }
    }
  }
</script>
