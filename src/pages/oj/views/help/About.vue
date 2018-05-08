<template>
  <div>
    <Row :gutter="15" type="flex" justify="center" style="margin-bottom: 10px;">
      <Col :xs="24" :sm="6">
        <Card class="card-item">
          <div slot="title">
            <div class="person">
              <span class="name">吴世枫</span>
              <div class="intro">这里是介绍</div>
            </div>
          </div>
          <div class="intro-container">
            <div class="image-container">
              <img class="img" src="/public/avatar/default.png" alt="">
            </div>
            <div class="tags">
              <Tag color="blue" style="width: 80px;">发起人</Tag>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
    <Row :gutter="15" type="flex" justify="center">
      <Col :xs="24" :sm="6">
        <Card class="card-item">
          <div slot="title">
            <div class="person">
              <span class="name">郑海兵</span>
              <div class="intro">广师数科院14信计</div>
            </div>
          </div>
          <div class="intro-container">
            <div class="image-container">
              <img class="img" src="/public/avatar/default.png" alt="">
            </div>
            <div class="tags">
              <Tag color="blue" style="width: 80px;">后端开发</Tag>
            </div>
          </div>
        </Card>
      </Col>
      <Col :xs="24" :sm="6">
        <Card class="card-item">
          <div slot="title">
            <div class="person">
              <span class="name">卢翼翔</span>
              <div class="intro">广师数科院14信计</div>
            </div>
          </div>
          <div class="intro-container">
            <div class="image-container">
              <img class="img" src="/public/avatar/default.png" alt="">
            </div>
            <div class="tags">
              <Tag color="blue" style="width: 80px;">负责部分</Tag>
            </div>
          </div>
        </Card>
      </Col>
      <Col :xs="24" :sm="6">
        <Card class="card-item">
          <div slot="title">
            <div class="person">
              <span class="name">胡伟林</span>
              <div class="intro">广师数科院14信计</div>
            </div>
          </div>
          <div class="intro-container">
            <div class="image-container">
              <img class="img" src="/public/avatar/default.png" alt="">
            </div>
            <div class="tags">
              <Tag color="blue" style="width: 80px;">前端开发</Tag>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script>
  export default {
  }
</script>

<style scoped lang="less">
  .card-item {
    background-color: #eee;
  }
  .person {
    .name {
      display: inline-block;
      color: blue;
      font-size: 16px;
      font-weight: bold;
    }
    .intro {
      color: grey;
      font-size: 14px;
      height: 18px;
      line-height: 18px;
      margin: 5px 0 0 5px;
    }
  }
  .intro-container {
    .image-container {
      width: 180px;
      height: 180px;
      text-align: center;
      margin: 0 auto;
      .img {
        width: 150px;
        height: 150px;
        cursor: pointer;
        border-radius: 50%;
        box-shadow: -5px 4px 14px #aaa;
        transition: all .4s;
        -webkit-transition: all .4s;
        -moz-transition: all .4s;
        -o-transition: all .4s;
        -ms-transition: all .4s;
        &:hover {
          transform: scale(1.1,1.1);
          -webkit-transform: scale(1.1,1.1);
          -moz-transform: scale(1.1,1.1);
          -o-transform: scale(1.1,1.1);
          -ms-transform: scale(1.1,1.1);
        }
      }
    }
    .tags {
      margin-top: 10px;
      text-align: center;
    }
  }
</style>
