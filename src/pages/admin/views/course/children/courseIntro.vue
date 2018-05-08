<template>
  <Panel v-if="course">
    <div slot="title">
      <span class="name">{{course.title}}</span>
      <span class="code">课程代码：{{course.code}}</span>
    </div>
    <div class="intro-container">
      <div class="intro-item first-item">
      	<div class="course-info">
          <div class="title">课程简介</div>
          <div class="content">
            {{course.introduction}}
            <p class="course-info-part">
              <span class="part"><i class="el-icon-date icon"></i>开始</span>
              <span class="data">{{course.start_time | localtime}}</span>
              <span class="part"><i class="el-icon-fa-group icon"></i>学生数</span>
              <span class="data">{{course.total_student}}</span>
            </p>
          </div>
        </div>
        <div class="course-img">
          <img :src="course.picture" class="image" />
        </div>
      </div>
    </div>
  </Panel>
</template>
<script>
  export default {
    props: {
      course: {
        type: Object
      }
    }
  }
</script>
<style lang="less" scoped>
  .name {
    font-size: 20px;
    font-weight: bold;
  }
  .code {
    font-size: 14px;
    margin-left: 10px;
    color: #409EFF;
  }
  .intro-container {
    .intro-item {
      font-size: 18px;
      color: #4a4a4a;
      &.first-item {
        display: flex;
      }
      .course-info {
      	flex: 4;
      	.course-info-part {
          font-size: 14px;
      	  .part {
            display: inline-block;
            padding: 3px 7px;
            border-radius: 5px;
            background-color: #eee;
            .icon {
              margin-right: 5px;
            }
          }
          .data {
            margin: 0 10px;
          }
      	}
      }
      .course-img {
      	flex: 1;
      	padding: 0 15px;
      	.image {
          width: 100%;
          padding-top: 15px;
      	}
      }
      .title {
      	padding: 15px 0;
      	border-bottom: 1px solid #eee;
      }
      .content {
      	font-size: 16px;
      	padding: 0 5px;
        margin-top: 10px;
      }
    }
  }
</style>