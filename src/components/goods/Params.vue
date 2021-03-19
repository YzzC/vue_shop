<template>
    <div>
        <!-- 面包屑导航区 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">Home</el-breadcrumb-item>
            <el-breadcrumb-item>Goods Management</el-breadcrumb-item>
            <el-breadcrumb-item>Params List</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区 -->
        <el-card>
            <!-- 头部警告区 -->
            <el-alert title="Attention: Only setting params for category 3!" type="warning" :closable="false" show-icon>
            </el-alert>

            <!-- 选择商品分类区 -->
            <el-row class="cat_optt">
                <el-col>
                    <span>Select category: </span>
                    <!-- 选择商品的级连选择框 -->
                    <el-cascader v-model="selectedCateKeys" :options="cateList" :props="{ expandTrigger: 'hover',
                    value:'cat_id',
                    label:'cat_name',
                    children:'children',
                    checkStrictly:'true'}" @change="handleChange"></el-cascader>
                </el-col>
            </el-row>

            <!-- tab页签区域 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- Dynamic Params -->
                <el-tab-pane label="Dynamic Params" name="many">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">Add
                        Params</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 循环渲染tag标签 -->
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                                <!-- 输入文本框 -->
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                    v-model="scope.row.inputValue" ref="saveTagInput" size="small"
                                    @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <!-- 添加按钮 -->
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+
                                    New Tag
                                </el-button>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="Params" prop="attr_name"></el-table-column>
                        <el-table-column label="Operation">
                            <template slot-scope="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit"
                                    @click="showEditDialog(scope.row.attr_id)">Edit</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete"
                                    @click="removeParams(scope.row.attr_id)">Delete</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>


                <!-- Static Attributes -->
                <el-tab-pane label="Static Attributes" name="only">
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible=true">Add
                        Attributes</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData" border stripe>
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column type="index" label="#"></el-table-column>
                        <el-table-column label="Attributes" prop="attr_name"></el-table-column>
                        <el-table-column label="Operation">
                            <template slot-scope="scope">
                                <el-button size="mini" type="primary" icon="el-icon-edit"
                                    @click="showEditDialog(scope.row.attr_id)">Edit</el-button>
                                <el-button size="mini" type="danger" icon="el-icon-delete"
                                    @click="removeParams(scope.row.attr_id)">Delete</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-card>

        <!-- 添加参数对话框 -->
        <el-dialog :title="'Add '+ titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <!-- 添加参数对话框 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="170px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="addParams">Confirm</el-button>
            </span>
        </el-dialog>

        <!-- 修改参数对话框 -->
        <el-dialog :title="'Edit '+ titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <!-- 修改参数对话框 -->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="170px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">Cancel</el-button>
                <el-button type="primary" @click="editParams">Confirm</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                //商品分类列表
                cateList: [],
                //级连选择框双向绑定到的数组
                selectedCateKeys: [],
                //被激活的页签的名称
                activeName: 'many',
                //动态参数数据
                manyTableData: [],
                //静态属性数据
                onlyTableData: [],
                //控制添加对话框的显示与隐藏
                addDialogVisible: false,
                //添加参数的表单数据对象
                addForm: {
                    attr_name: '',
                },
                //添加表单验证规则对象
                addFormRules: {
                    attr_name: [
                        { required: true, message: 'Please enter Params', trigger: 'blur' }]
                },
                //修改对话框
                editDialogVisible: false,
                //修改的表单数据对象
                editForm: {},
                //修改的表单验证规则对象
                editFormRules: {
                    attr_name: [
                        { required: true, message: 'Please enter Params', trigger: 'blur' }]
                },
            }
        },
        created() {
            this.getCateList()
        },
        methods: {
            //获取所有的商品分类列表
            async getCateList() {
                const { data: res } = await this.$http.get('categories')
                if (res.meta.status !== 200) {
                    return this.$message.error('Fail to get categories')
                }
                this.cateList = res.data
                console.log(this.cateList)
            },
            //级连选择框中项变化，会触发这个函数
            handleChange() {
                this.getParamsData()
            },
            //tab页签点击事件的处理函数
            handleTabClick() {
                console.log(this.activeName)
                this.getParamsData()
            },
            //获取参数的列表数据
            async getParamsData() {
                //证明选中的不是三级分类
                if (this.selectedCateKeys.length !== 3) {
                    this.selectedCateKeys = []
                    this.manyTableData = []
                    this.onlyTableData = []
                    return
                }

                //证明选中的是三级分类
                console.log(this.selectedCateKeys)
                //根据所选分类的id，获取响应参数
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: { sel: this.activeName }
                })
                if (res.meta.status !== 200) {
                    return this.$message.error('Fail to get params')
                }

                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
                    //控制文本框的显示与隐藏
                    item.inputVisible = false
                    //文本框中输入的值
                    item.inputValue = ''
                })
                console.log(res.data)
                if (this.activeName === 'many') {
                    this.manyTableData = res.data
                } else {
                    this.onlyTableData = res.data
                }
            },
            //监听添加对话框的关闭事件
            addDialogClosed() {
                this.$refs.addFormRef.resetFields()
            },
            //点击按钮，添加验证
            addParams() {
                this.$refs.addFormRef.validate(async valid => {
                    if (!valid) return
                    const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
                        attr_name: this.addForm.attr_name,
                        attr_sel: this.activeName
                    })

                    if (res.meta.status !== 201) {
                        return this.$message.error('Fail to add params')
                    }
                    this.$message.success('Add params succeed')
                    this.addDialogVisible = false
                    this.getParamsData()
                })
            },
            //点击按钮，展示修改对话框
            async showEditDialog(attr_id) {
                //查询当前参数的信息
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
                    params: { attr_sel: this.activeName }
                })
                if (res.meta.status !== 200) {
                    return this.$message.error('Fail to get params')
                }
                this.editForm = res.data
                this.editDialogVisible = true
            },
            //重置修改的表单
            editDialogClosed() {
                this.$refs.editFormRef.resetFields()
            },
            //点击按钮，修改操作
            editParams() {
                this.$refs.editFormRef.validate(async valid => {
                    if (!valid) return
                    const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
                        attr_name: this.editForm.attr_name,
                        attr_sel: this.activeName
                    })

                    if (res.meta.status !== 200) {
                        return this.$message.error('Fail to edit params')
                    }
                    this.$message.success('Edit params succeed')
                    this.getParamsData()
                    this.editDialogVisible = false
                })
            },
            //根据id删除对应的参数项
            async removeParams(attr_id) {
                const confirmResult = await this.$confirm('Delete?', 'Prompt', {
                    confirmButtonText: 'Confirm',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                }).catch(err => err)

                if (confirmResult !== 'confirm') {
                    return this.$message.info('Cancel delete operation')
                }

                const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)

                if (res.meta.status !== 200) {
                    return this.$message.error('Fail to delete params')
                }
                this.$message.success('Delete succeed')
                this.getParamsData()
            },
            //文本框失去焦点，或者按下enter都会触发
            async handleInputConfirm(row) {
                if(row.inputValue.trim().length === 0){
                    row.inputValue=''
                    row.inputVisible=false
                    return
                }
                //如果没return，则输入合法内容
                row.attr_vals.push(row.inputValue.trim())
                row.inputValue=''
                row.inputVisible=false
                //需要发起请求来保存操作
                this.saveAttrVals(row)
            },
            //将对attr_vals的操作，保存到数据库
            async saveAttrVals(row){
                //需要发起请求来保存操作
                const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
                    attr_name: row.attr_name,
                    attr_sel: this.activeName,
                    attr_vals: row.attr_vals.join(' ')
                })

                if(res.meta.status!==200){
                    return this.$message.error('Fail to edit params')
                }
                this.$message.success('Edit params succeed')
            },
            //点击按钮，展示文本输入框
            showInput(row) {
                row.inputVisible = true
                //让文本框自动获取焦点
                //$nextTick:页面元素被重新渲染之后，才会指定回调函数
                this.$nextTick(_ => {
                    this.$refs.saveTagInput.$refs.input.focus();
                });
            },
            //删除对应的参数和选项
            handleClose(i, row){
                row.attr_vals.splice(i,1)
                this.saveAttrVals(row)
            },
        },

        //计算属性
        computed: {
            //如果按钮需要被禁用，返回true
            isBtnDisabled() {
                if (this.selectedCateKeys.length !== 3) {
                    return true
                }
                return false
            },
            //当前选中的三级分类的id
            cateId() {
                if (this.selectedCateKeys.length === 3) {
                    return this.selectedCateKeys[2]
                }
                return null
            },
            //动态计算标题的文本
            titleText() {
                if (this.activeName === 'many') {
                    return 'Dynamic Params'
                }
                return 'Static Attributes'
            },

        }
    }
</script>


<style lang="less" scoped>
    .cat_optt {
        margin: 15px 0px;
    }

    .el-tag {
        margin: 10px;
    }

    .input-new-tag {
        width: 120px;
    }
</style>