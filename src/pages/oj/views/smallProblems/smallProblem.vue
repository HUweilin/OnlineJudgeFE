<template>
	<div class="test">111--> {{content.content}}</div>
</template>
<script>
	export default {
	  props: {
	    content: {
	      type: Object,
	      required: true
	    }
	  },
	  mounted () {}
	}
</script>
<style lang="less" scoped></style>