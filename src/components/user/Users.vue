<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
      <el-breadcrumb-item>User Management</el-breadcrumb-item>
      <el-breadcrumb-item>User List</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="9">
          <!-- 搜索与添加区域 -->
          <el-input placeholder="Search or type" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">Add user</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="Name" prop="username"></el-table-column>
        <el-table-column label="Email" prop="email"></el-table-column>
        <el-table-column label="Phone" prop="mobile"></el-table-column>
        <el-table-column label="Role" prop="role_name"></el-table-column>
        <el-table-column label="Status">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_satue" @change="userStateChanged(scope.row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="Operation" width="180px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)">
            </el-button>
<!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="Setting roles" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="Add User" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主题 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="130px">
        <el-form-item label="Username" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="Email" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="Phone" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="addUser">Confirm</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="Edit user" :visible.sync="editDialogVisible" width="70%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="130px">
        <el-form-item label="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="email" prop='email'>
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="phone" prop='mobile'>
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="editUserInfo">Confirm</el-button>
      </span>

    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="Setting roles" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>Current user: {{userInfo.username}}</p>
        <p>Current role: {{userInfo.role_name}}</p>
        <P>Setting roles 
          <template>
            <el-select v-model="selectedRoleId" placeholder="Please select">
              <el-option
                v-for="item in rolesList"
                :key="item.id"
                :label="item.roleName"
                :value="item.id">
              </el-option>
            </el-select>
          </template>
        </P>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="saveRoleInfo">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    data() {
      //验证邮箱的规则
      var checkEmail = (rule, value, cb) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
        if (regEmail.test(value)) {
          //合法邮箱
          return cb();
        }
        cb(new Error("Please enter a valid email"));
      };
      //验证手机号的规则
      var checkMobile = (rule, value, cb) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
        if (regMobile.test(value)) {
          return cb();
        }
        cb(new Error("Please enter a valid phone number"));
      };
      return {
        //获取用户列表的参数对象
        queryInfo: {
          query: "",
          pagenum: 1,
          pagesize: 2,
        },
        userlist: [],
        total: 0,
        //控制添加用户对话框的显示与隐藏
        addDialogVisible: false,
        //添加用户的表单数据
        addForm: {
          username: "",
          password: "",
          email: "",
          mobile: "",
        },
        //添加表单验证规则对象
        addFormRules: {
          username: [
            { required: true, message: "Please enter username", trigger: "blur" },
            {
              min: 3,
              max: 10,
              message: "Please enter between 3 to 10 char",
              trigger: "blur",
            },
          ],
          password: [
            { required: true, message: "Please enter password", trigger: "blur" },
            {
              min: 6,
              max: 15,
              message: "Please enter between 6 to 15 char",
              trigger: "blur",
            },
          ],
          email: [
            { required: true, message: "Please enter email", trigger: "blur" },
            { validator: checkEmail, trigger: "blur" },
          ],
          mobile: [
            {
              required: true,
              message: "Please enter phone number",
              trigger: "blur",
            },
            { validator: checkMobile, trigger: "blur" },
          ],
        },
        //控制修改用户对话框的显示与隐藏
        editDialogVisible: false,
        //查询到的用户信息对象
        editForm: {},
        editFormRules: {
          email: [
            { required: true, message: 'Please enter email', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: 'Please enter phone number', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur' }
          ]
        },
        //控制分配角色对话框的显示与隐藏
        setRoleDialogVisible: false,
        //需要被分配角色的用户信息
        userInfo:{},
        //所有角色的数据列表
        rolesList:[],
        //已选中的角色id值
        selectedRoleId:'',
      };
    },
    created() {
      this.getUserList();
    },
    methods: {
      async getUserList() {
        const { data: res } = await this.$http.get("users", {
          params: this.queryInfo,
        });
        if (res.meta.status !== 200) {
          return this.$message.error("Fail to get user list");
        }
        this.userlist = res.data.users;
        this.total = res.data.total;
        console.log(res);
      },
      //监听pagesize改变的事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize;
        this.getUserList();
      },
      //监听 页码值 改变的事件
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage;
        this.getUserList();
      },
      //监听switch开关状态
      async userStateChanged(userinfo) {
        console.log(userinfo);
        const { data: res } = await this.$http.put(
          "users/${userinfo.id}/state/${userinfo.mg_state}"
        );
        if (res.meta.status !== 200) {
          userinfo.mg_state != userinfo.mg_state;
          return this.$message.error("Fail to update info");
        }
        return this.$message.success("Update finish");
      },
      //监听添加用户对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields();
      },
      //点击按钮添加新用户
      addUser() {
        this.$refs.addFormRef.validate(async (valid) => {
          if (!valid) return;
          //可以发起添加用户的网络请求
          const { data: res } = await this.$http.post("users", this.addForm);
          if (res.meta.status !== 201) this.$message.error("Fail to add user");
          this.$message.success("User adds succeed");
          //隐藏添加用户对话框
          this.addDialogVisible = false;
          //刷新列表
          this.getUserList();
        });
      },
      //展示编辑用户的对话框
      async showEditDialog(id) {
        const { data: res } = await this.$http.get("users/" + id);
        if (res.meta.status !== 200)
          return this.$message.error("Fail to search user info");
        this.editForm = res.data;
        this.editDialogVisible = true;
      },
      //监听修改用户对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields();
      },      //删除用户信息
      //修改用户信息并提交
      editUserInfo() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          const { data: res } = await this.$http.put('users/' + this.editForm.id, { email: this.editForm.email, mobile: this.editForm.mobile })

          if (res.meta.status !== 200) {
            return this.$message.error('Fail to update')
          }
          //关闭对话框
          this.editDialogVisible = false
          //刷新数据列表
          this.getUserList()
          //提示修改成功
          this.$message.success('Update succeed')
        })
      },
      async removeUserById(id) {
        //弹框询问
        const confirmResult = await this.$confirm('Delete user', 'Prompt', {
          confirmButtonText: 'Confirm',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).catch(err => err)

        //如果确认删除，则返回字符串confirm
        //如果否认删除，则返回字符串cancel
        if (confirmResult !== 'confirm') {
          return this.$message.info('Cancel delete ')
        }
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.info('Fail to delete')
        }
        this.$message.info('Delete success')
        this.getUserList()
      },
      //展示分配角色的对话框
      async setRole(userInfo){
        this.userInfo = userInfo
        //在展示对话框之前，展示所有角色列表
        const{data:res} = await this.$http.get('roles')
        if(res.meta.status !== 200){
          return this.$message.error('Fail to get role list')
        }
        this.rolesList = res.data
        this.setRoleDialogVisible=true
      },
      //点击按钮，分配角色
      async saveRoleInfo(){
        if(!this.selectedRoleId){
          return this.$message.error('Please select roles')
        }
        const {data:res} = await this.$http.put('users/${this.userInfo.id}/role',{rid: this.selectedRoleId})

        if(res.meta.status !== 200){
          return this.$message.error('Fail to set new roles')
        }
        this.$message.success('Setting roles succeed')
        this.getUserList()
        this.setRoleDialogVisible=false
      },
      //监听分配角色对话框的关闭事件
      setRoleDialogClosed(){
        this.selectedRoleId=''
        this.userInfo={}
      },
    }

  };
</script>

< lang="less" scoped>
</>