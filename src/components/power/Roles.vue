<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
            <el-breadcrumb-item>Roles Management</el-breadcrumb-item>
            <el-breadcrumb-item>Roles List</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片视图 -->
        <el-card>
            <!-- 添加角色按钮 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="AddRoleDialogVisible=true">Add roles</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表 -->
            <el-table :data="rolesList" border stripe>
                <!-- 展开列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
                            v-for="(item1, i1) in scope.row.children" :key="item1.id">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName}}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级 -->
                            <el-col :span="19">
                                <!-- 通过for循环 渲染二级权限 -->
                                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                                    v-for="(item2, i2) in item1.children" :key="item2.id">
                                    <el-col :span="6 ">
                                        <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{
                                            item2.authName }}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id"
                                            closable @close="removeRightById(scope.row, item3.id)">{{ item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column label="Roles Name" prop="roleName"></el-table-column>
                <el-table-column label="Roles Desciption" prop="roleDesc"></el-table-column>
                <el-table-column label="Operations" width="300px">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)">
                            Edit</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                            @click="removeRoleById(scope.row.id)">Delete</el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini"
                            @click="showSetRightDialog(scope.row)">Allocate</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 分配权限 -->
        <el-dialog title="Allocate Roles" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
            <!-- 树形控件 -->
            <el-tree :data="rightsList" :props="treeProps" ref="treeRef" show-checkbox node-key="id" default-expand-all
                :default-checked-keys="defKeys"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="allotRights">Confirm</el-button>
            </span>
        </el-dialog>
        <!-- 添加角色对话框 -->
        <el-dialog title="Add roles" :visible.sync="AddRoleDialogVisible" width="40%" @close="addRoleDialogClosed">
            <el-form :model="addRoleForm" ref="addRoleFormRef" :rules="addRoleFormRules" label-width="100px">
                <el-form-item label="Roles Name" prop="roleName">
                    <el-input v-model="addRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="Roles Description" prop="roleDesc">
                    <el-input v-model="addRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="AddRoleDialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="addRoles">Confirm</el-button>
            </span>
        </el-dialog>
        <!-- 编辑角色对话框 -->
        <el-dialog title="Edit roles" :visible.sync="editRoleDialogVisible" width="40%" @close="addRoleDialogClosed">
            <el-form :model="editRoleForm" ref="editRoleFormRef" :rules="editRoleFormRules" label-width="100px">
                <el-form-item label="Roles Name" prop="roleName">
                    <el-input v-model="editRoleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="Roles Description" prop="roleDesc">
                    <el-input v-model="editRoleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editRoleDialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="editRoles">Confirm</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                // 所有角色列表
                rolesList: [],
                // 分配权限框
                setRightDialogVisible: false,
                // 权限列表
                rightsList: [],
                //  树形控件的属性绑定对象
                treeProps: {
                    label: 'authName',
                    children: 'children'
                },
                //   默认选中节点ID值
                defKeys: [],
                //   添加用户对话框
                AddRoleDialogVisible: false,
                // 添加角色表单
                addRoleForm: {},
                //   添加角色表单验证
                addRoleFormRules: {
                    roleName: [
                        { required: true, message: 'Please enter roles name', trigger: 'blur' }
                    ],
                    roleDesc: [
                        { required: true, message: 'Please enter roles description', trigger: 'blur' }
                    ]
                },
                //   编辑角色信息
                editRoleForm: {},
                editRoleDialogVisible: false,
                editRoleFormRules: {
                    roleName: [
                        { required: true, message: 'Please enter roles name', trigger: 'blur' }
                    ],
                    roleDesc: [
                        { required: true, message: 'Please enter roles description', trigger: 'blur' }
                    ]
                },
                //   当前即将分配权限的Id
                roleId: 0
            }
        },
        created() {
            this.getRolesList()
        },
        methods: {
            async getRolesList() {
                const { data: res } = await this.$http.get('roles')
                if (res.meta.status !== 200) {
                    return this.$message.error('Fail to get role list！')
                }
                this.rolesList = res.data
            },
            // 根据ID删除对应的权限
            async removeRightById(role, rightId) {
                // 弹框提示 删除
                const confirmResult = await this.$confirm(
                    'Delete rights?',
                    'Prompt',
                    {
                        confirmButtonText: 'Confirm',
                        cancelButtonText: 'Cancel',
                        type: 'warning'
                    }
                ).catch(err => err)
                // 点击确定 返回值为：confirm
                // 点击取消 返回值为： cancel
                if (confirmResult !== 'confirm') {
                    return this.$message.info('Cancel delete operation')
                }
                const { data: res } = await this.$http.delete(
                    `roles/${role.id}/rights/${rightId}`
                )
                if (res.meta.status !== 200) {
                    return this.$message.error('Fail to delete')
                }
                role.children = res.data
                //   不建议使用
                // this.getRolesList()
            },
            // 分配权限
            async showSetRightDialog(role) {
                this.roleId = role.id
                // 获取角色的所有权限
                const { data: res } = await this.$http.get('rights/tree')
                if (res.meta.status !== 200) {
                    return this.$message.error('Fail to get data')
                }
                //   获取权限树
                this.rightsList = res.data
                console.log(this.rightsList)
                //   递归获取三级节点的id
                this.getLeafkeys(role, this.defKeys)

                this.setRightDialogVisible = true
            },
            // 通过递归 获取角色下三级权限的 id, 并保存到defKeys数组
            getLeafkeys(node, arr) {
                // 没有children属性，则是三级节点
                if (!node.children) {
                    return arr.push(node.id)
                }
                node.children.forEach(item => this.getLeafkeys(item, arr))
            },
            // 权限对话框关闭事件
            setRightDialogClosed() {
                this.defKeys = []
            },
            // 添加角色对话框的关闭
            addRoleDialogClosed() {
                this.$refs.addRoleFormRef.resetFields()
            },
            // 添加角色
            addRoles() {
                this.$refs.addRoleFormRef.validate(async valid => {
                    if (!valid) return
                    const { data: res } = await this.$http.post('roles', this.addRoleForm)
                    if (res.meta.status !== 201) {
                        this.$message.error('Fail to add roles！')
                    }
                    this.$message.success('Add succeed')
                    this.AddRoleDialogVisible = false
                    this.getRolesList()
                })
            },
            // 删除角色
            async removeRoleById(id) {
                const confirmResult = await this.$confirm(
                    'Delete this role?',
                    'Prompt',
                    {
                        confirmButtonText: 'Confirm',
                        cancelButtonText: 'Cancel',
                        type: 'warning'
                    }
                ).catch(err => err)
                if (confirmResult !== 'confirm') {
                    return this.$message.info('Cancel delete operation')
                }
                const { data: res } = await this.$http.delete('roles/' + id)
                if (res.meta.status !== 200) return this.$message.error('Fail to delete')
                this.$message.success('Delete succeed')
                this.getRolesList()
            },
            // 编辑角色
            async showEditDialog(id) {
                const { data: res } = await this.$http.get('roles/' + id)
                if (res.meta.status !== 200) return this.$message.error('Fail to search roles')
                this.editRoleForm = res.data
                this.editRoleDialogVisible = true
            },
            editRoles() {
                this.$refs.editRoleFormRef.validate(async valid => {
                    // console.log(valid)
                    // 表单预校验失败
                    if (!valid) return
                    const { data: res } = await this.$http.put(
                        'roles/' + this.editRoleForm.roleId,
                        {
                            roleName: this.editRoleForm.roleName,
                            roleDesc: this.editRoleForm.roleDesc
                        }
                    )
                    if (res.meta.status !== 200) {
                        this.$message.error('Fail to edit roles！')
                    }
                    // 隐藏编辑角色对话框
                    this.editRoleDialogVisible = false
                    this.$message.success('Edit succeed！')
                    this.getRolesList()
                })
            },
            // 分配权限
            async allotRights(roleId) {
                // 获得当前选中和半选中的Id
                const keys = [
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedKeys()
                ]
                // join() 方法用于把数组中的所有元素放入一个字符串
                const idStr = keys.join(',')
                const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
                if (res.meta.status !== 200) { return this.$message.error('Fail to allocate roles！') }
                this.$message.success('Allocate succeed!')
                this.getRolesList()
                this.setRightDialogVisible = false
            }
        }
    }
</script>

<style lang="less" scoped>
    .el-tag {
        margin: 7px;
    }

    .bdtop {
        border-top: 1px solid #eee;
    }

    .bdbottom {
        border-bottom: 1px solid #eee;
    }

    .vcenter {
        display: flex;
        align-items: center;
    }
</style>