<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo-2.png" alt="" />
        <span>Mall Management System</span>
      </div>
      <el-button type="info" @click="logout">Back</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <!-- 64x56 -->
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="togger-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区 --> 
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menulist"
            :key="item.id"
          >
            <template slot="title">
              <!-- 图标，文本 -->
              <i :class="iconsObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <template slot="title">
                <!-- 图标，文本 -->
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容 -->
      <el-main>
          <!-- 路由占位符 -->
          <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      //左侧菜单区域
      menulist: [],
      iconsObj: {
        125: "iconfont iconsubscriber-fill",
        103: "iconfont iconquanxian",
        101: "iconfont iconshangpin",
        102: "iconfont icondingdan",
        145: "iconfont iconshuju",
      },
      //是否折叠
      isCollapse: false,
      //被激活的链接地址
      activePath:'',
    };
  },
  created() {
    this.getMenuList();
    this.activePath = window.sessionStorage.getItem('activePath');
  },
  methods: {
    logout() {
      window.sessionStorage.clear();
      this.$router.push("/login");
    },
    //获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
      console.log(res);
    },
    //点击按钮，切换菜单的折叠与展开
    toggleCollapse(){
        this.isCollapse =!this.isCollapse;
    },
    //保存链接的激活状态
    saveNavState(activePath){
        window.sessionStorage.setItem('activePath', activePath);
        this.activePath=activePath;
    },
  },
};
</script>


<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: lightgrey;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.togger-button{
    background-color: #4A5064;
    font-size:16px;
    line-height:24px;
    color:#fff;
    text-align: center;
    letter-spacing: 0.2em;
    cursor: pointer;
}
</style>