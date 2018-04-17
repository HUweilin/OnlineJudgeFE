<template>
  <el-button type="primary">{{value}}</el-button>
</template>
<script>
  export default{
    name: 'Save',
    props: {
      value: {
        type: String,
        default: '保存'
      }
    }
  }
</script>
